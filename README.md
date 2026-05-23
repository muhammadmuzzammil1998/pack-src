# pack-src

[![npm version](https://img.shields.io/npm/v/pack-src.svg)](https://www.npmjs.com/package/pack-src)
[![CI](https://github.com/muhammadmuzzammil1998/pack-src/actions/workflows/ci.yml/badge.svg)](https://github.com/muhammadmuzzammil1998/pack-src/actions/workflows/ci.yml)
[![Release](https://github.com/muhammadmuzzammil1998/pack-src/actions/workflows/release.yml/badge.svg)](https://github.com/muhammadmuzzammil1998/pack-src/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js: >=22](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)

> Recursively pack source code directories into clean ZIP archives — fast, smart, and ignore-aware.

---

## Features

- **Smart ignoring** — respects `.packsrcignore`, `.gitignore`, `.dockerignore`, `.npmignore` and built-in defaults
- **Streaming ZIP** — never loads entire files into memory; scales to large repos
- **Deterministic output** — files are sorted for reproducible archives
- **Polished CLI** — progress spinners, colored output, human-readable stats
- **Zip-slip safe** — all paths are validated before archiving
- **Zero config** — sensible defaults out of the box

---

## Installation

```bash
# npm (global)
npm install -g pack-src

# pnpm
pnpm add -g pack-src

# yarn
yarn global add pack-src

# npx (no install)
npx pack-src .
```

---

## Usage

```bash
# Pack current directory
pack-src

# Pack a specific directory
pack-src ./my-project

# Specify output file
pack-src ./my-project -o snapshot.zip

# With timestamp in filename
pack-src ./my-project --timestamp
# → my-project-2026-05-21.zip

# Dry run — preview files without creating archive
pack-src ./my-project --dry-run

# List files only
pack-src ./my-project --list-files

# Print compression statistics
pack-src ./my-project --stats

# Set compression level (0 = store, 9 = maximum)
pack-src ./my-project -c 9

# Include .env files (excluded by default)
pack-src ./my-project --include-env

# Disable .gitignore
pack-src ./my-project --no-gitignore

# Disable all built-in exclusions
pack-src ./my-project --no-default-ignore

# Overwrite existing output
pack-src ./my-project --overwrite

# Quiet mode (CI-friendly)
pack-src ./my-project -q
```

---

## CLI Reference

```
Usage: pack-src [options] [source]

Arguments:
  source                    Source directory to pack (default: ".")

Options:
  -o, --output <file>       Output ZIP file path
  -c, --compression <0-9>   Compression level (default: 6)
  --dry-run                 Preview files without creating archive
  --verbose                 Verbose output
  --include-env             Include .env and secret files
  --no-gitignore            Do not use .gitignore files
  --no-default-ignore       Do not apply built-in exclusions
  --stats                   Print compression statistics
  --list-files              List files that would be included
  --timestamp               Append date (YYYY-MM-DD) to output filename
  --overwrite               Overwrite existing output file
  -q, --quiet               Suppress all output except errors
  -v, --version             Show version
  -h, --help                Show help
```

---

## Ignore Behavior

Ignore rules are loaded in this priority order:

1. `.packsrcignore` — project-specific overrides
2. `.gitignore` — standard git ignores
3. `.dockerignore` — Docker ignores
4. `.npmignore` — npm ignores
5. **Built-in defaults** — see below

### Built-in Default Exclusions

```
node_modules   dist          build         coverage
.git           .next         .nuxt         .cache
.turbo         .parcel-cache .svelte-kit   .angular
.vercel        .output       .yarn         .pnpm-store
__pycache__    .pytest_cache .mypy_cache   .ruff_cache
.venv          venv          env           target
bin            obj           .gradle       .idea
.vscode        .DS_Store     Thumbs.db
```

### Env File Exclusion

These patterns are excluded by default to prevent accidental secret leakage:

```
.env   .env.*   *.pem   *.key   *.p12   id_rsa   id_ed25519   *.secret
```

Use `--include-env` to explicitly include them.

### Nested Ignore Files

`pack-src` loads ignore files from every subdirectory it traverses, so nested `.gitignore` rules are respected correctly — just like `git` itself.

### Negation Support

Negation patterns (e.g., `!important.log`) work as expected within any ignore file.

---

## Output Naming

| Scenario                                | Output                      |
| --------------------------------------- | --------------------------- |
| `pack-src ./my-project`                 | `my-project.zip`            |
| `pack-src ./my-project --timestamp`     | `my-project-2026-05-21.zip` |
| `pack-src ./my-project -o out/snap.zip` | `out/snap.zip`              |

Accidental overwrites are prevented by default. Use `--overwrite` to replace existing files.

---

## Benchmarks

Tested on a MacBook Pro M2 with a 1,000-file TypeScript project:

| Tool               | Time   | Memory |
| ------------------ | ------ | ------ |
| `pack-src`         | ~180ms | ~18MB  |
| `zip -r` (naive)   | ~240ms | ~24MB  |
| `tar czf`          | ~160ms | ~15MB  |
| naive recursive fs | ~410ms | ~85MB  |

`pack-src` achieves near-native performance by:

- Using `fast-glob` for concurrent directory traversal
- Streaming files directly into the archive without buffering
- Limiting concurrency to avoid I/O saturation

Run the benchmarks yourself after building:

```bash
pnpm build
pnpm benchmark
```

---

## Programmatic API

```typescript
import { runPack, collectFiles, IgnoreEngine } from 'pack-src';

// Pack a directory
await runPack({
  source: './my-project',
  output: 'snapshot.zip',
  compression: 6,
  stats: true,
});

// Use the ignore engine directly
const engine = new IgnoreEngine({
  root: './my-project',
  gitignore: true,
  defaultIgnore: true,
  includeEnv: false,
  verbose: false,
});
await engine.loadDirectory('./my-project');

// Collect files
const files = await collectFiles('./my-project', engine, false);
console.log(files.map((f) => f.archivePath));
```

---

## Development

```bash
git clone https://github.com/muhammadmuzzammil1998/pack-src.git
cd pack-src
pnpm install
pnpm build
pnpm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for full contribution guide.

---

## Release

Releases are managed with [Changesets](https://github.com/changesets/changesets).

```bash
# Create a changeset
pnpm changeset

# Bump versions
pnpm version

# Publish to npm
pnpm release
```

The `release.yml` workflow publishes automatically when a release PR is merged to `main`.

---

## License

[MIT](LICENSE) © [Mohammad Muzammil Khan](https://github.com/muhammadmuzzammil1998)
