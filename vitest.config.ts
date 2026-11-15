import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const fromRoot = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: fromRoot('./src/') },
      // Next.js resolves `server-only` at compile time; unit tests run server modules directly.
      { find: /^server-only$/, replacement: fromRoot('./tests/support/server-only.ts') },
    ],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    restoreMocks: true,
  },
});
