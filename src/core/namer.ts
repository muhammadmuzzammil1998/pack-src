import path from 'node:path';
import { todayString } from '../utils/paths.js';

export interface NamerOptions {
  source: string;
  outputOverride?: string | undefined;
  timestamp: boolean;
}

/**
 * Resolve the output ZIP file path based on source directory name and flags.
 */
export function resolveOutputPath(opts: NamerOptions): string {
  if (opts.outputOverride) {
    // Ensure .zip extension
    const out = opts.outputOverride;
    return out.endsWith('.zip') ? out : `${out}.zip`;
  }

  const dirName = path.basename(path.resolve(opts.source));
  const base = opts.timestamp ? `${dirName}-${todayString()}` : dirName;
  return path.resolve(process.cwd(), `${base}.zip`);
}
