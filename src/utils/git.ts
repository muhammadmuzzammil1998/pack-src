import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Returns the set of files tracked by git under the given root directory.
 * Paths in the set are normalized forward-slash paths relative to `root`.
 *
 * Throws if `root` is not inside a git repository.
 */
export async function getTrackedFiles(root: string): Promise<Set<string>> {
  const absRoot = path.resolve(root);

  let stdout: string;
  try {
    const result = await execFileAsync('git', ['ls-files', '--cached', '--full-name'], {
      cwd: absRoot,
      maxBuffer: 50 * 1024 * 1024,
    });
    stdout = result.stdout;
  } catch (err) {
    const msg = (err as Error).message;
    if (msg.includes('not a git repository') || msg.includes('fatal:')) {
      throw new Error(`--git-tracked requires a git repository, but none was found in: ${absRoot}`);
    }
    throw err;
  }

  const tracked = new Set<string>();
  for (const line of stdout.split('\n')) {
    const trimmed = line.trim();
    if (trimmed) {
      tracked.add(trimmed.split('/').join('/'));
    }
  }
  return tracked;
}
