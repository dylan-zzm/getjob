import { fileURLToPath, URL } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      'server-only': fileURLToPath(
        new URL('./tests/setup/empty-module.ts', import.meta.url)
      ),
    },
  },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    environment: 'node',
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
  },
});
