import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartLine {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export class CartPage extends BasePage {
  protected readonly url = '/checkout';

  private readonly cartRows: Locator;
  private readonly proceedToCheckoutBtn: Locator;
  private readonly cartTotal: Locator;
  private readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('[data-test="product"]');
    this.proceedToCheckoutBtn = page.getByTestId('proceed-1');
    this.cartTotal = page.getByTestId('cart-total');
    this.emptyCartMessage = page.locator('text=/your cart is empty/i');
  }

  async getLineCount(): Promise<number> {
    return this.cartRows.count();
  }

  async removeLineByName(name: string): Promise<void> {
    const row = this.cartRows.filter({ hasText: name });
    await row.getByTestId('product-remove').click();
  }

  async updateQuantity(productName: string, qty: number): Promise<void> {
    const row = this.cartRows.filter({ hasText: productName });
    await row.getByTestId('product-quantity').fill(String(qty));
    await row.getByTestId('product-quantity').blur();
  }

  async getTotal(): Promise<number> {
    const text = (await this.cartTotal.textContent()) ?? '0';
    return parseFloat(text.replace(/[^\d.]/g, ''));
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedToCheckoutBtn.click();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyCartMessage).toBeVisible();
  }

  async expectContains(productName: string): Promise<void> {
    await expect(this.cartRows.filter({ hasText: productName })).toBeVisible();
  }
}
