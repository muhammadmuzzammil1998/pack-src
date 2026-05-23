# Contributing to pack-src

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 22+
- pnpm 9+

```bash
git clone https://github.com/muhammadmuzzammil1998/pack-src.git
cd pack-src
pnpm install
```

### Available Scripts

| Command              | Description                   |
| -------------------- | ----------------------------- |
| `pnpm build`         | Compile TypeScript to `dist/` |
| `pnpm dev`           | Watch mode build              |
| `pnpm test`          | Run all tests                 |
| `pnpm test:watch`    | Run tests in watch mode       |
| `pnpm test:coverage` | Run tests with coverage       |
| `pnpm lint`          | Lint source files             |
| `pnpm lint:fix`      | Auto-fix lint issues          |
| `pnpm format`        | Format with Prettier          |
| `pnpm typecheck`     | Type-check without building   |

## Project Structure

```
src/
  cli.ts              # CLI entry point (commander)
  index.ts            # Public API exports
  commands/
    pack.ts           # Main pack command logic
  core/
    collector.ts      # File collection with fast-glob
    ignore-engine.ts  # Ignore rule resolution
    namer.ts          # Output path resolution
    stats.ts          # Statistics printer
    zipper.ts         # Streaming ZIP creation
  constants/
    index.ts          # Default ignores, constants
  types/
    index.ts          # TypeScript interfaces
  utils/
    format.ts         # Human-readable formatting
    paths.ts          # Path normalization utilities
tests/
  fixtures/           # Test fixture projects
  *.test.ts           # Vitest test files
benchmarks/
  run.ts              # Benchmark runner
```

## Making Changes

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/my-feature`
3. **Make your changes** with tests
4. **Run the full suite**: `pnpm build && pnpm test && pnpm lint`
5. **Add a changeset**: `pnpm changeset`
6. **Open a pull request**

## Adding a Changeset

We use [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
pnpm changeset
```

Follow the prompts to select the bump type (`patch`, `minor`, `major`) and describe the change.

## Code Style

- **TypeScript strict mode** — all files must type-check cleanly
- **ESLint** — run `pnpm lint` before committing
- **Prettier** — run `pnpm format` to auto-format

## Tests

- Write tests in `tests/` using Vitest
- Add fixtures to `tests/fixtures/` for integration scenarios
- Run `pnpm test` to verify

## Reporting Issues

Use the GitHub issue tracker. Please include:

- OS and Node.js version
- `pack-src` version
- Minimal reproduction steps

## License

By contributing you agree your changes will be licensed under the [MIT License](LICENSE).
