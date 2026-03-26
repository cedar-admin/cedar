// Cedar Research Orchestrator — Context pack compression

import Anthropic from '@anthropic-ai/sdk';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { toString } from 'mdast-util-to-string';
import yaml from 'js-yaml';
import { readFile, writeFile, log, warn, success, error as logError } from './utils.js';
import type { Manifest, Session } from './types.js';
import type { Root, Content, Table, Code, Heading, List, Paragraph } from 'mdast';

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

/**
 * Data pattern matchers for Pass 1 rule-based extraction
 */
const DATA_PATTERNS = [
  /Title \d+/,
  /Part \d+/,
  /\d+ CFR \d+/,
  /[a-z]+-[a-z]+\.[a-z.]+/,   // domain codes like "compounding.sterile.503b"
  /\d+%/,                       // percentages
  /\$[\d,.]+/,                  // dollar amounts
];

function containsDataPattern(text: string): boolean {
  return DATA_PATTERNS.some(pattern => pattern.test(text));
}

function isKeyValueItem(text: string): boolean {
  return /[:→=]/.test(text);
}

/**
 * Pass 1: Rule-based extraction from markdown AST.
 * Extracts all data-bearing nodes, strips pure prose.
 */
function extractDataNodes(tree: Root): string[] {
  const extracted: string[] = [];

  function walk(node: Content): void {
    switch (node.type) {
      case 'code':
        // All code blocks contain data structures
        extracted.push('```' + ((node as Code).lang ?? '') + '\n' + (node as Code).value + '\n```');
        break;

      case 'table':
        // All tables are data — reconstruct markdown table
        extracted.push(reconstructTable(node as Table));
        break;

      case 'heading':
        // Structural anchors
        extracted.push('#'.repeat((node as Heading).depth) + ' ' + toString(node));
        break;

      case 'list': {
        // Check if list items contain key-value patterns
        const listNode = node as List;
        for (const item of listNode.children) {
          const text = toString(item);
          if (isKeyValueItem(text) || containsDataPattern(text)) {
            extracted.push('- ' + text);
          }
        }
        break;
      }

      case 'paragraph': {
        const text = toString(node as Paragraph);
        if (containsDataPattern(text)) {
          extracted.push(text);
        }
        break;
      }

      default:
        // Walk children if they exist
        if ('children' in node && Array.isArray((node as any).children)) {
          for (const child of (node as any).children) {
            walk(child);
          }
        }
        break;
    }
  }

  for (const child of tree.children) {
    walk(child as Content);
  }

  return extracted;
}

/**
 * Reconstruct a markdown table from an mdast Table node
 */
function reconstructTable(table: Table): string {
  const rows = table.children.map(row =>
    '| ' + row.children.map(cell => toString(cell)).join(' | ') + ' |'
  );
  if (rows.length > 0) {
    // Insert separator after header
    const headerCells = table.children[0].children.length;
    const separator = '| ' + Array(headerCells).fill('---').join(' | ') + ' |';
    rows.splice(1, 0, separator);
  }
  return rows.join('\n');
}

/**
 * Pass 2: AI summarization of remaining prose using Haiku.
 */
async function aiCompress(
  rawOutput: string,
  manifest: Manifest
): Promise<string> {
  const client = getClient();
  const templateContent = await readFile('research/prompts/templates/compression-prompt.md');
  const prompt = templateContent.replace('{raw_output}', rawOutput);

  const response = await client.messages.create({
    model: manifest.meta.compression_model,
    max_tokens: 16384,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
}

/**
 * Validate a context pack against its raw output using Haiku.
 * Returns "COMPLETE" if nothing is missing, or a list of missing items.
 */
export async function validateContextPack(
  rawOutput: string,
  contextPack: string,
  manifest: Manifest
): Promise<{ valid: boolean; issues: string }> {
  const client = getClient();

  const response = await client.messages.create({
    model: manifest.meta.compression_model,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: `Compare these two documents. List any tables, data structures, dictionaries, mappings, domain codes, CFR references, practice-type relevance data, or quantitative values present in the FIRST document but missing from the SECOND document. If everything is preserved, respond with COMPLETE.

## FIRST document (raw research output):

${rawOutput}

## SECOND document (compressed context pack):

${contextPack}`
    }],
  });

  const result = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n')
    .trim();

  return {
    valid: result === 'COMPLETE',
    issues: result,
  };
}

/**
 * Generate a context pack for a completed session.
 * Two-pass: rule-based extraction + AI summarization.
 */
export async function generateContextPack(
  session: Session,
  manifest: Manifest
): Promise<void> {
  if (!session.output_file) {
    throw new Error(`Session ${session.id} has no output_file`);
  }
  if (!session.context_pack_file) {
    throw new Error(`Session ${session.id} has no context_pack_file`);
  }

  log(`Compressing ${session.id}...`);

  // Read raw output
  const rawOutput = await readFile(session.output_file);

  // Pass 1: Rule-based extraction
  const tree = unified().use(remarkParse).parse(rawOutput) as Root;
  const dataNodes = extractDataNodes(tree);
  const pass1Result = dataNodes.join('\n\n');

  log(`  Pass 1: extracted ${dataNodes.length} data nodes`);

  // Pass 2: AI compression
  const contextPack = await aiCompress(rawOutput, manifest);

  log(`  Pass 2: AI compression complete`);

  // Token count check
  const client = getClient();
  const rawTokens = await client.messages.countTokens({
    model: manifest.meta.compression_model,
    messages: [{ role: 'user', content: rawOutput }],
  });
  const packTokens = await client.messages.countTokens({
    model: manifest.meta.compression_model,
    messages: [{ role: 'user', content: contextPack }],
  });

  const ratio = packTokens.input_tokens / rawTokens.input_tokens;
  log(`  Compression ratio: ${(ratio * 100).toFixed(1)}% (${rawTokens.input_tokens} → ${packTokens.input_tokens} tokens)`);

  if (ratio > 0.5) {
    warn(`Context pack is ${(ratio * 100).toFixed(1)}% of raw output — compression may have failed to strip prose`);
  }
  if (ratio < 0.2) {
    warn(`Context pack is only ${(ratio * 100).toFixed(1)}% of raw output — critical data may have been lost`);
  }

  // Write context pack
  await writeFile(session.context_pack_file, contextPack);
  success(`Context pack written to ${session.context_pack_file}`);
}

/**
 * Validate all completed sessions' context packs.
 */
export async function validateAllContextPacks(manifest: Manifest): Promise<void> {
  const completed = manifest.sessions.filter(
    s => s.status === 'complete' as any && s.output_file && s.context_pack_file
  );

  log(`Validating ${completed.length} context packs...\n`);

  for (const session of completed) {
    try {
      const rawOutput = await readFile(session.output_file!);
      const contextPack = await readFile(session.context_pack_file!);

      const result = await validateContextPack(rawOutput, contextPack, manifest);
      if (result.valid) {
        success(`${session.id}: COMPLETE`);
      } else {
        warn(`${session.id}: GAPS FOUND\n${result.issues}\n`);
      }
    } catch (err) {
      logError(`${session.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
