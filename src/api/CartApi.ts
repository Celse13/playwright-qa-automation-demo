import { ApiClient } from './ApiClient';

export interface Cart {
  id: string;
  cart_items: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  discount_percentage: number | null;
  product?: { id: string; name: string; price: number };
}

export class CartApi extends ApiClient {
  async create(): Promise<{ id: string }> {
    const response = await this.request.post('/carts');
    await this.expectOk(response, 201);
    return this.asJson<{ id: string }>(response);
  }

  async addItem(cartId: string, productId: string, quantity = 1): Promise<void> {
    const response = await this.request.post(`/carts/${cartId}`, {
      headers: this.authHeaders(),
      data: { product_id: productId, quantity },
    });
    await this.expectOk(response, [200, 201]);
  }

  async getCart(cartId: string): Promise<Cart> {
    const response = await this.request.get(`/carts/${cartId}`);
    await this.expectOk(response);
    return this.asJson<Cart>(response);
  }

  async removeItem(cartId: string, productId: string): Promise<void> {
    const response = await this.request.delete(`/carts/${cartId}/product/${productId}`);
    await this.expectOk(response, 204);
  }

  async deleteCart(cartId: string): Promise<void> {
    const response = await this.request.delete(`/carts/${cartId}`);
    await this.expectOk(response, 204);
  }
}
