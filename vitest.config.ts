import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts', 'src/index.ts'],
    },
    testTimeout: 30_000,
  },
  resolve: {
    conditions: ['node'],
  },
});
