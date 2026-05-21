import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const SIZES = [100, 500, 1000];

function generateFixture(dir: string, fileCount: number): void {
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < fileCount; i++) {
    const sub = join(dir, `src/module-${Math.floor(i / 10)}`);
    mkdirSync(sub, { recursive: true });
    writeFileSync(
      join(sub, `file-${i}.ts`),
      `export const value${i} = ${JSON.stringify({ index: i, data: 'x'.repeat(200) })};\n`,
    );
  }
}

function time(label: string, fn: () => void): number {
  const start = performance.now();
  fn();
  const end = performance.now();
  const ms = Math.round(end - start);
  console.log(`  ${label.padEnd(20)} ${ms}ms`);
  return ms;
}

console.log('\n=== pack-src benchmark ===\n');

for (const size of SIZES) {
  const tmp = mkdtempSync(join(tmpdir(), 'pack-bench-'));
  const src = join(tmp, 'project');
  const out = join(tmp, 'output.zip');

  generateFixture(src, size);

  console.log(`\n--- ${size} files ---`);

  time('pack-src', () => {
    execSync(`node dist/cli.js "${src}" -o "${out}" -q`, { stdio: 'ignore' });
  });

  rmSync(tmp, { recursive: true, force: true });
}

console.log('\nDone.\n');
