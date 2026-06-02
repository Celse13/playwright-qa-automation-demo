import { test as setup, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LoginPage } from '../src/pages/LoginPage';

const authDir = path.join(__dirname, '..', '.auth');
const userAuthFile = path.join(authDir, 'user.json');

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

/**
 * Global setup: authenticates a customer once and saves storage state.
 * Subsequent tests reuse this state to avoid logging in repeatedly.
 *
 * Uses the demo customer account documented on practicesoftwaretesting.com.
 */
setup('authenticate as customer', async ({ page }) => {
  const email = process.env.USER_EMAIL ?? 'customer@practicesoftwaretesting.com';
  const password = process.env.USER_PASSWORD ?? 'welcome01';
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(email, password);

  await page.waitForURL(/\/account/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: /my account/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /jane doe/i })).toBeVisible();

  await page.context().storageState({ path: userAuthFile });
});
