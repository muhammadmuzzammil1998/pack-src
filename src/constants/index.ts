/** Built-in directory/file patterns excluded by default */
export const DEFAULT_IGNORES: readonly string[] = [
  'node_modules',
  'dist',
  'build',
  'coverage',
  '.git',
  '.next',
  '.nuxt',
  '.cache',
  '.turbo',
  '.parcel-cache',
  '.svelte-kit',
  '.angular',
  '.vercel',
  '.output',
  '.yarn',
  '.pnpm-store',
  '__pycache__',
  '.pytest_cache',
  '.mypy_cache',
  '.ruff_cache',
  '.venv',
  'venv',
  'env',
  'target',
  'bin',
  'obj',
  '.gradle',
  '.idea',
  '.vscode',
  '.DS_Store',
  'Thumbs.db',
];

/** Ignore files loaded in priority order */
export const IGNORE_FILES: readonly string[] = [
  '.packsrcignore',
  '.gitignore',
  '.dockerignore',
  '.npmignore',
];

/** Env-related patterns excluded unless --include-env is passed */
export const ENV_PATTERNS: readonly string[] = [
  '.env',
  '.env.*',
  '*.pem',
  '*.key',
  '*.p12',
  '*.pfx',
  'id_rsa',
  'id_ed25519',
  '*.secret',
  'secrets.*',
];

export const DEFAULT_COMPRESSION = 6;
export const MAX_CONCURRENCY = 32;
