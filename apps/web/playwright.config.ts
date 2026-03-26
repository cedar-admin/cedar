import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 600_000, // 10 min overall per test (audit is one big run)
  use: {
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
