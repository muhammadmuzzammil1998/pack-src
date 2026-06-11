import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { collectFiles } from '../src/core/collector.js';
import { IgnoreEngine } from '../src/core/ignore-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'sample-project');

let tmpDir = '';

afterEach(async () => {
  if (tmpDir) {
    await fsp.rm(tmpDir, { recursive: true, force: true });
    tmpDir = '';
  }
});

async function makeTmp(): Promise<string> {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pack-src-col-test-'));
  return tmpDir;
}

describe('collectFiles', () => {
  it('collects files from sample-project fixture', async () => {
    const engine = new IgnoreEngine({
      root: FIXTURE,
      gitignore: true,
      defaultIgnore: true,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });
    await engine.loadDirectory(FIXTURE);

    const files = await collectFiles(FIXTURE, engine, false);
    expect(files.length).toBeGreaterThan(0);
  });

  it('uses forward slashes in archive paths', async () => {
    const engine = new IgnoreEngine({
      root: FIXTURE,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });

    const files = await collectFiles(FIXTURE, engine, false);
    for (const f of files) {
      expect(f.archivePath).not.toContain('\\');
    }
  });

  it('returns files sorted deterministically', async () => {
    const engine = new IgnoreEngine({
      root: FIXTURE,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });

    const files1 = await collectFiles(FIXTURE, engine, false);
    const files2 = await collectFiles(FIXTURE, engine, false);

    const paths1 = files1.map((f) => f.archivePath);
    const paths2 = files2.map((f) => f.archivePath);
    expect(paths1).toEqual(paths2);
  });

  it('excludes node_modules when defaultIgnore is true', async () => {
    const engine = new IgnoreEngine({
      root: FIXTURE,
      gitignore: false,
      defaultIgnore: true,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });

    const files = await collectFiles(FIXTURE, engine, false);
    const hasMod = files.some((f) => f.archivePath.startsWith('node_modules'));
    expect(hasMod).toBe(false);
  });
});

describe('collectFiles — git-tracked filter', () => {
  it('only collects files present in the trackedFiles set', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, 'tracked.ts'), '// tracked');
    await fsp.writeFile(path.join(dir, 'untracked.ts'), '// untracked');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    const tracked = new Set(['tracked.ts']);
    const files = await collectFiles(dir, engine, false, tracked);

    const names = files.map((f) => f.archivePath);
    expect(names).toContain('tracked.ts');
    expect(names).not.toContain('untracked.ts');
  });

  it('returns all files when trackedFiles is undefined (no filter)', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, 'a.ts'), '');
    await fsp.writeFile(path.join(dir, 'b.ts'), '');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    const files = await collectFiles(dir, engine, false);
    expect(files.length).toBe(2);
  });

  it('force-included files bypass the tracked filter', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, '.packsrcinclude'), 'untracked.ts\n');
    await fsp.writeFile(path.join(dir, 'tracked.ts'), '');
    await fsp.writeFile(path.join(dir, 'untracked.ts'), '');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      includeGit: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    const tracked = new Set(['tracked.ts']);
    const files = await collectFiles(dir, engine, false, tracked);

    const names = files.map((f) => f.archivePath);
    expect(names).toContain('tracked.ts');
    expect(names).toContain('untracked.ts');
  });
});
