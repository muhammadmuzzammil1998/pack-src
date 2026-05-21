/** Format bytes into a human-readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exp);
  const unit = units[exp] ?? 'B';
  return `${value.toFixed(exp === 0 ? 0 : 2)} ${unit}`;
}

/** Format milliseconds into a human-readable duration */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${String(ms)}ms`;
  const s = (ms / 1000).toFixed(2);
  return `${s}s`;
}

/** Format a compression ratio as percentage saved */
export function formatRatio(original: number, compressed: number): string {
  if (original === 0) return '0%';
  const ratio = ((1 - compressed / original) * 100).toFixed(1);
  return `${ratio}%`;
}

/** Pad a string to a fixed width */
export function padEnd(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length);
}
