import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  shims: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildOptions(options) {
    options.conditions = ['node'];
  },
  onSuccess: async () => {
    const { chmod } = await import('node:fs/promises');
    await chmod('dist/cli.js', 0o755).catch(() => {});
  },
});
