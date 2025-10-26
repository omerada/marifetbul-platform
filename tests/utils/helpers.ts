/**
 * ================================================
 * LEGACY TEST HELPERS
 * ================================================
 * Compatibility layer for existing tests
 * Re-exports from test-helpers.ts + legacy-specific functions
 */

import { Page } from '@playwright/test';

// Re-export all functions from test-helpers
export * from './test-helpers';

/**
 * Clear session (cookies + localStorage + sessionStorage)
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Generate random test user data
 */
export function generateTestUser() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);

  return {
    email: `test.user.${timestamp}.${randomString}@example.com`,
    username: `testuser_${timestamp}_${randomString}`,
    firstName: 'Test',
    lastName: 'User',
    password: 'Test@1234Pass!',
    role: 'EMPLOYER' as const,
  };
}

/**
 * Register a new user
 */
export async function register(
  page: Page,
  userData: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    password: string;
  }
) {
  await page.goto('/register');

  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="username"]', userData.username);
  await page.fill('input[name="firstName"]', userData.firstName);
  await page.fill('input[name="lastName"]', userData.lastName);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.password);
  await page.check('input[name="acceptTerms"]');

  await page.click('button[type="submit"]');

  // Wait for redirect
  await page.waitForURL(/\/(login|verify-email|dashboard)/, {
    timeout: 10000,
  });
}

/**
 * Assert toast message is visible
 */
export async function assertToastMessage(
  page: Page,
  expectedText: string,
  timeout = 5000
) {
  const toastElement = page.locator(
    `[data-testid="toast"], [role="alert"], .toast, .notification`
  );
  await toastElement.filter({ hasText: expectedText }).first().waitFor({
    state: 'visible',
    timeout,
  });
}

/**
 * Assert error message is visible
 */
export async function assertErrorMessage(
  page: Page,
  expectedText: string,
  timeout = 5000
) {
  const errorElement = page.locator(
    `[data-testid="error-message"], .error-message, .text-red-600, .text-danger`
  );
  await errorElement.filter({ hasText: expectedText }).first().waitFor({
    state: 'visible',
    timeout,
  });
}
