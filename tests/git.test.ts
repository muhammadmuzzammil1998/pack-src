import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { getTrackedFiles } from '../src/utils/git.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

let tmpDir = '';

afterEach(async () => {
  if (tmpDir) {
    await fsp.rm(tmpDir, { recursive: true, force: true });
    tmpDir = '';
  }
});

describe('getTrackedFiles', () => {
  it('returns a Set of tracked file paths relative to root', async () => {
    const tracked = await getTrackedFiles(REPO_ROOT);
    expect(tracked).toBeInstanceOf(Set);
    expect(tracked.size).toBeGreaterThan(0);
  });

  it('contains known tracked files', async () => {
    const tracked = await getTrackedFiles(REPO_ROOT);
    expect(tracked.has('package.json')).toBe(true);
    expect(tracked.has('src/index.ts')).toBe(true);
  });

  it('does not contain untracked or ignored paths', async () => {
    const tracked = await getTrackedFiles(REPO_ROOT);
    expect(tracked.has('node_modules/some-pkg/index.js')).toBe(false);
  });

  it('throws a descriptive error for a non-git directory', async () => {
    tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pack-src-git-test-'));
    await expect(getTrackedFiles(tmpDir)).rejects.toThrow(
      '--git-tracked requires a git repository',
    );
  });
});
