import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

const userAuthFile = path.join(__dirname, '.auth', 'user.json');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

/**
 * Playwright Configuration
 * Docs: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  timeout: 90 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The SUT is a shared public demo site; allow one local retry to absorb the
  // occasional transient stall, mirroring how production suites tolerate flaky
  // external dependencies. CI retries twice.
  retries: process.env.CI ? 2 : 1,
  // The SUT is a shared public demo site; too many concurrent cold page loads
  // make it stall. Cap workers to keep parallelism without overwhelming it.
  workers: process.env.CI ? 2 : 4,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    [
      'allure-playwright',
      {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: true,
        environmentInfo: {
          framework: 'Playwright',
          language: 'TypeScript',
          node_version: process.version,
        },
      },
    ],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: userAuthFile },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: userAuthFile },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: userAuthFile },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: userAuthFile },
      dependencies: ['setup'],
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
      },
    },
  ],
});
