import { describe, it, expect, afterEach } from 'vitest';
import path from 'node:path';
import fsp from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { IgnoreEngine } from '../src/core/ignore-engine.js';
import type { IgnoreEngineOptions } from '../src/types/index.js';

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
  tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'pack-src-ie-test-'));
  return tmpDir;
}

function makeEngine(overrides?: Partial<IgnoreEngineOptions>) {
  return new IgnoreEngine({
    root: FIXTURE,
    gitignore: true,
    defaultIgnore: true,
    includeEnv: false,
    verbose: false,
    ...overrides,
  });
}

describe('IgnoreEngine — built-in defaults', () => {
  it('ignores node_modules', () => {
    const engine = makeEngine();
    const p = path.join(FIXTURE, 'node_modules', 'lodash', 'index.js');
    expect(engine.isIgnored(p)).toBe(true);
  });

  it('ignores dist directory', () => {
    const engine = makeEngine();
    const p = path.join(FIXTURE, 'dist', 'index.js');
    expect(engine.isIgnored(p)).toBe(true);
  });

  it('does not ignore src files', () => {
    const engine = makeEngine();
    const p = path.join(FIXTURE, 'src', 'index.ts');
    expect(engine.isIgnored(p)).toBe(false);
  });
});

describe('IgnoreEngine — env files', () => {
  it('ignores .env by default', () => {
    const engine = makeEngine();
    const p = path.join(FIXTURE, '.env');
    expect(engine.isIgnored(p)).toBe(true);
  });

  it('includes .env when includeEnv is true', () => {
    const engine = makeEngine({ includeEnv: true });
    const p = path.join(FIXTURE, '.env');
    expect(engine.isIgnored(p)).toBe(false);
  });
});

describe('IgnoreEngine — .gitignore', () => {
  it('ignores files listed in .gitignore after loading directory', async () => {
    const engine = makeEngine();
    await engine.loadDirectory(FIXTURE);
    const p = path.join(FIXTURE, 'debug.log');
    expect(engine.isIgnored(p)).toBe(true);
  });

  it('respects no-gitignore flag', async () => {
    const engine = makeEngine({ gitignore: false });
    await engine.loadDirectory(FIXTURE);
    // dist is still caught by built-in defaults
    const p = path.join(FIXTURE, 'dist', 'index.js');
    expect(engine.isIgnored(p)).toBe(true);
  });
});

describe('IgnoreEngine — default ignore disabled', () => {
  it('does not ignore node_modules when defaultIgnore is false', () => {
    const engine = makeEngine({ defaultIgnore: false });
    const p = path.join(FIXTURE, 'node_modules', 'pkg', 'index.js');
    expect(engine.isIgnored(p)).toBe(false);
  });
});

describe('IgnoreEngine — .packsrcinclude', () => {
  it('force-includes a file that would otherwise be ignored', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, '.packsrcinclude'), 'dist/important.js\n');
    await fsp.mkdir(path.join(dir, 'dist'), { recursive: true });
    await fsp.writeFile(path.join(dir, 'dist', 'important.js'), '');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: true,
      includeEnv: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    const target = path.join(dir, 'dist', 'important.js');
    expect(engine.isForceIncluded(target)).toBe(true);
    expect(engine.isIgnored(target)).toBe(false);
  });

  it('does not force-include files not listed in .packsrcinclude', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, '.packsrcinclude'), 'dist/important.js\n');
    await fsp.mkdir(path.join(dir, 'dist'), { recursive: true });
    await fsp.writeFile(path.join(dir, 'dist', 'other.js'), '');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: true,
      includeEnv: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    const other = path.join(dir, 'dist', 'other.js');
    expect(engine.isForceIncluded(other)).toBe(false);
    expect(engine.isIgnored(other)).toBe(true);
  });

  it('returns false from isForceIncluded when no .packsrcinclude exists', async () => {
    const dir = await makeTmp();
    await fsp.writeFile(path.join(dir, 'index.ts'), '');

    const engine = new IgnoreEngine({
      root: dir,
      gitignore: false,
      defaultIgnore: false,
      includeEnv: false,
      verbose: false,
    });
    await engine.loadDirectory(dir);

    expect(engine.isForceIncluded(path.join(dir, 'index.ts'))).toBe(false);
  });
});
