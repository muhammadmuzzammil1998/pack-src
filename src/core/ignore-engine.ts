import fs from 'node:fs/promises';
import path from 'node:path';
import _ignore from 'ignore';
import type { Ignore } from 'ignore';
import { DEFAULT_IGNORES, ENV_PATTERNS, IGNORE_FILES, INCLUDE_FILES } from '../constants/index.js';
import type { IgnoreEngineOptions } from '../types/index.js';

/** CJS interop: ignore's default export is callable but NodeNext types disagree */
const createIgnore = _ignore as unknown as () => Ignore;

/**
 * IgnoreEngine resolves all ignore rules for a given directory tree.
 *
 * Priority order:
 * 1. .packsrcignore
 * 2. .gitignore
 * 3. .dockerignore
 * 4. .npmignore
 * 5. Built-in defaults
 */
export class IgnoreEngine {
  private readonly opts: IgnoreEngineOptions;
  /** Per-directory ignore instances, keyed by directory (normalized) */
  private readonly cache = new Map<string, Ignore>();
  /** Per-directory include instances for force-include patterns (.packsrcinclude) */
  private readonly includeCache = new Map<string, Ignore>();
  /** Root-level ignore instance combining all global rules */
  private rootIgnore: Ignore;

  constructor(opts: IgnoreEngineOptions) {
    this.opts = opts;
    this.rootIgnore = createIgnore();
    if (opts.defaultIgnore) {
      const defaults = opts.includeGit
        ? DEFAULT_IGNORES.filter((p) => p !== '.git')
        : DEFAULT_IGNORES;
      this.rootIgnore.add(defaults);
    }
    if (!opts.includeEnv) {
      this.rootIgnore.add(ENV_PATTERNS);
    }
  }

  /** Load ignore files from a directory and cache the result. */
  async loadDirectory(dir: string): Promise<void> {
    const normalizedDir = path.resolve(dir);
    if (this.cache.has(normalizedDir)) return;

    const ig = createIgnore();

    for (const filename of IGNORE_FILES) {
      if (filename === '.gitignore' && !this.opts.gitignore) continue;

      const filePath = path.join(normalizedDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        ig.add(content);
        if (this.opts.verbose) {
          process.stderr.write(`  [ignore] loaded ${filePath}\n`);
        }
      } catch {
        // File doesn't exist or is unreadable — skip silently
      }
    }

    this.cache.set(normalizedDir, ig);

    const includeIg = createIgnore();
    for (const filename of INCLUDE_FILES) {
      const filePath = path.join(normalizedDir, filename);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        includeIg.add(content);
        if (this.opts.verbose) {
          process.stderr.write(`  [include-rules] loaded ${filePath}\n`);
        }
      } catch {
        // File doesn't exist or is unreadable — skip silently
      }
    }
    this.includeCache.set(normalizedDir, includeIg);
  }

  /**
   * Determine whether a given absolute path is force-included via .packsrcinclude.
   * Force-included files bypass all ignore rules.
   */
  isForceIncluded(absolutePath: string): boolean {
    let current = path.dirname(absolutePath);
    for (;;) {
      const ig = this.includeCache.get(path.resolve(current));
      if (ig !== undefined) {
        const relFromDir = path.relative(current, absolutePath).split(path.sep).join('/');
        if (ig.ignores(relFromDir)) {
          if (this.opts.verbose) {
            process.stderr.write(`  [force-included] ${relFromDir}\n`);
          }
          return true;
        }
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }
    return false;
  }

  /**
   * Determine whether a given absolute path should be ignored.
   *
   * Checks both root-level defaults and any per-directory rules loaded for
   * ancestors of the file.
   */
  isIgnored(absolutePath: string): boolean {
    if (this.isForceIncluded(absolutePath)) return false;

    const root = path.resolve(this.opts.root);
    const relFromRoot = path.relative(root, absolutePath);
    const normalizedRel = relFromRoot.split(path.sep).join('/');

    // Check root-level defaults (built-ins + env patterns)
    if (this.rootIgnore.ignores(normalizedRel)) {
      if (this.opts.verbose) {
        process.stderr.write(`  [ignored] ${normalizedRel}\n`);
      }
      return true;
    }

    // Walk ancestor directories and check nested ignore files
    let current = path.dirname(absolutePath);
    for (;;) {
      const ig = this.cache.get(path.resolve(current));
      if (ig !== undefined) {
        const relFromDir = path.relative(current, absolutePath).split(path.sep).join('/');
        if (ig.ignores(relFromDir)) {
          if (this.opts.verbose) {
            process.stderr.write(`  [ignored] ${normalizedRel} (via ${current})\n`);
          }
          return true;
        }
      }

      const parent = path.dirname(current);
      if (parent === current) break; // filesystem root
      current = parent;
    }

    return false;
  }
}
