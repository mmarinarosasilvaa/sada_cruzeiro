// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { getBaseUrl } = require('./tests/page-objects/constants/urls');

const disableGpu = process.env.E2E_DISABLE_GPU === '1';
const pwChannel = process.env.PW_CHANNEL || undefined;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  testDir: './tests/diagnostics',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: getBaseUrl(),
    headless: false,
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
  projects: [{ name: 'inspect', use: { ...devices['Desktop Chrome'] } }],
});
