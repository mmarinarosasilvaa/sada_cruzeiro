// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { getBaseUrl } = require('./tests/page-objects/constants/urls');

const disableGpu = process.env.E2E_DISABLE_GPU === '1';
const pwChannel = process.env.PW_CHANNEL || undefined;
const firefoxStable = process.env.E2E_FIREFOX_STABLE !== '0';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'e2e/**/*.spec.js',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'always' }]],
  use: {
    baseURL: getBaseUrl(),
    trace: 'on-first-retry',
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
    bypassCSP: true,
    launchOptions: {
      args: [
        '--disable-blink-features=AutomationControlled',
        ...(disableGpu ? ['--disable-gpu'] : []),
      ],
    },
    ...(pwChannel ? { channel: pwChannel } : {}),
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        ...(firefoxStable
          ? {
              navigationTimeout: 120_000,
              actionTimeout: 45_000,
            }
          : {}),
      },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
