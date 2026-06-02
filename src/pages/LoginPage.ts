import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly url = '/auth/login';

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly registerLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel(/email address/i);
    this.passwordInput = page.getByLabel(/^password/i);
    this.loginButton = page.getByRole('button', { name: /^login$/i });
    this.errorMessage = page.locator('[role="alert"]').or(page.getByText(/invalid|incorrect|error/i).first());
    this.registerLink = page.getByRole('link', { name: /register your account/i });
  }

  /**
   * Navigate to the login page and wait for the SPA to render the form.
   * The target is an Angular app, so `domcontentloaded` fires before the
   * inputs exist. On a cold/slow load the bundle occasionally fails to
   * hydrate the form, so we reload once before giving up — keeping the page
   * object reliable under parallel load without masking real failures.
   */
  async goto(): Promise<void> {
    await super.goto();
    try {
      await this.emailInput.waitFor({ state: 'visible', timeout: 15_000 });
    } catch {
      await this.page.reload();
      await this.emailInput.waitFor({ state: 'visible', timeout: 30_000 });
    }
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginError(expectedText: string | RegExp): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async goToRegister(): Promise<void> {
    await this.registerLink.click();
  }
}
