/**
 * ================================================
 * IYZICO PAYMENT E2E TESTS
 * ================================================
 * End-to-end tests for complete payment flow
 * 
 * Test Scenarios:
 * - Full checkout flow with credit card
 * - 3D Secure authentication
 * - Payment success/failure scenarios
 * - Callback page handling
 * - Error recovery flows
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Testing & QA
 */

import { test, expect, Page } from '@playwright/test';

// Test data
const TEST_CARDS = {
  VISA_SUCCESS: {
    number: '4111 1111 1111 1111',
    holder: 'JOHN DOE',
    expiry: { month: '12', year: '25' },
    cvc: '123',
  },
  MASTERCARD_SUCCESS: {
    number: '5555 5555 5555 4444',
    holder: 'JANE SMITH',
    expiry: { month: '06', year: '26' },
    cvc: '456',
  },
  AMEX_SUCCESS: {
    number: '3782 8224 6310 005',
    holder: 'BOB JOHNSON',
    expiry: { month: '09', year: '27' },
    cvc: '1234',
  },
  INVALID_CARD: {
    number: '4111 1111 1111 1112',
    holder: 'INVALID USER',
    expiry: { month: '12', year: '25' },
    cvc: '123',
  },
};

// Helper functions
async function fillPaymentForm(page: Page, cardData: typeof TEST_CARDS.VISA_SUCCESS) {
  await page.fill('[name="cardHolderName"]', cardData.holder);
  await page.fill('[name="cardNumber"]', cardData.number);
  await page.fill('[name="expiryMonth"]', cardData.expiry.month);
  await page.fill('[name="expiryYear"]', cardData.expiry.year);
  await page.fill('[name="cvc"]', cardData.cvc);
}

async function createTestOrder(page: Page): Promise<string> {
  // Navigate to marketplace
  await page.goto('/marketplace');
  
  // Select first package
  await page.click('[data-testid="package-card"]:first-child');
  
  // Click order button
  await page.click('[data-testid="order-package-btn"]');
  
  // Wait for checkout modal
  await page.waitForSelector('[data-testid="checkout-modal"]');
  
  // Get order ID from URL or modal
  const orderIdElement = await page.locator('[data-testid="order-id"]');
  return await orderIdElement.textContent() || 'test-order-id';
}

