import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage encapsulates behaviour shared by every page object:
 * navigation, waiting helpers, and screenshots. All concrete pages
 * extend this so common interactions stay DRY.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    // Wait for `domcontentloaded` rather than the full `load` event: the SUT
    // is an image-heavy Angular SPA, so waiting for every resource is slow and
    // flaky under parallel load. Concrete pages then wait for the elements
    // they actually need.
    await this.navigateWithRetry(this.url);
    await this.waitForPageReady();
  }

  /**
   * The target is a shared public demo site that occasionally stalls a cold
   * navigation under load. Retry once on timeout so a transient stall doesn't
   * fail an otherwise-healthy test.
   */
  private async navigateWithRetry(url: string, attempts = 2): Promise<void> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        return;
      } catch (error) {
        if (attempt === attempts) throw error;
      }
    }
  }

  async waitForPageReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  protected async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }
}
