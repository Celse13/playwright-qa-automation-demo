import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  protected readonly url = '/';

  private readonly searchInput: Locator;
  private readonly searchSubmit: Locator;
  private readonly searchReset: Locator;
  private readonly productCards: Locator;
  private readonly sortDropdown: Locator;
  private readonly filtersToggle: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByRole('textbox', { name: /^search$/i });
    this.searchSubmit = page.getByRole('button', { name: /^search$/i });
    this.searchReset = page.getByRole('button', { name: /^x$/i });
    this.productCards = page.locator('a[href^="/product/"]').filter({
      has: page.locator('img'),
    });
    this.sortDropdown = page.getByRole('combobox', { name: /sort/i });
    this.filtersToggle = page.getByRole('button', { name: /^filters$/i });
  }

  private async ensureFiltersOpen(): Promise<void> {
    // isVisible() is a non-waiting snapshot, so we need the page to be rendered first.
    await expect(this.productCards.first()).toBeVisible();
    if (await this.searchInput.isVisible().catch(() => false)) return;
    // Mobile viewport: filters panel is collapsed behind a toggle.
    await expect(this.filtersToggle).toBeVisible();
    await this.filtersToggle.click();
    await expect(this.searchInput).toBeVisible();
  }

  private waitForProductsRefetch() {
    return this.page.waitForResponse(
      (response) =>
        /\/products\b/.test(response.url()) &&
        response.request().method() === 'GET' &&
        response.status() === 200,
      { timeout: 15000 },
    );
  }

  async searchFor(query: string): Promise<void> {
    await this.ensureFiltersOpen();
    await this.searchInput.fill(query);
    const response = this.waitForProductsRefetch();
    await this.searchSubmit.click();
    await response;
    await expect.poll(async () => this.productCards.count()).toBeGreaterThan(0);
  }

  async resetSearch(): Promise<void> {
    await this.ensureFiltersOpen();
    await this.searchReset.click();
  }

  async getProductCount(): Promise<number> {
    await expect.poll(async () => this.productCards.count()).toBeGreaterThan(0);
    return this.productCards.count();
  }

  async openProductByName(name: string): Promise<void> {
    await this.page.getByRole('link', { name, exact: false }).first().click();
  }

  async sortBy(option: 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc'): Promise<void> {
    await this.ensureFiltersOpen();
    await expect(this.productCards.first()).toBeVisible();
    const beforeHref = await this.productCards.first().getAttribute('href');
    const response = this.waitForProductsRefetch();
    await this.sortDropdown.selectOption(option);
    await response;
    await expect
      .poll(async () => this.productCards.first().getAttribute('href'))
      .not.toBe(beforeHref);
  }

  async expectProductsVisible(): Promise<void> {
    await expect.poll(async () => this.productCards.count()).toBeGreaterThan(0);
    await expect(this.productCards.first()).toBeVisible();
  }

  async openCart(): Promise<void> {
    await this.page.goto('/checkout');
  }
}
