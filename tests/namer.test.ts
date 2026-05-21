import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { resolveOutputPath } from '../src/core/namer.js';

describe('resolveOutputPath', () => {
  it('derives name from source directory', () => {
    const result = resolveOutputPath({ source: '/tmp/my-project', timestamp: false });
    expect(result).toMatch(/my-project\.zip$/);
  });

  it('appends .zip to override if missing', () => {
    const result = resolveOutputPath({
      source: '/tmp/my-project',
      outputOverride: 'output/archive',
      timestamp: false,
    });
    expect(result).toMatch(/archive\.zip$/);
  });

  it('does not double-append .zip', () => {
    const result = resolveOutputPath({
      source: '/tmp/my-project',
      outputOverride: 'output/archive.zip',
      timestamp: false,
    });
    expect(result).toMatch(/archive\.zip$/);
    expect(result).not.toMatch(/archive\.zip\.zip$/);
  });

  it('appends timestamp when requested', () => {
    const result = resolveOutputPath({ source: '/tmp/my-project', timestamp: true });
    expect(result).toMatch(/my-project-\d{4}-\d{2}-\d{2}\.zip$/);
  });

  it('uses absolute path for output', () => {
    const result = resolveOutputPath({ source: '.', timestamp: false });
    expect(path.isAbsolute(result)).toBe(true);
  });
});
