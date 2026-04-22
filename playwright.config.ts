import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';
const nodeCommand = process.env.PLAYWRIGHT_NODE;
const pnpmCommand = process.env.PLAYWRIGHT_PNPM || 'pnpm';
const pnpmDir = process.env.PLAYWRIGHT_PNPM_DIR;
const webServerCommand = nodeCommand
  ? `${nodeCommand} ./node_modules/next/dist/bin/next dev --turbopack --hostname 127.0.0.1 --port 3000`
  : `${pnpmCommand} exec next dev --turbopack --hostname 127.0.0.1 --port 3000`;
const webServerPathPrefix = pnpmDir ? `PATH="${pnpmDir}:$PATH" ` : '';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: `${webServerPathPrefix}${webServerCommand}`,
        url: `${baseURL}/robots.txt`,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
