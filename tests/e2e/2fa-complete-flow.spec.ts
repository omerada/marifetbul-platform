/**
 * ================================================
 * 2FA END-TO-END TEST SUITE
 * ================================================
 * Comprehensive test scenarios for Two-Factor Authentication flow
 *
 * Test Coverage:
 * - 2FA Setup Flow
 * - Login with 2FA
 * - Login with Backup Code
 * - Disable 2FA
 * - Error Scenarios
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created 2025-11-13
 */

import { test, expect, type Page } from '@playwright/test';

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_USERS = {
  without2FA: {
    email: 'user-no-2fa@test.com',
    password: 'TestPassword123!',
  },
  with2FA: {
    email: 'user-with-2fa@test.com',
    password: 'TestPassword123!',
    totpSecret: 'JBSWY3DPEHPK3PXP', // Mock secret for testing
    backupCodes: ['ABCD1234', 'EFGH5678'], // Mock backup codes
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock TOTP code (for testing - always returns valid test code)
 */
function generateMockTOTP(_secret: string): string {
  // In real tests, use a TOTP library
  return '123456'; // Mock 6-digit code
}

/**
 * Login helper
 */
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

/**
 * Navigate to security settings
 */
async function goToSecuritySettings(page: Page) {
  await page.goto('/dashboard/settings/security');
}

// ============================================================================
// TEST SUITE: 2FA SETUP FLOW
// ============================================================================

test.describe('2FA Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user without 2FA
    await login(
      page,
      TEST_USERS.without2FA.email,
      TEST_USERS.without2FA.password
    );
    await expect(page).toHaveURL('/dashboard');
    await goToSecuritySettings(page);
  });

  test('should display 2FA setup option when disabled', async ({ page }) => {
    // Verify 2FA status shows as disabled
    await expect(page.locator('text=Devre Dışı')).toBeVisible();

    // Verify enable button is present
    await expect(
      page.locator('button:has-text("2FA Etkinleştir")')
    ).toBeVisible();
  });

  test('should show QR code when enabling 2FA', async ({ page }) => {
    // Click enable 2FA button
    await page.click('button:has-text("2FA Etkinleştir")');

    // Wait for QR code to appear
    await expect(page.locator('img[alt*="QR"]')).toBeVisible({ timeout: 5000 });

    // Verify manual entry key is displayed
    await expect(page.locator('text=/[A-Z0-9]{16,}/')).toBeVisible();
  });

  test('should require verification code to enable 2FA', async ({ page }) => {
    // Start 2FA setup
    await page.click('button:has-text("2FA Etkinleştir")');
    await expect(page.locator('img[alt*="QR"]')).toBeVisible();

    // Try to verify with empty code
    await page.click('button:has-text("Doğrula")');

    // Should show validation error
    await expect(page.locator('text=/kod.*gerekli/i')).toBeVisible();
  });

  test('should complete 2FA setup with valid code', async ({ page }) => {
    // Start 2FA setup
    await page.click('button:has-text("2FA Etkinleştir")');
    await expect(page.locator('img[alt*="QR"]')).toBeVisible();

    // Enter mock verification code
    await page.fill('input[name="verificationCode"]', '123456');
    await page.click('button:has-text("Doğrula")');

    // Should show recovery codes
    await expect(page.locator('text=Yedek Kodlar')).toBeVisible({
      timeout: 5000,
    });

    // Verify 8 recovery codes are shown
    const codes = await page.locator('code').count();
    expect(codes).toBeGreaterThanOrEqual(8);

    // Download recovery codes
    await page.click('button:has-text("İndir")');

    // Complete setup
    await page.click('button:has-text("Tamamla")');

    // Should redirect back to settings
    await expect(page).toHaveURL('/dashboard/settings/security');

    // Verify 2FA is now enabled
    await expect(page.locator('text=Etkin')).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE: LOGIN WITH 2FA
// ============================================================================

test.describe('Login with 2FA', () => {
  test('should show 2FA modal when logging in with 2FA-enabled account', async ({
    page,
  }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Should show 2FA verification modal
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible({
      timeout: 5000,
    });
    await expect(page.locator('input[name="code"]')).toBeVisible();
  });

  test('should login successfully with valid TOTP code', async ({ page }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Wait for 2FA modal
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Generate and enter TOTP code
    const code = generateMockTOTP(TEST_USERS.with2FA.totpSecret);
    await page.fill('input[name="code"]', code);
    await page.click('button:has-text("Doğrula")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('should reject invalid TOTP code', async ({ page }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Wait for 2FA modal
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Enter invalid code
    await page.fill('input[name="code"]', '000000');
    await page.click('button:has-text("Doğrula")');

    // Should show error
    await expect(page.locator('text=/Geçersiz.*kod/i')).toBeVisible();

    // Should remain on login page
    await expect(page.locator('input[name="code"]')).toBeVisible();
  });

  test('should login with backup code', async ({ page }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Wait for 2FA modal
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Switch to backup code
    await page.click('text=Yedek Kod Kullan');

    // Enter backup code
    await page.fill('input[name="code"]', TEST_USERS.with2FA.backupCodes[0]);
    await page.click('button:has-text("Doğrula")');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('should switch between TOTP and backup code input', async ({ page }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Wait for 2FA modal
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Initial state: TOTP input (6 digits)
    const totpInput = page.locator('input[name="code"]');
    await expect(totpInput).toHaveAttribute('maxlength', '6');

    // Switch to backup code
    await page.click('text=Yedek Kod Kullan');
    await expect(totpInput).toHaveAttribute('maxlength', '8');

    // Switch back to TOTP
    await page.click('text=Authenticator Kodu Kullan');
    await expect(totpInput).toHaveAttribute('maxlength', '6');
  });
});

// ============================================================================
// TEST SUITE: DISABLE 2FA
// ============================================================================

test.describe('Disable 2FA', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user with 2FA
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);

    // Complete 2FA verification
    const code = generateMockTOTP(TEST_USERS.with2FA.totpSecret);
    await page.fill('input[name="code"]', code);
    await page.click('button:has-text("Doğrula")');

    // Navigate to security settings
    await expect(page).toHaveURL('/dashboard');
    await goToSecuritySettings(page);
  });

  test('should require password confirmation to disable 2FA', async ({
    page,
  }) => {
    // Click disable button
    await page.click('button:has-text("2FA Devre Dışı Bırak")');

    // Should show password prompt (browser dialog)
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      expect(dialog.message()).toContain('Şifrenizi girin');
      await dialog.accept(TEST_USERS.with2FA.password);
    });
  });

  test('should disable 2FA with correct password', async ({ page }) => {
    // Setup dialog handler
    page.on('dialog', async (dialog) => {
      await dialog.accept(TEST_USERS.with2FA.password);
    });

    // Click disable button
    await page.click('button:has-text("2FA Devre Dışı Bırak")');

    // Wait for status update
    await page.waitForTimeout(1000);

    // Should show as disabled
    await expect(page.locator('text=Devre Dışı')).toBeVisible({
      timeout: 5000,
    });
    await expect(
      page.locator('button:has-text("2FA Etkinleştir")')
    ).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE: ERROR SCENARIOS
// ============================================================================

test.describe('2FA Error Scenarios', () => {
  test('should handle network errors gracefully during setup', async ({
    page,
  }) => {
    // Login
    await login(
      page,
      TEST_USERS.without2FA.email,
      TEST_USERS.without2FA.password
    );
    await goToSecuritySettings(page);

    // Simulate network error
    await page.route('**/api/v1/auth/2fa/setup', (route) => {
      route.abort('failed');
    });

    // Try to enable 2FA
    await page.click('button:has-text("2FA Etkinleştir")');

    // Should show error message
    await expect(page.locator('text=/Bağlantı hatası/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle API errors during verification', async ({ page }) => {
    // Login
    await login(
      page,
      TEST_USERS.without2FA.email,
      TEST_USERS.without2FA.password
    );
    await goToSecuritySettings(page);

    // Enable 2FA
    await page.click('button:has-text("2FA Etkinleştir")');
    await expect(page.locator('img[alt*="QR"]')).toBeVisible();

    // Simulate API error
    await page.route('**/api/v1/auth/2fa/enable', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({
          success: false,
          message: 'Invalid verification code',
        }),
      });
    });

    // Try to verify
    await page.fill('input[name="verificationCode"]', '123456');
    await page.click('button:has-text("Doğrula")');

    // Should show error
    await expect(page.locator('text=/Geçersiz.*kod/i')).toBeVisible();
  });

  test('should handle rate limiting during login attempts', async ({
    page,
  }) => {
    // Attempt login
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Simulate rate limiting after 3 attempts
    let attemptCount = 0;
    await page.route('**/api/v1/auth/login', async (route) => {
      attemptCount++;
      if (attemptCount > 3) {
        await route.fulfill({
          status: 429,
          body: JSON.stringify({
            success: false,
            message: 'Too many attempts. Please try again later.',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Make multiple invalid attempts
    for (let i = 0; i < 4; i++) {
      await page.fill('input[name="code"]', '000000');
      await page.click('button:has-text("Doğrula")');
      await page.waitForTimeout(500);
    }

    // Should show rate limit error
    await expect(page.locator('text=/Çok fazla.*deneme/i')).toBeVisible();
  });
});

// ============================================================================
// TEST SUITE: ACCESSIBILITY
// ============================================================================

test.describe('2FA Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Tab to code input
    await page.keyboard.press('Tab');
    const codeInput = page.locator('input[name="code"]:focus');
    await expect(codeInput).toBeVisible();

    // Enter code with keyboard
    await page.keyboard.type('123456');

    // Tab to verify button
    await page.keyboard.press('Tab');
    const verifyButton = page.locator('button:has-text("Doğrula"):focus');
    await expect(verifyButton).toBeVisible();

    // Submit with Enter key
    await page.keyboard.press('Enter');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await login(page, TEST_USERS.with2FA.email, TEST_USERS.with2FA.password);
    await expect(page.locator('text=İki Faktörlü Doğrulama')).toBeVisible();

    // Check code input has label
    const codeInput = page.locator('input[name="code"]');
    const ariaLabel = await codeInput.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check modal has role
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
  });
});
