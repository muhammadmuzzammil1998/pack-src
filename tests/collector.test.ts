import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectFiles } from '../src/core/collector.js';
import { IgnoreEngine } from '../src/core/ignore-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'sample-project');

describe('collectFiles', () => {
  it('collects files from sample-project fixture', async () => {
    const engine = new IgnoreEngine({
      root: FIXTURE,
      gitignore: true,
      defaultIgnore: true,
      includeEnv: false,
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
      verbose: false,
    });

    const files = await collectFiles(FIXTURE, engine, false);
    const hasMod = files.some((f) => f.archivePath.startsWith('node_modules'));
    expect(hasMod).toBe(false);
  });
});
