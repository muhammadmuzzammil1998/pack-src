import chalk from 'chalk';
import type { PackStats } from '../types/index.js';
import { formatBytes, formatDuration, formatRatio } from '../utils/format.js';

/** Print a formatted statistics table to stdout */
export function printStats(stats: PackStats): void {
  const lines = [
    '',
    chalk.bold('  Pack statistics'),
    chalk.dim('  ─────────────────────────────────────'),
    `  ${chalk.cyan('Files packed')}    ${stats.fileCount.toLocaleString()}`,
    `  ${chalk.cyan('Original size')}   ${formatBytes(stats.totalBytes)}`,
    `  ${chalk.cyan('Compressed')}      ${formatBytes(stats.compressedBytes)}`,
    `  ${chalk.cyan('Savings')}         ${formatRatio(stats.totalBytes, stats.compressedBytes)}`,
    `  ${chalk.cyan('Duration')}        ${formatDuration(stats.durationMs)}`,
    `  ${chalk.cyan('Output')}          ${stats.outputPath}`,
    '',
  ];
  process.stdout.write(lines.join('\n') + '\n');
}
