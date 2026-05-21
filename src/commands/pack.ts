import fsp from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import ora from 'ora';
import { DEFAULT_COMPRESSION } from '../constants/index.js';
import { collectFiles } from '../core/collector.js';
import { IgnoreEngine } from '../core/ignore-engine.js';
import { resolveOutputPath } from '../core/namer.js';
import { printStats } from '../core/stats.js';
import { createZip } from '../core/zipper.js';
import type { PackOptions } from '../types/index.js';
import { formatBytes } from '../utils/format.js';

export async function runPack(opts: Partial<PackOptions> & { source: string }): Promise<void> {
  const options: PackOptions = {
    source: opts.source,
    output: opts.output ?? '',
    compression: opts.compression ?? DEFAULT_COMPRESSION,
    dryRun: opts.dryRun ?? false,
    verbose: opts.verbose ?? false,
    includeEnv: opts.includeEnv ?? false,
    gitignore: opts.gitignore ?? true,
    defaultIgnore: opts.defaultIgnore ?? true,
    stats: opts.stats ?? false,
    listFiles: opts.listFiles ?? false,
    timestamp: opts.timestamp ?? false,
    overwrite: opts.overwrite ?? false,
    quiet: opts.quiet ?? false,
  };

  const absSource = path.resolve(options.source);

  // Verify source directory exists
  try {
    const stat = await fsp.stat(absSource);
    if (!stat.isDirectory()) {
      throw new Error(`Source path is not a directory: ${absSource}`);
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Source directory not found: ${absSource}`);
    }
    throw err;
  }

  const outputPath = resolveOutputPath({
    source: options.source,
    outputOverride: options.output || undefined,
    timestamp: options.timestamp,
  });

  // Check for accidental overwrite
  if (!options.overwrite && !options.dryRun && !options.listFiles) {
    try {
      await fsp.access(outputPath);
      throw new Error(`Output file already exists: ${outputPath}\nUse --overwrite to replace it.`);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  const engine = new IgnoreEngine({
    root: absSource,
    gitignore: options.gitignore,
    defaultIgnore: options.defaultIgnore,
    includeEnv: options.includeEnv,
    verbose: options.verbose,
  });

  // Preload root-level ignore files
  await engine.loadDirectory(absSource);

  if (!options.quiet) {
    process.stdout.write(
      `${chalk.bold.cyan('pack-src')} ${chalk.dim('→')} ${path.basename(outputPath)}\n`,
    );
  }

  const spinner = options.quiet ? null : ora({ text: 'Collecting files…', spinner: 'dots' });
  spinner?.start();

  const files = await collectFiles(absSource, engine, options.verbose);

  spinner?.stop();

  if (files.length === 0) {
    process.stdout.write(chalk.yellow('  No files collected. Nothing to pack.\n'));
    return;
  }

  // --list-files mode
  if (options.listFiles || options.dryRun) {
    for (const f of files) {
      process.stdout.write(`  ${f.archivePath}  ${chalk.dim(formatBytes(f.size))}\n`);
    }
    if (!options.quiet) {
      process.stdout.write(
        chalk.dim(`\n  ${String(files.length)} files, dry-run — no archive created.\n`),
      );
    }
    return;
  }

  const zipSpinner = options.quiet
    ? null
    : ora({ text: `Packing ${String(files.length)} files…`, spinner: 'dots' });
  zipSpinner?.start();

  const startTime = Date.now();
  const packStats = await createZip(
    {
      outputPath,
      compression: options.compression,
      files,
      onProgress: (current, total) => {
        if (zipSpinner) {
          zipSpinner.text = `Packing… ${String(current)}/${String(total)}`;
        }
      },
    },
    startTime,
  );

  zipSpinner?.stop();

  if (!options.quiet) {
    process.stdout.write(
      `${chalk.green('✔')} Packed ${chalk.bold(packStats.fileCount)} files → ` +
        `${chalk.bold(outputPath)} ${chalk.dim(`(${formatBytes(packStats.compressedBytes)})`)}\n`,
    );
  }

  if (options.stats) {
    printStats(packStats);
  }
}
