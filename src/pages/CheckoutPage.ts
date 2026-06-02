import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface BillingAddress {
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
}

export class CheckoutPage extends BasePage {
  protected readonly url = '/checkout';

  private readonly addressForm: {
    address: Locator;
    city: Locator;
    state: Locator;
    country: Locator;
    postcode: Locator;
  };
  private readonly paymentMethodSelect: Locator;
  private readonly confirmButton: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.addressForm = {
      address: page.getByTestId('address'),
      city: page.getByTestId('city'),
      state: page.getByTestId('state'),
      country: page.getByTestId('country'),
      postcode: page.getByTestId('postcode'),
    };
    this.paymentMethodSelect = page.getByTestId('payment-method');
    this.confirmButton = page.getByTestId('finish');
    this.successMessage = page.getByTestId('payment-success-message');
  }

  async fillBillingAddress(address: BillingAddress): Promise<void> {
    await this.addressForm.address.fill(address.address);
    await this.addressForm.city.fill(address.city);
    await this.addressForm.state.fill(address.state);
    await this.addressForm.country.fill(address.country);
    await this.addressForm.postcode.fill(address.postcode);
  }

  async selectPayment(method: string): Promise<void> {
    await this.paymentMethodSelect.selectOption(method);
  }

  async confirmOrder(): Promise<void> {
    await this.confirmButton.click();
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 15000 });
  }
}
