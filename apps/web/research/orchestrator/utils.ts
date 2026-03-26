// Cedar Research Orchestrator — Shared utilities

import { readFile as fsReadFile, writeFile as fsWriteFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Resolve to the Cedar repo root (two levels up from orchestrator/) */
export const REPO_ROOT = path.resolve(__dirname, '..', '..');

/** Resolve a path relative to repo root */
export function resolveFromRoot(relativePath: string): string {
  return path.resolve(REPO_ROOT, relativePath);
}

/** Read a file, resolving from repo root if relative */
export async function readFile(filePath: string): Promise<string> {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : resolveFromRoot(filePath);
  return fsReadFile(resolved, 'utf-8');
}

/** Write a file, creating parent directories if needed */
export async function writeFile(filePath: string, content: string): Promise<void> {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : resolveFromRoot(filePath);
  const dir = path.dirname(resolved);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  await fsWriteFile(resolved, content, 'utf-8');
}

/** Check if a file exists (relative to repo root) */
export function fileExists(filePath: string): boolean {
  const resolved = path.isAbsolute(filePath)
    ? filePath
    : resolveFromRoot(filePath);
  return existsSync(resolved);
}

/** Logging helpers */
export function log(message: string): void {
  console.log(message);
}

export function warn(message: string): void {
  console.warn(`⚠️  ${message}`);
}

export function error(message: string): void {
  console.error(`❌ ${message}`);
}

export function success(message: string): void {
  console.log(`✅ ${message}`);
}
