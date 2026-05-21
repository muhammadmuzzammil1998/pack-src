import { describe, it, expect } from 'vitest';
import { normalizePath, toArchivePath, isSafePath, todayString } from '../src/utils/paths.js';
import path from 'node:path';

describe('normalizePath', () => {
  it('converts backslashes to forward slashes', () => {
    expect(normalizePath('foo\\bar\\baz.ts')).toBe('foo/bar/baz.ts');
  });

  it('leaves forward slashes unchanged', () => {
    expect(normalizePath('foo/bar/baz.ts')).toBe('foo/bar/baz.ts');
  });
});

describe('toArchivePath', () => {
  it('returns relative path with forward slashes', () => {
    const root = path.join('/tmp', 'project');
    const file = path.join('/tmp', 'project', 'src', 'index.ts');
    expect(toArchivePath(file, root)).toBe('src/index.ts');
  });
});

describe('isSafePath', () => {
  it('accepts normal relative paths', () => {
    expect(isSafePath('src/index.ts')).toBe(true);
    expect(isSafePath('README.md')).toBe(true);
  });

  it('rejects path traversal attempts', () => {
    expect(isSafePath('../etc/passwd')).toBe(false);
    expect(isSafePath('../../secret')).toBe(false);
  });

  it('rejects absolute paths', () => {
    expect(isSafePath('/etc/passwd')).toBe(false);
  });
});

describe('todayString', () => {
  it('returns YYYY-MM-DD format', () => {
    const result = todayString();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
