import { ApiClient } from './ApiClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  brand_id: string;
  product_image: { id: string; by_name: string; source_url: string };
}

export interface ProductPage {
  current_page: number;
  data: Product[];
  total: number;
  per_page: number;
}

export class ProductsApi extends ApiClient {
  async list(params: { page?: number; by_brand?: string; by_category?: string } = {}): Promise<ProductPage> {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) search.set(k, String(v));
    });
    const url = `/products${search.toString() ? `?${search.toString()}` : ''}`;
    const response = await this.request.get(url);
    await this.expectOk(response);
    return this.asJson<ProductPage>(response);
  }

  async getById(id: string): Promise<Product> {
    const response = await this.request.get(`/products/${id}`);
    await this.expectOk(response);
    return this.asJson<Product>(response);
  }

  async search(query: string): Promise<ProductPage> {
    const response = await this.request.get(`/products/search?q=${encodeURIComponent(query)}`);
    await this.expectOk(response);
    return this.asJson<ProductPage>(response);
  }
}
