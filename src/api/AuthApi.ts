import { ApiClient } from './ApiClient';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class AuthApi extends ApiClient {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request.post('/users/login', {
      data: { email, password },
    });
    await this.expectOk(response, 200);
    const body = await this.asJson<LoginResponse>(response);
    this.setToken(body.access_token);
    return body;
  }

  async loginAsCustomer(): Promise<string> {
    const email = process.env.USER_EMAIL ?? 'customer@practicesoftwaretesting.com';
    const password = process.env.USER_PASSWORD ?? 'welcome01';
    const { access_token } = await this.login(email, password);
    return access_token;
  }

  async logout(): Promise<void> {
    const response = await this.request.get('/users/logout', {
      headers: this.authHeaders(),
    });
    await this.expectOk(response, 200);
    this.token = null;
  }
}
