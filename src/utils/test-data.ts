import type { BillingAddress } from '../pages/CheckoutPage';

export const TestUsers = {
  validCustomer: {
    email: process.env.USER_EMAIL ?? 'customer@practicesoftwaretesting.com',
    password: process.env.USER_PASSWORD ?? 'welcome01',
  },
  invalidCustomer: {
    email: 'no-such-user@example.com',
    password: 'WrongPassword123!',
  },
} as const;

export const ValidAddress: BillingAddress = {
  address: '123 Test Avenue',
  city: 'Test City',
  state: 'Test State',
  country: 'Testland',
  postcode: '12345',
};

/**
 * Generates a unique-ish string for data that must not collide
 * between parallel test runs (e.g. registration emails).
 */
export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}
