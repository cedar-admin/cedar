#!/usr/bin/env node

/**
 * Cedar Design Token Audit
 * 
 * Scans .tsx, .ts, and .css files for hardcoded values that should use design tokens.
 * Run: node scripts/token-audit.js
 * Exit code: 0 = pass, 1 = violations found
 * 
 * Used as a Claude Code hook to enforce token usage before commits.
 */

const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────────

const SCAN_DIRS = ['src', 'app'];
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.css'];
const IGNORE_DIRS = ['node_modules', '.next', 'dist', '.git'];
const IGNORE_FILES = ['globals.css', 'types.ts', 'types.d.ts', 'env.ts'];

// ── Violation patterns ─────────────────────────────────────────────────────────

const PATTERNS = [
  {
    name: 'Hardcoded hex color',
    regex: /(?:className|class|style).*?#[0-9a-fA-F]{3,8}/g,
    message: 'Use semantic color tokens (bg-primary, text-foreground, etc.)',
    severity: 'error',
  },
  {
    name: 'Hardcoded rgb/rgba',
    regex: /(?:className|class|style).*?rgba?\(\s*\d/g,
    message: 'Use semantic color tokens from globals.css',
    severity: 'error',
  },
  {
    name: 'Hardcoded oklch in component',
    regex: /(?:className|class|style).*?oklch\(/g,
    message: 'oklch values belong in globals.css tokens only',
    severity: 'error',
  },
  {
    name: 'Arbitrary Tailwind color',
    regex: /(?:bg|text|border|ring|fill|stroke)-\[#[0-9a-fA-F]+\]/g,
    message: 'Use semantic color token instead of arbitrary value',
    severity: 'error',
  },
  {
    name: 'Arbitrary pixel spacing',
    regex: /(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy]|w|h|min-w|min-h|max-w|max-h|top|right|bottom|left|inset)-\[\d+px\]/g,
    message: 'Use spacing scale (p-4, gap-2, etc.) from token-reference.md',
    severity: 'error',
  },
  {
    name: 'Arbitrary rem spacing',
    regex: /(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|space-[xy])-\[\d+\.?\d*rem\]/g,
    message: 'Use spacing scale from token-reference.md',
    severity: 'warning',
  },
  {
    name: 'Arbitrary z-index',
    regex: /z-\[\d+\]/g,
    message: 'Use z-index scale (z-[0], z-[10], z-[40], z-[50], etc.)',
    severity: 'warning',
  },
  {
    name: 'Arbitrary border-radius',
    regex: /rounded-\[\d+px\]/g,
    message: 'Use radius scale (rounded-sm through rounded-4xl)',
    severity: 'warning',
  },
  {
    name: 'Inline style with px values',
    regex: /style\s*=\s*\{\{[^}]*\d+px/g,
    message: 'Prefer Tailwind classes. Use inline styles only for dynamic values.',
    severity: 'warning',
  },
  {
    name: 'Hardcoded duration',
    regex: /duration-\[\d+ms\]/g,
    message: 'Use motion duration tokens (--duration-fast, --duration-base, etc.)',
    severity: 'warning',
  },
];

// Patterns that are OK (allowlist for legitimate uses)
const ALLOWLIST = [
  /calc\(var\(--/,           // calc() using CSS variables is fine
  /max\(0px,/,               // max(0px, ...) for nested radius is fine
  /var\(--/,                 // CSS variable references are fine
  /data-\[/,                 // data attribute selectors are fine
  /\/\/.*/,                  // Comments
  /^\s*\*/,                  // JSDoc comments
];

// ── Scanner ────────────────────────────────────────────────────────────────────

function getFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.includes(entry.name)) continue;
      files.push(...getFiles(fullPath));
    } else if (entry.isFile()) {
      if (IGNORE_FILES.includes(entry.name)) continue;
      if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

function isAllowlisted(line) {
  return ALLOWLIST.some(pattern => pattern.test(line));
}

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip allowlisted lines
    if (isAllowlisted(line)) continue;
    
    for (const pattern of PATTERNS) {
      const matches = line.match(pattern.regex);
      if (matches) {
        for (const match of matches) {
          // Double-check each match against allowlist
          if (isAllowlisted(match)) continue;
          
          violations.push({
            file: filePath,
            line: lineNum,
            severity: pattern.severity,
            rule: pattern.name,
            match: match.trim().substring(0, 60),
            message: pattern.message,
          });
        }
      }
    }
  }
  
  return violations;
}

// ── Main ───────────────────────────────────────────────────────────────────────

function main() {
  const allViolations = [];
  
  for (const dir of SCAN_DIRS) {
    const files = getFiles(dir);
    for (const file of files) {
      const violations = auditFile(file);
      allViolations.push(...violations);
    }
  }
  
  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');
  
  if (allViolations.length === 0) {
    console.log('✓ Token audit passed — no violations found.');
    process.exit(0);
  }
  
  console.log(`\n╭─ Cedar Token Audit ────────────────────────────────────╮`);
  console.log(`│  ${errors.length} error(s), ${warnings.length} warning(s)${' '.repeat(Math.max(0, 36 - String(errors.length).length - String(warnings.length).length))}│`);
  console.log(`╰────────────────────────────────────────────────────────╯\n`);
  
  for (const v of allViolations) {
    const icon = v.severity === 'error' ? '✖' : '⚠';
    const label = v.severity === 'error' ? 'ERROR' : 'WARN ';
    console.log(`  ${icon} ${label}  ${v.file}:${v.line}`);
    console.log(`           ${v.rule}: ${v.match}`);
    console.log(`           → ${v.message}\n`);
  }
  
  if (errors.length > 0) {
    console.log(`\n  ${errors.length} error(s) must be fixed before committing.\n`);
    process.exit(1);
  } else {
    console.log(`\n  ${warnings.length} warning(s) — review recommended but not blocking.\n`);
    process.exit(0);
  }
}

main();
