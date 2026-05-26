# pack-src Changelog

## 0.2.0

### Minor Changes

- a4c899b: Add --include-git flag and .packsrcinclude include engine support

  \*New Features:\*
  - \*`--include-git` flag\*: Allows the `.git` directory to be included in archives. By default, `.git` is excluded via built-in defaults; this flag bypasses that exclusion.
  - \*`.packsrcinclude` support\*: Introduces a force-include mechanism. Files matching patterns in `.packsrcinclude` bypass all ignore rules (`.gitignore`, built-in defaults, etc.). This is useful for selectively including specific build artifacts, generated files, or vendored dependencies that would otherwise be ignored.

  Both features work independently and can be combined as needed.

## 0.1.1

### Patch Changes

- 4a8b453: Update readme

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
