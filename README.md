# Playwright QA Automation Demo

[![Playwright Tests](https://github.com/celse13/playwright-qa-automation-demo/actions/workflows/playwright.yml/badge.svg)](https://github.com/celse13/playwright-qa-automation-demo/actions/workflows/playwright.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.48-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Allure Report](https://img.shields.io/badge/Allure-Report-FF6B6B)](https://celse13.github.io/playwright-qa-automation-demo/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An end-to-end QA automation framework demonstrating production-grade patterns: Page Object Model, REST API testing, custom fixtures, parallel execution across browsers, CI/CD with GitHub Actions, and Allure reporting.

**Target system under test:** [practicesoftwaretesting.com](https://practicesoftwaretesting.com) — a tool-shop demo application explicitly built and licensed for QA automation practice (no ToS issues).

## Why this project

This repository mirrors the architecture I use on production client projects. It is intentionally compact but covers the patterns that matter:

- A clean **Page Object Model** with a shared `BasePage` and one class per page.
- An **API client layer** that mirrors the page-object pattern for REST endpoints, so UI and API tests share the same mental model.
- **Custom fixtures** that compose pages and API clients, removing boilerplate from every test.
- A **hybrid E2E flow** — set up state via API, verify through the UI — which is how production suites stay fast and reliable.
- **CI/CD** running across Chromium, Firefox, WebKit, and mobile, with **Allure reports** auto-published to GitHub Pages.

## Tech stack

| Concern | Tool |
| --- | --- |
| Test runner | Playwright Test |
| Language | TypeScript (strict mode) |
| Reporting | Playwright HTML + Allure + JUnit |
| CI/CD | GitHub Actions |
| Linting / formatting | ESLint + Prettier |
| Env management | dotenv |

## Project structure

```
playwright-qa-automation-demo/
├── src/
│   ├── pages/          # Page Object Model classes
│   │   ├── BasePage.ts
│   │   ├── HomePage.ts
│   │   ├── LoginPage.ts
│   │   ├── ProductPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   ├── api/            # REST API client layer
│   │   ├── ApiClient.ts
│   │   ├── AuthApi.ts
│   │   ├── ProductsApi.ts
│   │   └── CartApi.ts
│   ├── fixtures/       # Custom Playwright fixtures
│   │   └── test-fixtures.ts
│   └── utils/          # Test data, logger, helpers
│       ├── test-data.ts
│       └── logger.ts
├── tests/
│   ├── ui/             # UI-only tests
│   ├── api/            # API-only tests
│   ├── e2e/            # Hybrid UI + API tests
│   └── global.setup.ts # Auth state persistence
├── .github/workflows/  # GitHub Actions pipelines
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Install browsers
npx playwright install --with-deps

# 3. Copy and edit environment variables
cp .env.example .env

# 4. Run the full suite
npm test
```

## Running tests

```bash
npm test                  # All projects, all tests
npm run test:ui           # UI tests only
npm run test:api          # API tests only
npm run test:e2e          # Hybrid E2E tests
npm run test:smoke        # Tests tagged @smoke
npm run test:regression   # Tests tagged @regression
npm run test:headed       # Run with a visible browser
npm run test:debug        # Step through with the inspector
```

## Reports

```bash
npm run report:html       # Open the Playwright HTML report
npm run report:allure     # Generate and open the Allure report
```

## Patterns demonstrated

### 1. Page Object Model with a typed base class

Every page extends `BasePage`, which provides navigation, waiting helpers, and screenshots. Pages expose intent-revealing methods (`addToCart`, `searchFor`) rather than leaking selectors.

### 2. API client layer

The `src/api/` layer mirrors the page objects but for REST endpoints. `ApiClient` handles auth tokens and error normalisation; concrete clients (`AuthApi`, `ProductsApi`, `CartApi`) expose typed methods.

### 3. Custom fixtures

`src/fixtures/test-fixtures.ts` extends Playwright's `test` to inject page objects and API clients. Tests become trivially readable:

```ts
test('add to cart', async ({ homePage, productPage, cartPage }) => {
  await homePage.goto();
  // ...
});
```

### 4. Hybrid E2E (API setup + UI verification)

`tests/e2e/shopping-flow.spec.ts` shows the pattern: instead of clicking through the UI to put items in the cart, the test calls the cart API directly, then verifies the cart page renders the expected state. This is dramatically faster and less flaky than pure UI E2E.

### 5. Auth state reuse

`tests/global.setup.ts` logs in once and saves the storage state. Subsequent tests start already authenticated, cutting minutes off each run.

### 6. Parallel multi-browser execution

The Playwright config defines projects for Chromium, Firefox, WebKit, mobile Chrome, and an API-only project. CI runs these in a matrix.

### 7. CI/CD

`.github/workflows/playwright.yml` runs the matrix on every PR, retries failed tests, uploads HTML and Allure artefacts, and publishes the merged Allure report to GitHub Pages.

## Tags

Tests are tagged with `@smoke`, `@regression`, and `@api` so they can be selected with `--grep`. The smoke suite runs on every PR; the full regression runs nightly.

## Notes on the target system

[practicesoftwaretesting.com](https://practicesoftwaretesting.com) is an open practice site by Roy de Kleijn, explicitly intended for automation training. Both the UI and the REST API at `api.practicesoftwaretesting.com` are public and stable, which is why this demo can exercise both layers without any ToS or rights concerns.

## License

MIT — see [LICENSE](LICENSE).
