import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestUsers } from '../../src/utils/test-data';

test.describe('Authentication @smoke', () => {
  // These tests do NOT reuse the stored auth state — they test login itself
  test.use({ storageState: { cookies: [], origins: [] } });

  test('logs in successfully with valid customer credentials', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(TestUsers.validCustomer.email, TestUsers.validCustomer.password);
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByRole('heading', { name: /my account/i })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(TestUsers.invalidCustomer.email, TestUsers.invalidCustomer.password);
    await loginPage.expectLoginError(/invalid|incorrect/i);
  });

  test('shows validation when fields are empty', async ({ loginPage, page }) => {
    await loginPage.goto();
    await page.getByRole('button', { name: /^login$/i }).click();
    // HTML5 / framework validation should keep us on the login page
    await expect(page).toHaveURL(/auth\/login/);
  });
});
