import { Page } from '@playwright/test';

/**
 * Test data generators
 */

export function generateRandomEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test-${timestamp}-${random}@marifetbul.com`;
}

export function generateRandomUsername(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `user_${timestamp}_${random}`;
}

export function generateStrongPassword(): string {
  return `Test@${Date.now()}Pass!`;
}

export function generateTestUser() {
  return {
    email: generateRandomEmail(),
    username: generateRandomUsername(),
    password: generateStrongPassword(),
    firstName: 'Test',
    lastName: 'User',
  };
}

/**
 * Authentication helpers
 */

export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect after successful login
  await page.waitForURL(/\/(dashboard|marketplace|profile)/, {
    timeout: 10000,
  });
}

export async function logout(page: Page): Promise<void> {
  // Click on user menu
  await page.click('[data-testid="user-menu-trigger"]');

  // Click logout button
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to home or login page
  await page.waitForURL(/\/(|login)$/, { timeout: 5000 });
}

export async function register(
  page: Page,
  userData: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }
): Promise<void> {
  await page.goto('/register');

  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="username"]', userData.username);
  await page.fill('input[name="firstName"]', userData.firstName);
  await page.fill('input[name="lastName"]', userData.lastName);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="confirmPassword"]', userData.password);

  // Accept terms
  await page.check('input[name="acceptTerms"]');

  await page.click('button[type="submit"]');

  // Wait for success message or redirect
  await page.waitForURL(/\/(login|verify-email)/, { timeout: 10000 });
}

/**
 * Navigation helpers
 */

export async function navigateToMarketplace(page: Page): Promise<void> {
  await page.goto('/marketplace');
  await page.waitForLoadState('networkidle');
}

export async function navigateToDashboard(page: Page): Promise<void> {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
}

export async function navigateToProfile(
  page: Page,
  username?: string
): Promise<void> {
  const url = username ? `/profile/${username}` : '/profile';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Wait helpers
 */

export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      const matches =
        typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      return matches && response.status() === 200;
    },
    { timeout }
  );
}

export async function waitForElement(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Form helpers
 */

export async function fillForm(
  page: Page,
  formData: Record<string, string>
): Promise<void> {
  for (const [fieldName, value] of Object.entries(formData)) {
    await page.fill(
      `input[name="${fieldName}"], textarea[name="${fieldName}"]`,
      value
    );
  }
}

export async function selectDropdown(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.click(selector);
  await page.click(`[data-value="${value}"]`);
}

/**
 * File upload helpers
 */

export async function uploadFile(
  page: Page,
  inputSelector: string,
  filePath: string
): Promise<void> {
  const fileInput = page.locator(inputSelector);
  await fileInput.setInputFiles(filePath);
}

/**
 * Assertion helpers
 */

export async function assertToastMessage(
  page: Page,
  message: string
): Promise<void> {
  const toast = page.locator('[data-testid="toast"], .toast, [role="status"]');
  await toast.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForSelector(`text="${message}"`, { timeout: 5000 });
}

export async function assertErrorMessage(
  page: Page,
  message: string
): Promise<void> {
  const error = page.locator(
    '[data-testid="error-message"], .error-message, [role="alert"]'
  );
  await error.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForSelector(`text="${message}"`, { timeout: 5000 });
}

/**
 * Package helpers
 */

export async function createPackage(
  page: Page,
  packageData: {
    title: string;
    description: string;
    category: string;
    basicPrice: string;
  }
): Promise<void> {
  await page.goto('/dashboard/packages/create');

  // Step 1: Basic Info
  await page.fill('input[name="title"]', packageData.title);
  await page.fill('textarea[name="description"]', packageData.description);
  await selectDropdown(
    page,
    '[data-testid="category-select"]',
    packageData.category
  );
  await page.click('button:has-text("Devam Et")');

  // Step 2: Pricing
  await page.fill('input[name="basicPrice"]', packageData.basicPrice);
  await page.click('button:has-text("Devam Et")');

  // Skip additional steps for now
  await page.click('button:has-text("Kaydet ve Yayınla")');

  // Wait for success
  await waitForApiResponse(page, /\/api\/v1\/user\/packages/);
}

/**
 * Payment helpers
 */

export async function fillStripeTestCard(page: Page): Promise<void> {
  // Switch to Stripe iframe
  const stripeFrame = page
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .first();

  // Fill card number
  await stripeFrame
    .locator('input[name="cardnumber"]')
    .fill('4242424242424242');

  // Fill expiry
  await stripeFrame.locator('input[name="exp-date"]').fill('12/34');

  // Fill CVC
  await stripeFrame.locator('input[name="cvc"]').fill('123');

  // Fill ZIP
  await stripeFrame.locator('input[name="postal"]').fill('12345');
}

/**
 * Clean up helpers
 */

export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

export async function clearCookies(page: Page): Promise<void> {
  await page.context().clearCookies();
}

export async function clearSession(page: Page): Promise<void> {
  await clearLocalStorage(page);
  await clearCookies(page);
}

/**
 * Screenshot helpers
 */

export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({
    path: `test-results/screenshots/${name}.png`,
    fullPage: true,
  });
}

/**
 * Scroll helpers
 */

export async function scrollToBottom(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
}

export async function scrollToElement(
  page: Page,
  selector: string
): Promise<void> {
  await page.locator(selector).scrollIntoViewIfNeeded();
}
