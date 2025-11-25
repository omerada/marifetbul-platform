/**
 * ================================================
 * MULTI-USER SESSION UTILITIES FOR E2E TESTS
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 1: Test Infrastructure Setup
 *
 * Utilities for managing multiple authenticated users in same test
 * Required for testing:
 * - Review flagging (3 different users reporting same review)
 * - Buyer-Seller interactions (order completion, reviews)
 * - Admin moderation workflows
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { Browser, BrowserContext, Page } from '@playwright/test';

// ============================================================================
// TYPES
// ============================================================================

export interface UserSession {
  /** User identifier */
  userId: string;
  /** User role */
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  /** Browser context for isolation */
  context: BrowserContext;
  /** Page instance */
  page: Page;
  /** Authentication token */
  token?: string;
  /** User email */
  email: string;
}

export interface CreateUserSessionOptions {
  /** User email */
  email: string;
  /** User password */
  password: string;
  /** User role */
  role: 'buyer' | 'seller' | 'admin' | 'moderator';
  /** User ID (for reference) */
  userId?: string;
  /** Base URL for application */
  baseURL?: string;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Create authenticated user session
 *
 * Creates isolated browser context with authenticated user
 *
 * @param browser Browser instance
 * @param options User session options
 * @returns UserSession with authenticated context
 *
 * @example
 * ```typescript
 * const buyer = await createUserSession(browser, {
 *   email: 'buyer@test.com',
 *   password: 'Test123!',
 *   role: 'buyer',
 * });
 *
 * const seller = await createUserSession(browser, {
 *   email: 'seller@test.com',
 *   password: 'Test123!',
 *   role: 'seller',
 * });
 * ```
 */
export async function createUserSession(
  browser: Browser,
  options: CreateUserSessionOptions
): Promise<UserSession> {
  const {
    email,
    password,
    role,
    userId,
    baseURL = 'http://localhost:3000',
  } = options;

  // Create isolated browser context
  const context = await browser.newContext({
    baseURL,
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
  });

  const page = await context.newPage();

  // Navigate to login page
  await page.goto('/login');

  // Fill login form
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);

  // Submit login
  await page.click('[data-testid="login-button"]');

  // Wait for redirect to dashboard (login success)
  await page.waitForURL(/\/(dashboard|admin|moderator)/, { timeout: 10000 });

  // Extract auth token from localStorage
  const token = await page.evaluate(() => {
    return localStorage.getItem('authToken');
  });

  return {
    userId: userId || email.split('@')[0],
    role,
    context,
    page,
    token: token || undefined,
    email,
  };
}

/**
 * Create multiple user sessions concurrently
 *
 * More efficient than creating sessions sequentially
 *
 * @param browser Browser instance
 * @param userConfigs Array of user configurations
 * @returns Array of UserSession objects
 *
 * @example
 * ```typescript
 * const [buyer, seller, admin] = await createMultipleUserSessions(browser, [
 *   { email: 'buyer@test.com', password: 'Test123!', role: 'buyer' },
 *   { email: 'seller@test.com', password: 'Test123!', role: 'seller' },
 *   { email: 'admin@test.com', password: 'Admin123!', role: 'admin' },
 * ]);
 * ```
 */
export async function createMultipleUserSessions(
  browser: Browser,
  userConfigs: CreateUserSessionOptions[]
): Promise<UserSession[]> {
  return await Promise.all(
    userConfigs.map((config) => createUserSession(browser, config))
  );
}

/**
 * Close user session and cleanup
 *
 * @param session User session to close
 */
export async function closeUserSession(session: UserSession): Promise<void> {
  await session.page.close();
  await session.context.close();
}

/**
 * Close multiple user sessions
 *
 * @param sessions Array of user sessions
 */
export async function closeMultipleUserSessions(
  sessions: UserSession[]
): Promise<void> {
  await Promise.all(sessions.map((session) => closeUserSession(session)));
}

// ============================================================================
// ROLE-SPECIFIC HELPERS
// ============================================================================

