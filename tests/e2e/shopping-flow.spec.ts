import { test, expect } from '../../src/fixtures/test-fixtures';

/**
 * Hybrid E2E flow: use the API for fast, reliable test setup (creating
 * a cart and adding items), then verify the user experience through
 * the UI. This is the pattern most production QA frameworks adopt:
 * APIs for state, UI for what the user actually sees.
 */
test.describe('E2E shopping flow @regression', () => {
  // Run as guest so checkout reads the cart_id we inject into sessionStorage
  // rather than the authenticated user's server-side cart.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('user can browse, add a product to cart via UI, and see it on the cart page', async ({
    homePage,
    productPage,
    cartApi,
    page,
  }) => {
    await homePage.goto();
    await homePage.expectProductsVisible();

    const firstProductLink = page.locator('a[href^="/product/"]').filter({
      has: page.locator('img'),
    }).first();
    await firstProductLink.click();

    await expect(page).toHaveURL(/\/product\//);
    const productName = await productPage.getName();
    const price = await productPage.getPrice();
    expect(price).toBeGreaterThan(0);

    await productPage.addToCart(2);
    const cartId = await page.evaluate(() => window.sessionStorage.getItem('cart_id'));
    expect(cartId).toBeTruthy();
    await expect
      .poll(async () => {
        const cart = await cartApi.getCart(cartId as string);
        return cart.cart_items.length;
      })
      .toBeGreaterThan(0);

    await homePage.openCart();
    await expect(page).toHaveURL(/\/checkout/);
    await expect.poll(async () => (await page.locator('body').textContent()) ?? '').toContain(productName);
  });

  test('API-prepared cart is reflected in the UI', async ({
    productsApi,
    cartApi,
    page,
  }) => {
    const products = await productsApi.list();
    const product = products.data[0];

    const cart = await cartApi.create();
    await cartApi.addItem(cart.id, product.id, 3);

    await page.goto('/');
    await page.evaluate((id) => window.sessionStorage.setItem('cart_id', id), cart.id);

    await page.goto('/checkout');

    await expect(page.getByText(product.name, { exact: false }).first()).toBeVisible();
  });
});
