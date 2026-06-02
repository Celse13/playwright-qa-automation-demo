import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Thin wrapper around Playwright's APIRequestContext to encapsulate
 * the API base URL and bearer-token authentication. All API page
 * objects extend or compose this class.
 */
export class ApiClient {
  protected token: string | null = null;

  constructor(protected readonly request: APIRequestContext) {}

  setToken(token: string): void {
    this.token = token;
  }

  protected authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  protected async expectOk(response: APIResponse, expected: number | number[] = 200): Promise<void> {
    const accepted = Array.isArray(expected) ? expected : [expected];
    if (!accepted.includes(response.status())) {
      const body = await response.text();
      throw new Error(
        `Expected status ${accepted.join(' or ')}, got ${response.status()}. Body: ${body.slice(0, 500)}`,
      );
    }
  }

  protected async asJson<T>(response: APIResponse): Promise<T> {
    return (await response.json()) as T;
  }
}
