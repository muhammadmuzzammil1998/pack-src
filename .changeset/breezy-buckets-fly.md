---
'pack-src': minor
---

Add --include-git flag and .packsrcinclude include engine support

\*New Features:\*

- \*`--include-git` flag\*: Allows the `.git` directory to be included in archives. By default, `.git` is excluded via built-in defaults; this flag bypasses that exclusion.

- \*`.packsrcinclude` support\*: Introduces a force-include mechanism. Files matching patterns in `.packsrcinclude` bypass all ignore rules (`.gitignore`, built-in defaults, etc.). This is useful for selectively including specific build artifacts, generated files, or vendored dependencies that would otherwise be ignored.

Both features work independently and can be combined as needed.
