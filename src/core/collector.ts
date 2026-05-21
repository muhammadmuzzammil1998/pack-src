import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { MAX_CONCURRENCY } from '../constants/index.js';
import type { CollectedFile } from '../types/index.js';
import { normalizePath, toArchivePath } from '../utils/paths.js';
import type { IgnoreEngine } from './ignore-engine.js';

/** Limit concurrency for stat calls */
async function withConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let idx = 0;
  async function worker(): Promise<void> {
    while (idx < items.length) {
      const item = items[idx++];
      if (item !== undefined) await fn(item);
    }
  }
  const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
  await Promise.all(workers);
}

/**
 * Collect all files under `root` that are not excluded by the IgnoreEngine.
 * Returns files sorted deterministically by archive path.
 */
export async function collectFiles(
  root: string,
  engine: IgnoreEngine,
  verbose: boolean,
): Promise<CollectedFile[]> {
  const absRoot = path.resolve(root);

  // Discover all files using fast-glob with dot files included
  const rawPaths = await fg('**/*', {
    cwd: absRoot,
    dot: true,
    onlyFiles: false,
    followSymbolicLinks: false,
    absolute: true,
    suppressErrors: true,
  });

  // Collect directories to preload ignore files from
  const dirs = new Set<string>();
  for (const p of rawPaths) {
    dirs.add(path.dirname(p));
  }
  // Load ignore files for each directory encountered
  await withConcurrency([...dirs], MAX_CONCURRENCY, (dir) => engine.loadDirectory(dir));

  const collected: CollectedFile[] = [];

  await withConcurrency(rawPaths, MAX_CONCURRENCY, async (absPath) => {
    // Skip directories — we only pack files
    let stat: Awaited<ReturnType<typeof fs.lstat>>;
    try {
      stat = await fs.lstat(absPath);
    } catch {
      return;
    }

    if (stat.isDirectory()) return;

    // Skip symlinks for safety (configurable in future)
    if (stat.isSymbolicLink()) return;

    if (engine.isIgnored(absPath)) return;

    const archivePath = toArchivePath(absPath, absRoot);

    if (verbose) {
      process.stderr.write(`  [include] ${normalizePath(archivePath)}\n`);
    }

    collected.push({ absolutePath: absPath, archivePath, size: stat.size });
  });

  // Sort deterministically by archive path for reproducible archives
  collected.sort((a, b) => a.archivePath.localeCompare(b.archivePath));

  return collected;
}
