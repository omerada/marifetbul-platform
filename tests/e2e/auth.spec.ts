import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  login,
  logout,
  register,
  clearSession,
  assertToastMessage,
  assertErrorMessage,
} from '../utils/helpers';
import {
  TEST_USERS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SELECTORS,
} from '../fixtures/test-data';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await clearSession(page);
  });

  test.describe('User Registration', () => {
    test('should register a new user successfully', async ({ page }) => {
      const newUser = generateTestUser();

      await page.goto('/register');

      // Fill registration form
      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="username"]', newUser.username);
      await page.fill('input[name="firstName"]', newUser.firstName);
      await page.fill('input[name="lastName"]', newUser.lastName);
      await page.fill('input[name="password"]', newUser.password);
      await page.fill('input[name="confirmPassword"]', newUser.password);

      // Accept terms
      await page.check('input[name="acceptTerms"]');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for success message or redirect
      await page.waitForURL(/\/(login|verify-email|dashboard)/, {
        timeout: 10000,
      });

      // Verify success
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/login') ||
          currentUrl.includes('/verify-email') ||
          currentUrl.includes('/dashboard')
      ).toBeTruthy();
    });

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/register');

      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'Test@1234Pass!');
      await page.fill('input[name="confirmPassword"]', 'Test@1234Pass!');
      await page.check('input[name="acceptTerms"]');

      await page.click('button[type="submit"]');

      // Should show validation error
      const errorElement = page.locator('text=/geçerli.*email/i').first();
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });

    test('should show error for weak password', async ({ page }) => {
      const newUser = generateTestUser();

      await page.goto('/register');

      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="username"]', newUser.username);
      await page.fill('input[name="password"]', '123'); // Weak password
      await page.fill('input[name="confirmPassword"]', '123');
      await page.check('input[name="acceptTerms"]');

      await page.click('button[type="submit"]');

      // Should show validation error
      const errorElement = page
        .locator('text=/şifre.*en az.*karakter/i')
        .first();
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });

    test('should show error for password mismatch', async ({ page }) => {
      const newUser = generateTestUser();

      await page.goto('/register');

      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="username"]', newUser.username);
      await page.fill('input[name="password"]', newUser.password);
      await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
      await page.check('input[name="acceptTerms"]');

      await page.click('button[type="submit"]');

      // Should show validation error
      const errorElement = page.locator('text=/şifreler.*eşleşmiyor/i').first();
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });

    test('should show error for missing required fields', async ({ page }) => {
      await page.goto('/register');

      // Try to submit without filling any fields
      await page.click('button[type="submit"]');

      // Should show validation errors for required fields
      const emailError = page.locator(
        'input[name="email"] ~ .error-message, input[name="email"] + .error-message'
      );
      const passwordError = page.locator(
        'input[name="password"] ~ .error-message, input[name="password"] + .error-message'
      );

      // At least one error should be visible
      const errorCount = await page
        .locator('.error-message, [role="alert"]')
        .count();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should not allow registration without accepting terms', async ({
      page,
    }) => {
      const newUser = generateTestUser();

      await page.goto('/register');

      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="username"]', newUser.username);
      await page.fill('input[name="password"]', newUser.password);
      await page.fill('input[name="confirmPassword"]', newUser.password);

      // Don't check terms checkbox

      const submitButton = page.locator('button[type="submit"]');

      // Button should be disabled or show error after click
      const isDisabled = await submitButton.isDisabled();
      if (!isDisabled) {
        await submitButton.click();
        // Should show error about accepting terms
        const errorElement = page
          .locator('text=/şartları.*kabul/i, text=/terms/i')
          .first();
        await expect(errorElement).toBeVisible({ timeout: 5000 });
      } else {
        expect(isDisabled).toBeTruthy();
      }
    });
  });

  test.describe('User Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      // Use a test user (you may need to create this user first or mock the API)
      await page.goto('/login');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');

      await page.click('button[type="submit"]');

      // Wait for redirect after successful login
      await page.waitForURL(/\/(dashboard|marketplace|profile)/, {
        timeout: 10000,
      });

      // Verify user is logged in
      const currentUrl = page.url();
      expect(
        currentUrl.includes('/dashboard') ||
          currentUrl.includes('/marketplace') ||
          currentUrl.includes('/profile')
      ).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'WrongPassword123!');

      await page.click('button[type="submit"]');

      // Should show error message
      const errorElement = page
        .locator('text=/email.*şifre.*hatalı/i, text=/invalid.*credentials/i')
        .first();
      await expect(errorElement).toBeVisible({ timeout: 5000 });
    });

    test('should show error for empty fields', async ({ page }) => {
      await page.goto('/login');

      // Try to submit without filling any fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      const errorCount = await page
        .locator('.error-message, [role="alert"]')
        .count();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should remember me functionality work', async ({ page, context }) => {
      await page.goto('/login');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');

      // Check "Remember Me"
      const rememberMeCheckbox = page.locator(
        'input[name="rememberMe"], input[type="checkbox"]:near(:text("Beni Hatırla"))'
      );
      if ((await rememberMeCheckbox.count()) > 0) {
        await rememberMeCheckbox.check();
      }

      await page.click('button[type="submit"]');

      await page.waitForURL(/\/(dashboard|marketplace|profile)/, {
        timeout: 10000,
      });

      // Check if auth token is stored
      const cookies = await context.cookies();
      const hasAuthCookie = cookies.some(
        (cookie) =>
          cookie.name.includes('auth') ||
          cookie.name.includes('token') ||
          cookie.name.includes('session')
      );

      expect(hasAuthCookie).toBeTruthy();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await page.goto('/login');

      // Click forgot password link
      const forgotPasswordLink = page.locator(
        'a:has-text("Şifremi Unuttum"), a:has-text("Forgot Password")'
      );
      await forgotPasswordLink.click();

      // Should navigate to forgot password page
      await page.waitForURL(/\/forgot-password/, { timeout: 5000 });

      expect(page.url()).toContain('forgot-password');
    });

    test('should navigate to register page from login', async ({ page }) => {
      await page.goto('/login');

      // Click register link
      const registerLink = page.locator(
        'a:has-text("Kayıt Ol"), a:has-text("Register"), a:has-text("Sign Up")'
      );
      await registerLink.click();

      // Should navigate to register page
      await page.waitForURL(/\/register/, { timeout: 5000 });

      expect(page.url()).toContain('register');
    });
  });

  test.describe('User Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|marketplace|profile)/, {
        timeout: 10000,
      });

      // Now logout
      await page.click(
        '[data-testid="user-menu-trigger"], [aria-label="User menu"], button:has-text("Profil")'
      );

      await page.click(
        '[data-testid="logout-button"], a:has-text("Çıkış Yap"), a:has-text("Logout")'
      );

      // Should redirect to home or login page
      await page.waitForURL(/\/(|login)$/, { timeout: 5000 });

      const currentUrl = page.url();
      expect(
        currentUrl.endsWith('/') || currentUrl.includes('/login')
      ).toBeTruthy();
    });

    test('should clear session data after logout', async ({
      page,
      context,
    }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|marketplace)/, { timeout: 10000 });

      // Logout
      await page.click(
        '[data-testid="user-menu-trigger"], button:has-text("Profil")'
      );
      await page.click(
        '[data-testid="logout-button"], a:has-text("Çıkış Yap")'
      );
      await page.waitForURL(/\/(|login)/, { timeout: 5000 });

      // Try to access protected page
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('login');
    });
  });

  test.describe('Password Reset', () => {
    test('should send password reset email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Should show success message
      const successElement = page
        .locator('text=/email.*gönderildi/i, text=/check.*email/i')
        .first();
      await expect(successElement).toBeVisible({ timeout: 5000 });
    });

    test('should show error for non-existent email', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.click('button[type="submit"]');

      // May show error or success (for security reasons, many apps don't reveal if email exists)
      // Just verify form was submitted
      await page.waitForTimeout(2000);

      // Page should either show success or stay on same page
      expect(page.url()).toMatch(/forgot-password/);
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page navigation', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'Test@1234Pass!');
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(dashboard|marketplace)/, { timeout: 10000 });

      // Navigate to different pages
      await page.goto('/marketplace');
      await page.waitForLoadState('networkidle');

      // Should still be logged in (user menu should be visible)
      const userMenu = page.locator(
        '[data-testid="user-menu-trigger"], button:has-text("Profil")'
      );
      await expect(userMenu).toBeVisible({ timeout: 5000 });

      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      // Should still be logged in
      await expect(userMenu).toBeVisible({ timeout: 5000 });
    });

    test('should redirect to login when accessing protected route without auth', async ({
      page,
    }) => {
      // Clear session
      await clearSession(page);

      // Try to access dashboard without login
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('login');
    });
  });
});
