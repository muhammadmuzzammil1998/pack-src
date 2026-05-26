import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { IgnoreEngine } from '../src/core/ignore-engine.js';
import type { IgnoreEngineOptions } from '../src/types/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(__dirname, 'fixtures', 'sample-project');

function makeEngine(overrides?: Partial<IgnoreEngineOptions>) {
  return new IgnoreEngine({
    root: FIXTURE,
    gitignore: true,
    defaultIgnore: true,
    includeEnv: false,
    includeGit: false,
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

describe('IgnoreEngine — include-git', () => {
  it('ignores .git by default', () => {
    const engine = makeEngine();
    const p = path.join(FIXTURE, '.git', 'config');
    expect(engine.isIgnored(p)).toBe(true);
  });

  it('includes .git when includeGit is true', () => {
    const engine = makeEngine({ includeGit: true });
    const p = path.join(FIXTURE, '.git', 'config');
    expect(engine.isIgnored(p)).toBe(false);
  });

  it('still ignores node_modules when includeGit is true', () => {
    const engine = makeEngine({ includeGit: true });
    const p = path.join(FIXTURE, 'node_modules', 'pkg', 'index.js');
    expect(engine.isIgnored(p)).toBe(true);
  });
});
