export interface PackOptions {
  /** Source directory to pack */
  source: string;
  /** Output ZIP file path */
  output: string;
  /** Compression level 0-9 */
  compression: number;
  /** Preview files without creating ZIP */
  dryRun: boolean;
  /** Verbose logging */
  verbose: boolean;
  /** Include .env files */
  includeEnv: boolean;
  /** Respect .gitignore files */
  gitignore: boolean;
  /** Apply built-in default exclusions */
  defaultIgnore: boolean;
  /** Print statistics after packing */
  stats: boolean;
  /** Only list files, do not create archive */
  listFiles: boolean;
  /** Append timestamp to output filename */
  timestamp: boolean;
  /** Overwrite existing output file */
  overwrite: boolean;
  /** Quiet mode — no output except errors */
  quiet: boolean;
}

export interface CollectedFile {
  /** Absolute path on disk */
  absolutePath: string;
  /** Relative path within archive */
  archivePath: string;
  /** File size in bytes */
  size: number;
}

export interface PackStats {
  /** Number of files packed */
  fileCount: number;
  /** Total uncompressed bytes */
  totalBytes: number;
  /** Total compressed bytes */
  compressedBytes: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Output file path */
  outputPath: string;
}

export interface IgnoreEngineOptions {
  /** Root directory to resolve ignore files from */
  root: string;
  /** Respect .gitignore files */
  gitignore: boolean;
  /** Apply built-in defaults */
  defaultIgnore: boolean;
  /** Include .env files */
  includeEnv: boolean;
  /** Verbose — log ignored files */
  verbose: boolean;
}
