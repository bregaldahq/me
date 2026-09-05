import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4174';

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command: 'npm run start -- --ip 127.0.0.1 --port 4174',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
