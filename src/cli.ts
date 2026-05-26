import { program } from 'commander';
import { DEFAULT_COMPRESSION } from './constants/index.js';
import { runPack } from './commands/pack.js';

const pkg = await import('../package.json', { with: { type: 'json' } });

program
  .name('pack-src')
  .description('Recursively pack source code directories into clean ZIP archives')
  .version((pkg.default as { version: string }).version, '-v, --version')
  .argument('[source]', 'Source directory to pack', '.')
  .option('-o, --output <file>', 'Output ZIP file path')
  .option('-c, --compression <level>', 'Compression level (0-9)', String(DEFAULT_COMPRESSION))
  .option('--dry-run', 'Preview files without creating archive')
  .option('--verbose', 'Verbose output')
  .option('--include-env', 'Include .env and secret files')
  .option('--include-git', 'Include .git directory in archive')
  .option('--no-gitignore', 'Do not use .gitignore files')
  .option('--no-default-ignore', 'Do not apply built-in exclusions')
  .option('--stats', 'Print compression statistics')
  .option('--list-files', 'List files that would be included')
  .option('--timestamp', 'Append date to output filename')
  .option('--overwrite', 'Overwrite existing output file')
  .option('-q, --quiet', 'Suppress all output except errors')
  .action(async (source: string, opts: Record<string, unknown>) => {
    try {
      await runPack({
        source,
        output: (opts['output'] as string | undefined) ?? '',
        compression: parseInt(
          (opts['compression'] as string | undefined) ?? String(DEFAULT_COMPRESSION),
          10,
        ),
        dryRun: Boolean(opts['dryRun']),
        verbose: Boolean(opts['verbose']),
        includeEnv: Boolean(opts['includeEnv']),
        gitignore: opts['gitignore'] !== false,
        defaultIgnore: opts['defaultIgnore'] !== false,
        stats: Boolean(opts['stats']),
        listFiles: Boolean(opts['listFiles']),
        timestamp: Boolean(opts['timestamp']),
        overwrite: Boolean(opts['overwrite']),
        quiet: Boolean(opts['quiet']),
        includeGit: Boolean(opts['includeGit']),
      });
    } catch (err) {
      process.stderr.write(`\n${(err as Error).message}\n`);
      process.exit(1);
    }
  });

program.parse();