test.describe('Iyzico Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@marifetbul.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should complete successful payment with Visa card', async ({ page }) => {
    // Create test order
    const orderId = await createTestOrder(page);

    // Select Iyzico payment method
    await page.click('[data-testid="payment-method-iyzico"]');

    // Wait for payment form
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Fill payment form
    await fillPaymentForm(page, TEST_CARDS.VISA_SUCCESS);

    // Verify card type is detected
    await expect(page.locator('[data-testid="card-type"]')).toHaveText('VISA');

    // Submit payment
    await page.click('[data-testid="submit-payment-btn"]');

    // Wait for either success or 3D Secure redirect
    await Promise.race([
      page.waitForURL(/\/checkout\/callback/),
      page.waitForSelector('[data-testid="payment-success"]'),
    ]);

    // If redirected to callback, verify success state
    if (page.url().includes('/callback')) {
      await expect(page.locator('[data-testid="callback-status"]')).toHaveText(
        /Ödeme Başarılı|Ödeme Doğrulanıyor/
      );

      // Wait for final redirect
      await page.waitForURL(/\/orders/, { timeout: 10000 });
    }

    // Verify order status is updated
    await expect(page.locator('[data-testid="order-status"]')).toHaveText(/Ödendi|Paid/);
  });

  test('should handle 3D Secure authentication flow', async ({ page, context }) => {
    const orderId = await createTestOrder(page);

    // Select Iyzico payment
    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Fill form
    await fillPaymentForm(page, TEST_CARDS.VISA_SUCCESS);

    // Submit payment
    await page.click('[data-testid="submit-payment-btn"]');

    // Wait for 3D Secure page (might open in same or new tab)
    await page.waitForURL(/iyzico\.com|3dsecure/, { timeout: 5000 }).catch(() => {
      // If not redirected, might complete without 3DS
    });

    // If on 3D Secure page, complete authentication
    if (page.url().includes('iyzico') || page.url().includes('3dsecure')) {
      // Fill 3D Secure password (test environment)
      await page.fill('[name="password"]', '123456').catch(() => {});
      await page.click('[type="submit"]').catch(() => {});

      // Wait for redirect back to callback
      await page.waitForURL(/\/checkout\/callback/, { timeout: 10000 });
    }

    // Verify callback page shows processing
    await expect(page.locator('h1')).toContainText(/Ödeme Doğrulanıyor|Ödeme Başarılı/);

    // Wait for final redirect to order page
    await page.waitForURL(/\/orders/, { timeout: 10000 });
  });

  test('should display error for invalid card', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Fill with invalid card
    await fillPaymentForm(page, TEST_CARDS.INVALID_CARD);

    // Submit payment
    await page.click('[data-testid="submit-payment-btn"]');

    // Should show validation error
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(
      /geçersiz|invalid|başarısız|failed/i
    );
  });

  test('should validate form fields before submission', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Try to submit empty form
    await page.click('[data-testid="submit-payment-btn"]');

    // Should show validation errors
    await expect(page.locator('text=zorunlu|required')).toHaveCount(5);

    // Fill card holder name (too short)
    await page.fill('[name="cardHolderName"]', 'AB');
    await page.blur('[name="cardHolderName"]');

    // Should show length error
    await expect(page.locator('text=/en az 3|minimum 3/i')).toBeVisible();
  });

  test('should format card number automatically', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    const cardNumberInput = page.locator('[name="cardNumber"]');

    // Type card number without spaces
    await cardNumberInput.fill('4111111111111111');

    // Should be formatted with spaces
    await expect(cardNumberInput).toHaveValue('4111 1111 1111 1111');
  });

  test('should detect and display card type', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Test Visa
    await page.fill('[name="cardNumber"]', '4111');
    await expect(page.locator('[data-testid="card-type"]')).toHaveText('VISA');

    // Test Mastercard
    await page.fill('[name="cardNumber"]', '5555');
    await expect(page.locator('[data-testid="card-type"]')).toHaveText('MASTERCARD');

    // Test Amex
    await page.fill('[name="cardNumber"]', '3782');
    await expect(page.locator('[data-testid="card-type"]')).toHaveText('AMEX');
  });

  test('should allow canceling payment', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    // Click cancel/back button
    await page.click('[data-testid="cancel-payment-btn"]');

    // Should return to payment method selection
    await expect(page.locator('[data-testid="payment-method-select"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block API requests to simulate network error
    await page.route('**/api/v1/payments/intent', (route) => {
      route.abort('failed');
    });

    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    await fillPaymentForm(page, TEST_CARDS.VISA_SUCCESS);
    await page.click('[data-testid="submit-payment-btn"]');

    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText(
      /ağ hatası|network error|başarısız|failed/i
    );
  });

  test('should show loading state during payment', async ({ page }) => {
    const orderId = await createTestOrder(page);

    await page.click('[data-testid="payment-method-iyzico"]');
    await page.waitForSelector('[data-testid="iyzico-payment-form"]');

    await fillPaymentForm(page, TEST_CARDS.VISA_SUCCESS);

    // Click submit
    const submitButton = page.locator('[data-testid="submit-payment-btn"]');
    await submitButton.click();

    // Button should be disabled and show loading
    await expect(submitButton).toBeDisabled();
    await expect(page.locator('[data-testid="payment-loading"]')).toBeVisible();
  });
});

