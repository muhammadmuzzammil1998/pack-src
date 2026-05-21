import { describe, it, expect } from 'vitest';
import { formatBytes, formatDuration, formatRatio } from '../src/utils/format.js';

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1.00 KB');
  });

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
  });

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
  });
});

describe('formatDuration', () => {
  it('formats milliseconds under 1s', () => {
    expect(formatDuration(750)).toBe('750ms');
  });

  it('formats seconds', () => {
    expect(formatDuration(2500)).toBe('2.50s');
  });
});

describe('formatRatio', () => {
  it('returns 0% for zero original', () => {
    expect(formatRatio(0, 0)).toBe('0%');
  });

  it('calculates savings correctly', () => {
    expect(formatRatio(1000, 500)).toBe('50.0%');
  });

  it('handles no savings', () => {
    expect(formatRatio(1000, 1000)).toBe('0.0%');
  });
});
