import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  protected readonly url = '/product';

  private readonly productName: Locator;
  private readonly productPrice: Locator;
  private readonly quantityInput: Locator;
  private readonly increaseQty: Locator;
  private readonly decreaseQty: Locator;
  private readonly addToCartButton: Locator;
  private readonly addToFavouritesButton: Locator;
  private readonly toastMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = page.getByRole('heading', { level: 1 });
    this.productPrice = page.locator('text=/^\\$\\d+(?:\\.\\d{2})?$/').first();
    this.quantityInput = page.getByRole('spinbutton', { name: /quantity/i });
    this.increaseQty = page.getByRole('button', { name: /increase quantity/i });
    this.decreaseQty = page.getByRole('button', { name: /decrease quantity/i });
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.addToFavouritesButton = page.getByRole('button', { name: /add to favourites/i });
    this.toastMessage = page.locator('#toast-container');
  }

  async getName(): Promise<string> {
    return (await this.productName.textContent())?.trim() ?? '';
  }

  async getPrice(): Promise<number> {
    const text = (await this.productPrice.textContent()) ?? '0';
    return parseFloat(text.replace(/[^\d.]/g, ''));
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(qty = 1): Promise<void> {
    if (qty > 1) {
      await this.setQuantity(qty);
    }
    await this.addToCartButton.click();
    // Wait for cart_id and capture atomically — a separate page.evaluate() call
    // after waitForFunction can race a fast re-render and return null.
    await this.page.waitForFunction(
      () => window.sessionStorage.getItem('cart_id') ?? false,
      null,
      { timeout: 15000 },
    );
  }

  async addToFavourites(): Promise<void> {
    await this.addToFavouritesButton.click();
  }
}
