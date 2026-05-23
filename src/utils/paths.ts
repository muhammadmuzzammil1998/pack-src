import path from 'node:path';

/** Normalize a filesystem path to use forward slashes */
export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/** Convert an absolute path to a path relative to a root, using forward slashes */
export function toArchivePath(absolutePath: string, root: string): string {
  const rel = path.relative(root, absolutePath);
  return normalizePath(rel);
}

/**
 * Validate that an archive entry path does not escape the archive root
 * (zip-slip prevention).
 */
export function isSafePath(archivePath: string): boolean {
  const normalized = path.normalize(archivePath);
  return !normalized.startsWith('..') && !path.isAbsolute(normalized);
}

/** Return YYYY-MM-DD string for the current date (local time) */
export function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${String(y)}-${m}-${d}`;
}
