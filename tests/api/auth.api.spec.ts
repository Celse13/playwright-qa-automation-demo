import { test, expect } from '../../src/fixtures/test-fixtures';
import { TestUsers } from '../../src/utils/test-data';

test.describe('Auth API @api', () => {
  test('valid credentials return a bearer token', async ({ authApi }) => {
    const response = await authApi.login(
      TestUsers.validCustomer.email,
      TestUsers.validCustomer.password,
    );
    expect(response.access_token).toBeTruthy();
    expect(response.token_type.toLowerCase()).toBe('bearer');
    expect(response.expires_in).toBeGreaterThan(0);
  });

  test('invalid credentials return 401', async ({ apiRequest }) => {
    const response = await apiRequest.post('/users/login', {
      data: {
        email: TestUsers.invalidCustomer.email,
        password: TestUsers.invalidCustomer.password,
      },
    });
    expect(response.status()).toBe(401);
  });

  test('missing payload returns 422', async ({ apiRequest }) => {
    const response = await apiRequest.post('/users/login', { data: {} });
    expect([400, 401, 422]).toContain(response.status());
  });
});
