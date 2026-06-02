import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Product catalog @regression', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('home page loads with product cards visible', async ({ homePage }) => {
    await homePage.goto();
    await homePage.expectProductsVisible();
    expect(await homePage.getProductCount()).toBeGreaterThan(0);
  });

  test('search filters the catalog', async ({ homePage }) => {
    await homePage.goto();
    const initialCount = await homePage.getProductCount();
    await homePage.searchFor('hammer');
    const filteredCount = await homePage.getProductCount();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('sort by price ascending orders products correctly', async ({ homePage, page }) => {
    await homePage.goto();
    await homePage.sortBy('price,asc');

    const productCards = page.locator('a[href^="/product/"]').filter({
      has: page.getByRole('heading'),
    });
    await expect(productCards.first()).toBeVisible();
    const cardTexts = await productCards.allTextContents();
    const prices = cardTexts
      .map((text) => text.match(/\$(\d+(?:\.\d{2})?)/)?.[1])
      .filter((price): price is string => Boolean(price))
      .map((price) => Number(price));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });
});
