import { test, expect } from '@playwright/test';

/**
 * ================================================
 * PASSWORD RESET FLOW E2E TESTS
 * ================================================
 * Comprehensive tests for forgot password and reset password functionality
 * Tests both frontend UI and backend API integration
 */

test.describe('Password Reset Flow', () => {
  test.describe('Forgot Password', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      // Check page elements
      await expect(page.locator('h1')).toContainText('Şifremi Unuttum');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText(
        /Şifre Sıfırlama Bağlantısı Gönder/i
      );
    });

    test('should show validation error for empty email', async ({ page }) => {
      await page.goto('/forgot-password');

      // Click submit without entering email
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=/geçerli.*e-posta/i')).toBeVisible({
        timeout: 3000,
      });
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.goto('/forgot-password');

      // Enter invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(
        page.locator('text=/geçerli.*e-posta.*giriniz/i')
      ).toBeVisible({ timeout: 3000 });
    });

    test('should send password reset email successfully', async ({ page }) => {
      await page.goto('/forgot-password');

      // Enter valid email
      await page.fill('input[type="email"]', 'test@example.com');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(page.locator('text=/E-posta Gönderildi/i')).toBeVisible({
        timeout: 10000,
      });
      await expect(
        page.locator('text=/test@example.com.*adresine/i')
      ).toBeVisible();
    });

    test('should have back to login link', async ({ page }) => {
      await page.goto('/forgot-password');

      const loginLink = page.locator('a[href="/login"]');
      await expect(loginLink).toBeVisible();

      // Click and verify navigation
      await loginLink.click();
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });

    test('should show register link in success state', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Wait for success state
      await expect(page.locator('text=/E-posta Gönderildi/i')).toBeVisible({
        timeout: 10000,
      });

      // Should have link to register
      const registerLink = page.locator('a[href="/register"]');
      await expect(registerLink).toBeVisible();
    });
  });

  test.describe('Reset Password', () => {
    test('should show error for missing token', async ({ page }) => {
      await page.goto('/reset-password');

      // Should show invalid link message
      await expect(page.locator('text=/Geçersiz Bağlantı/i')).toBeVisible();
      await expect(
        page.locator('text=/Şifre sıfırlama bağlantısı geçersiz/i')
      ).toBeVisible();
    });

    test('should display reset password form with valid token', async ({
      page,
    }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      // Check form elements
      await expect(page.locator('h1')).toContainText('Yeni Şifre Belirle');
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText(
        /Şifreyi Güncelle/i
      );
    });

    test('should show password requirements', async ({ page }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      // Should display password requirements
      await expect(page.locator('text=/Şifre gereksinimleri/i')).toBeVisible();
      await expect(page.locator('text=/En az 8 karakter/i')).toBeVisible();
      await expect(page.locator('text=/büyük harf/i')).toBeVisible();
      await expect(page.locator('text=/küçük harf/i')).toBeVisible();
      await expect(page.locator('text=/rakam/i')).toBeVisible();
    });

    test('should show validation error for weak password', async ({ page }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      // Enter weak password
      await page.fill('input[name="password"]', 'weak');
      await page.fill('input[name="confirmPassword"]', 'weak');
      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('text=/En az 8 karakter/i')).toBeVisible({
        timeout: 3000,
      });
    });

    test('should show error when passwords do not match', async ({ page }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      // Enter mismatched passwords
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
      await page.click('button[type="submit"]');

      // Should show mismatch error
      await expect(page.locator('text=/Şifreler eşleşmiyor/i')).toBeVisible({
        timeout: 3000,
      });
    });

    test('should toggle password visibility', async ({ page }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      const passwordInput = page.locator('input[name="password"]');

      // Initially should be password type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle button
      const toggleButton = page
        .locator('input[name="password"]')
        .locator('..')
        .locator('button');
      await toggleButton.click();

      // Should be text type now
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should reset password successfully with valid token', async ({
      page,
    }) => {
      // Note: This test assumes a valid mock token or backend integration
      const validToken = 'valid-reset-token';
      await page.goto(`/reset-password?token=${validToken}`);

      // Enter new password
      await page.fill('input[name="password"]', 'NewSecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show success message
      await expect(
        page.locator('text=/Şifre Başarıyla Değiştirildi/i')
      ).toBeVisible({ timeout: 10000 });

      // Should redirect to login after 3 seconds
      await page.waitForURL(/\/login/, { timeout: 5000 });
      expect(page.url()).toContain('/login');
    });

    test('should show error for expired token', async ({ page }) => {
      const expiredToken = 'expired-token-12345';
      await page.goto(`/reset-password?token=${expiredToken}`);

      await page.fill('input[name="password"]', 'NewSecurePass123!');
      await page.fill('input[name="confirmPassword"]', 'NewSecurePass123!');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(
        page.locator('text=/Bağlantı geçersiz veya süresi dolmuş olabilir/i')
      ).toBeVisible({ timeout: 10000 });
    });

    test('should have link to login page', async ({ page }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      const loginLink = page.locator('a[href="/login"]');
      await expect(loginLink).toBeVisible();
    });
  });

  test.describe('Integration Flow', () => {
    test('should complete full password reset flow', async ({ page }) => {
      // Step 1: Go to login page
      await page.goto('/login');

      // Step 2: Click forgot password
      const forgotPasswordLink = page.locator('a:has-text("Şifremi Unuttum")');
      await forgotPasswordLink.click();
      await page.waitForURL(/\/forgot-password/);

      // Step 3: Enter email and submit
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Step 4: Verify success message
      await expect(page.locator('text=/E-posta Gönderildi/i')).toBeVisible({
        timeout: 10000,
      });

      // Step 5: Simulate clicking reset link (in real scenario, get from email)
      const resetToken = 'valid-token-from-email';
      await page.goto(`/reset-password?token=${resetToken}`);

      // Step 6: Enter new password
      await page.fill('input[name="password"]', 'NewPassword123!');
      await page.fill('input[name="confirmPassword"]', 'NewPassword123!');
      await page.click('button[type="submit"]');

      // Step 7: Verify success and redirect
      await expect(
        page.locator('text=/Şifre Başarıyla Değiştirildi/i')
      ).toBeVisible({ timeout: 10000 });

      // Should redirect to login
      await page.waitForURL(/\/login/, { timeout: 5000 });
    });
  });

  test.describe('Accessibility', () => {
    test('forgot password form should be keyboard accessible', async ({
      page,
    }) => {
      await page.goto('/forgot-password');

      // Tab to email input
      await page.keyboard.press('Tab');
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeFocused();

      // Type email
      await page.keyboard.type('test@example.com');

      // Tab to submit button
      await page.keyboard.press('Tab');
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeFocused();

      // Press enter to submit
      await page.keyboard.press('Enter');

      // Should show success message
      await expect(page.locator('text=/E-posta Gönderildi/i')).toBeVisible({
        timeout: 10000,
      });
    });

    test('reset password form should be keyboard accessible', async ({
      page,
    }) => {
      const validToken = 'test-reset-token-12345';
      await page.goto(`/reset-password?token=${validToken}`);

      // Tab through form
      await page.keyboard.press('Tab');
      await expect(page.locator('input[name="password"]')).toBeFocused();

      await page.keyboard.type('NewPass123!');
      await page.keyboard.press('Tab');

      await expect(page.locator('input[name="confirmPassword"]')).toBeFocused();
      await page.keyboard.type('NewPass123!');

      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.route('**/api/v1/auth/forgot-password', (route) => {
        route.abort('failed');
      });

      await page.goto('/forgot-password');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/hata oluştu/i')).toBeVisible({
        timeout: 10000,
      });
    });

    test('should handle backend errors gracefully', async ({ page }) => {
      // Simulate backend error
      await page.route('**/api/v1/auth/forgot-password', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({
            success: false,
            message: 'Internal server error',
          }),
        });
      });

      await page.goto('/forgot-password');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.click('button[type="submit"]');

      // Should show error message
      await expect(page.locator('text=/hata/i')).toBeVisible({
        timeout: 10000,
      });
    });
  });
});
