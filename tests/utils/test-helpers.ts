/**
 * ================================================
 * TEST UTILITIES
 * ================================================
 * Helper functions for E2E tests
 */

import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

/**
 * Login helper function
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful login
  await page.waitForURL(/\/(dashboard|marketplace|profile)/);

  // Verify login success by checking for user menu or profile link
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible({
    timeout: 10000,
  });
}

/**
 * Login as specific user role
 */
export async function loginAs(
  page: Page,
  role: 'admin' | 'freelancer' | 'customer' | 'employer'
) {
  const user = TEST_USERS[role];
  await login(page, user.email, user.password);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login');
}

/**
 * Wait for toast message
 */
export async function waitForToast(page: Page, expectedText?: string) {
  const toast = page.locator('[data-testid="toast"], .toast, [role="alert"]');
  await expect(toast).toBeVisible({ timeout: 5000 });

  if (expectedText) {
    await expect(toast).toContainText(expectedText);
  }

  return toast;
}

/**
 * Wait for success toast
 */
export async function waitForSuccessToast(page: Page, expectedText?: string) {
  const toast = await waitForToast(page, expectedText);
  await expect(toast).toHaveClass(/success|green/);
  return toast;
}

/**
 * Wait for error toast
 */
export async function waitForErrorToast(page: Page, expectedText?: string) {
  const toast = await waitForToast(page, expectedText);
  await expect(toast).toHaveClass(/error|red|danger/);
  return toast;
}

/**
 * Fill form field by name
 */
export async function fillField(page: Page, name: string, value: string) {
  await page.fill(`[name="${name}"]`, value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  await page.click(`button:has-text("${text}")`);
}

/**
 * Wait for API response
 */
export async function waitForAPI(
  page: Page,
  urlPattern: string | RegExp,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
) {
  return page.waitForResponse(
    (response) => {
      const matchesUrl =
        typeof urlPattern === 'string'
          ? response.url().includes(urlPattern)
          : urlPattern.test(response.url());
      const matchesMethod = response.request().method() === method;
      return matchesUrl && matchesMethod;
    },
    { timeout: 10000 }
  );
}

/**
 * Select dropdown option
 */
export async function selectOption(
  page: Page,
  selector: string,
  value: string
) {
  await page.selectOption(selector, value);
}

/**
 * Upload file
 */
export async function uploadFile(
  page: Page,
  selector: string,
  filePath: string
) {
  await page.setInputFiles(selector, filePath);
}

/**
 * Wait for page load
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Scroll to element
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
}

/**
 * Get element text
 */
export async function getElementText(page: Page, selector: string) {
  return page.locator(selector).textContent();
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string) {
  return page
    .locator(selector)
    .count()
    .then((count) => count > 0);
}

/**
 * Wait for element to disappear
 */
export async function waitForElementToDisappear(
  page: Page,
  selector: string,
  timeout = 5000
) {
  await expect(page.locator(selector)).toBeHidden({ timeout });
}

/**
 * Take screenshot with name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Mock API response
 */
export async function mockAPIResponse(
  page: Page,
  url: string | RegExp,
  response: unknown
) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Clear all cookies
 */
export async function clearCookies(page: Page) {
  await page.context().clearCookies();
}

/**
 * Set local storage item
 */
export async function setLocalStorage(page: Page, key: string, value: string) {
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key, value }
  );
}

/**
 * Get local storage item
 */
export async function getLocalStorage(page: Page, key: string) {
  return page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}

/**
 * Wait for element and click
 */
export async function waitAndClick(
  page: Page,
  selector: string,
  timeout = 10000
) {
  await page.waitForSelector(selector, { timeout });
  await page.click(selector);
}

/**
 * Type text with delay (simulate human typing)
 */
export async function typeSlowly(
  page: Page,
  selector: string,
  text: string,
  delay = 50
) {
  await page.type(selector, text, { delay });
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(page: Page, url: string | RegExp) {
  await page.waitForURL(url);
}

/**
 * Get table row count
 */
export async function getTableRowCount(page: Page, tableSelector: string) {
  return page.locator(`${tableSelector} tbody tr`).count();
}

/**
 * Check checkbox
 */
export async function checkCheckbox(page: Page, selector: string) {
  await page.check(selector);
}

/**
 * Uncheck checkbox
 */
export async function uncheckCheckbox(page: Page, selector: string) {
  await page.uncheck(selector);
}

/**
 * Get element attribute
 */
export async function getElementAttribute(
  page: Page,
  selector: string,
  attribute: string
) {
  return page.locator(selector).getAttribute(attribute);
}

/**
 * Hover over element
 */
export async function hoverElement(page: Page, selector: string) {
  await page.hover(selector);
}

/**
 * Double click element
 */
export async function doubleClickElement(page: Page, selector: string) {
  await page.dblclick(selector);
}

/**
 * Right click element
 */
export async function rightClickElement(page: Page, selector: string) {
  await page.click(selector, { button: 'right' });
}
