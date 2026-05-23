# pack-src Changelog

All notable changes to this project will be documented in this file.

## 0.1.1

- Update readme

## 0.1.0 — Initial Release

- Core ZIP archiving with streaming
- Ignore engine supporting `.packsrcignore`, `.gitignore`, `.dockerignore`, `.npmignore`
- Built-in default exclusions (node_modules, dist, .git, etc.)
- CLI flags: `--output`, `--compression`, `--dry-run`, `--verbose`, `--include-env`, `--no-gitignore`, `--no-default-ignore`, `--stats`, `--list-files`, `--timestamp`, `--overwrite`, `--quiet`
- Zip-slip prevention
- Deterministic archive ordering
- Progress indicators with ora
- Human-readable compression statistics
