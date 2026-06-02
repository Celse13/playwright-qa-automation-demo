import { test as base, request as playwrightRequest, APIRequestContext } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { AuthApi } from '../api/AuthApi';
import { ProductsApi } from '../api/ProductsApi';
import { CartApi } from '../api/CartApi';

interface PageFixtures {
  homePage: HomePage;
  loginPage: LoginPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

interface ApiFixtures {
  apiRequest: APIRequestContext;
  authApi: AuthApi;
  productsApi: ProductsApi;
  cartApi: CartApi;
  authenticatedToken: string;
}

/**
 * Extended test object that exposes page objects and API clients
 * as fixtures. Each one is lazily instantiated per-test so tests
 * stay isolated and readable.
 *
 * Example:
 *   test('add to cart', async ({ homePage, cartPage }) => {
 *     await homePage.goto();
 *     ...
 *   });
 */
export const test = base.extend<PageFixtures & ApiFixtures>({
  // Page object fixtures
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // API fixtures (independent of UI page).
  // Playwright requires the destructured-fixtures pattern even when no fixtures
  // are consumed, so the empty pattern here is intentional.
  // eslint-disable-next-line no-empty-pattern
  apiRequest: async ({}, use) => {
    const context = await playwrightRequest.newContext({
      baseURL: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
      extraHTTPHeaders: { Accept: 'application/json' },
    });
    await use(context);
    await context.dispose();
  },
  authApi: async ({ apiRequest }, use) => {
    await use(new AuthApi(apiRequest));
  },
  productsApi: async ({ apiRequest }, use) => {
    await use(new ProductsApi(apiRequest));
  },
  cartApi: async ({ apiRequest }, use) => {
    await use(new CartApi(apiRequest));
  },
  authenticatedToken: async ({ authApi }, use) => {
    const token = await authApi.loginAsCustomer();
    await use(token);
  },
});

export { expect } from '@playwright/test';