test.describe('Payment Callback Page', () => {
  test('should show processing state initially', async ({ page }) => {
    await page.goto('/checkout/callback?paymentIntentId=test_123&orderId=order_123');

    // Should show processing indicator
    await expect(page.locator('h1')).toContainText('Ödeme Doğrulanıyor');
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should display security notice', async ({ page }) => {
    await page.goto('/checkout/callback?paymentIntentId=test_123&orderId=order_123');

    // Should show security warning
    await expect(page.locator('text=/sayfayı kapatmayın|do not close/i')).toBeVisible();
  });

  test('should handle retry on failure', async ({ page }) => {
    // Mock failed payment confirmation
    await page.route('**/api/v1/payments/intent/*/confirm', (route) => {
      route.fulfill({
        status: 400,
        body: JSON.stringify({ message: 'Payment failed' }),
      });
    });

    await page.goto('/checkout/callback?paymentIntentId=test_123&orderId=order_123');

    // Wait for error state
    await expect(page.locator('h1')).toContainText('Ödeme Başarısız', {
      timeout: 10000,
    });

    // Should show retry button
    const retryButton = page.locator('[data-testid="retry-payment-btn"]');
    await expect(retryButton).toBeVisible();

    // Click retry
    await retryButton.click();

    // Should show processing again
    await expect(page.locator('h1')).toContainText('Ödeme Doğrulanıyor');
  });

  test('should show timeout state after max retries', async ({ page }) => {
    // Mock failed payment confirmation
    await page.route('**/api/v1/payments/intent/*/confirm', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    await page.goto('/checkout/callback?paymentIntentId=test_123&orderId=order_123');

    // Wait for error and retry 2 times
    for (let i = 0; i < 2; i++) {
      await expect(page.locator('[data-testid="retry-payment-btn"]')).toBeVisible({
        timeout: 10000,
      });
      await page.click('[data-testid="retry-payment-btn"]');
    }

    // After 2 retries, should show timeout state
    await expect(page.locator('h1')).toContainText('İşlem Zaman Aşımına Uğradı', {
      timeout: 10000,
    });
  });
});

test.describe('Payment Form Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/marketplace');
    await page.click('[data-testid="package-card"]:first-child');
    await page.click('[data-testid="order-package-btn"]');
    await page.click('[data-testid="payment-method-iyzico"]');

    // Tab through form fields
    await page.keyboard.press('Tab'); // Card holder name
    await page.keyboard.type('JOHN DOE');
    
    await page.keyboard.press('Tab'); // Card number
    await page.keyboard.type('4111111111111111');
    
    await page.keyboard.press('Tab'); // Expiry month
    await page.keyboard.type('12');
    
    await page.keyboard.press('Tab'); // Expiry year
    await page.keyboard.type('25');
    
    await page.keyboard.press('Tab'); // CVC
    await page.keyboard.type('123');
    
    await page.keyboard.press('Tab'); // Save card checkbox
    await page.keyboard.press('Space'); // Toggle checkbox

    // All fields should be filled
    await expect(page.locator('[name="cardHolderName"]')).toHaveValue('JOHN DOE');
    await expect(page.locator('[name="cardNumber"]')).toHaveValue('4111 1111 1111 1111');
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/marketplace');
    await page.click('[data-testid="package-card"]:first-child');
    await page.click('[data-testid="order-package-btn"]');
    await page.click('[data-testid="payment-method-iyzico"]');

    // Check for ARIA labels
    await expect(page.locator('[name="cardHolderName"]')).toHaveAttribute(
      'aria-label',
      /.+/
    );
    await expect(page.locator('[name="cardNumber"]')).toHaveAttribute('aria-label', /.+/);
    await expect(page.locator('[name="cvc"]')).toHaveAttribute('aria-label', /.+/);
  });

  test('should announce errors to screen readers', async ({ page }) => {
    await page.goto('/marketplace');
    await page.click('[data-testid="package-card"]:first-child');
    await page.click('[data-testid="order-package-btn"]');
    await page.click('[data-testid="payment-method-iyzico"]');

    // Submit empty form
    await page.click('[data-testid="submit-payment-btn"]');

    // Error messages should have role="alert"
    const alerts = page.locator('[role="alert"]');
    await expect(alerts).toHaveCount(5); // One for each required field
  });
});
