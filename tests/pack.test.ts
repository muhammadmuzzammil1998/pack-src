import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { runPack } from '../src/commands/pack.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'sample-project');

let tmpDir: string;

afterEach(async () => {
  if (tmpDir) {
    await fsp.rm(tmpDir, { recursive: true, force: true });
  }
});

async function makeTmp(): Promise<string> {
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pack-src-test-'));
  return tmpDir;
}

describe('runPack — dry-run', () => {
  it('does not create a zip file in dry-run mode', async () => {
    const dir = await makeTmp();
    const output = path.join(dir, 'out.zip');

    await runPack({
      source: FIXTURE,
      output,
      dryRun: true,
      quiet: true,
    });

    await expect(fsp.access(output)).rejects.toThrow();
  });
});

describe('runPack — zip creation', () => {
  it('creates a zip file', async () => {
    const dir = await makeTmp();
    const output = path.join(dir, 'out.zip');

    await runPack({
      source: FIXTURE,
      output,
      quiet: true,
    });

    const stat = await fsp.stat(output);
    expect(stat.size).toBeGreaterThan(0);
  });

  it('throws if output already exists and --overwrite not set', async () => {
    const dir = await makeTmp();
    const output = path.join(dir, 'out.zip');

    await runPack({ source: FIXTURE, output, quiet: true });

    await expect(runPack({ source: FIXTURE, output, quiet: true })).rejects.toThrow(
      /already exists/,
    );
  });

  it('overwrites when --overwrite is set', async () => {
    const dir = await makeTmp();
    const output = path.join(dir, 'out.zip');

    await runPack({ source: FIXTURE, output, quiet: true });
    await runPack({ source: FIXTURE, output, overwrite: true, quiet: true });

    const stat = await fsp.stat(output);
    expect(stat.size).toBeGreaterThan(0);
  });
});

describe('runPack — invalid source', () => {
  it('throws for missing source directory', async () => {
    await expect(runPack({ source: '/nonexistent/path', quiet: true })).rejects.toThrow(
      /not found/,
    );
  });
});