/**
 * Create buyer-seller session pair
 *
 * Common pattern for order workflow tests
 *
 * @param browser Browser instance
 * @returns Tuple of [buyer, seller] sessions
 *
 * @example
 * ```typescript
 * const [buyer, seller] = await createBuyerSellerSessions(browser);
 *
 * // Buyer creates order
 * await buyer.page.goto(`/checkout/package-123`);
 *
 * // Seller delivers order
 * await seller.page.goto(`/dashboard/orders/${orderId}`);
 * ```
 */
export async function createBuyerSellerSessions(
  browser: Browser
): Promise<[UserSession, UserSession]> {
  const sessions = await createMultipleUserSessions(browser, [
    {
      email: 'buyer@test.com',
      password: 'Test123!',
      role: 'buyer',
      userId: 'test-buyer-id',
    },
    {
      email: 'seller@test.com',
      password: 'Test123!',
      role: 'seller',
      userId: 'test-seller-id',
    },
  ]);

  return [sessions[0], sessions[1]];
}

/**
 * Create admin session
 *
 * @param browser Browser instance
 * @returns Admin user session
 */
export async function createAdminSession(
  browser: Browser
): Promise<UserSession> {
  return await createUserSession(browser, {
    email: 'admin@marifetbul.com',
    password: 'Admin123!',
    role: 'admin',
    userId: 'test-admin-id',
  });
}

/**
 * Create moderator session
 *
 * @param browser Browser instance
 * @returns Moderator user session
 */
export async function createModeratorSession(
  browser: Browser
): Promise<UserSession> {
  return await createUserSession(browser, {
    email: 'moderator@marifetbul.com',
    password: 'Mod123!',
    role: 'moderator',
    userId: 'test-moderator-id',
  });
}

// ============================================================================
// FLAG TESTING HELPERS
// ============================================================================

/**
 * Create 3 user sessions for flag testing
 *
 * Review auto-flagging requires 3 different users to report
 *
 * @param browser Browser instance
 * @returns Array of 3 user sessions
 *
 * @example
 * ```typescript
 * const [user1, user2, user3] = await createFlagTestUsers(browser);
 *
 * // Each user reports the same review
 * for (const user of [user1, user2, user3]) {
 *   await user.page.click('[data-testid="flag-review-button"]');
 *   await user.page.click('[data-testid="confirm-flag"]');
 * }
 *
 * // Verify review is auto-flagged
 * const admin = await createAdminSession(browser);
 * await admin.page.goto('/admin/moderation/reviews');
 * await expect(admin.page.locator('.flagged-review')).toBeVisible();
 * ```
 */
export async function createFlagTestUsers(
  browser: Browser
): Promise<[UserSession, UserSession, UserSession]> {
  const sessions = await createMultipleUserSessions(browser, [
    {
      email: 'flagger1@test.com',
      password: 'Test123!',
      role: 'buyer',
      userId: 'flagger-1',
    },
    {
      email: 'flagger2@test.com',
      password: 'Test123!',
      role: 'buyer',
      userId: 'flagger-2',
    },
    {
      email: 'flagger3@test.com',
      password: 'Test123!',
      role: 'buyer',
      userId: 'flagger-3',
    },
  ]);

  return sessions as [UserSession, UserSession, UserSession];
}

// ============================================================================
// SESSION STATE HELPERS
// ============================================================================

/**
 * Switch active user in test
 *
 * Useful for alternating between users in same test
 *
 * @param session User session to activate
 * @returns Page instance for method chaining
 */
export function switchToUser(session: UserSession): Page {
  return session.page;
}

/**
 * Verify user is authenticated
 *
 * @param page Playwright page instance
 * @returns True if authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => {
    return localStorage.getItem('authToken');
  });

  return !!token;
}

/**
 * Get current user ID from session
 *
 * @param page Playwright page instance
 * @returns User ID or null
 */
export async function getCurrentUserId(page: Page): Promise<string | null> {
  return await page.evaluate(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch {
      return null;
    }
  });
}
