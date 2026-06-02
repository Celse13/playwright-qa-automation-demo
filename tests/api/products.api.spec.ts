import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Products API @api @smoke', () => {
  test('GET /products returns a paginated list', async ({ productsApi }) => {
    const result = await productsApi.list();
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.current_page).toBe(1);
    expect(result.per_page).toBeGreaterThan(0);

    const product = result.data[0];
    expect(product).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
    });
  });

  test('GET /products/:id returns a single product', async ({ productsApi }) => {
    const list = await productsApi.list();
    const target = list.data[0];

    const product = await productsApi.getById(target.id);
    expect(product.id).toBe(target.id);
    expect(product.name).toBe(target.name);
    expect(product.price).toBeGreaterThan(0);
  });

  test('GET /products/search returns matching products', async ({ productsApi }) => {
    const result = await productsApi.search('hammer');
    expect(result.data.length).toBeGreaterThan(0);
    for (const product of result.data) {
      const haystack = `${product.name} ${product.description}`.toLowerCase();
      expect(haystack).toContain('hammer');
    }
  });

  test('GET /products/:id with invalid id returns 404', async ({ apiRequest }) => {
    const response = await apiRequest.get('/products/this-id-does-not-exist-xxx');
    expect([404, 422]).toContain(response.status());
  });
});
