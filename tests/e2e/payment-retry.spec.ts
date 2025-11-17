import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Payment Retry Flow
 * Tests the complete user journey for retrying failed payments
 */

test.describe('Payment Retry Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer with failed payment
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display retry button for failed payment', async ({ page }) => {
    // Navigate to order with failed payment
    await page.goto('/dashboard/orders');

    // Find a failed order (you may need to create one first)
    const failedOrder = page.locator('[data-status="PAYMENT_FAILED"]').first();
    await failedOrder.click();

    // Verify retry button is visible
    await expect(
      page.getByRole('button', { name: /Tekrar Dene/i })
    ).toBeVisible();

    // Verify retry count is shown
    await expect(page.locator('text=/\\d\\/\\d/')).toBeVisible();
  });

  test('should show countdown timer when retry is not ready', async ({
    page,
  }) => {
    // Navigate to order with recent retry
    await page.goto('/dashboard/orders');

    const orderWithCooldown = page
      .locator('[data-has-cooldown="true"]')
      .first();

    if (await orderWithCooldown.isVisible()) {
      await orderWithCooldown.click();

      // Verify countdown is visible
      await expect(page.locator('text=/\\d:\\d{2}/')).toBeVisible();

      // Verify button is disabled
      const retryButton = page.getByRole('button', { name: /Tekrar Dene/i });
      await expect(retryButton).toBeDisabled();
    }
  });

  test('should successfully retry payment', async ({ page }) => {
    // Navigate to order ready for retry
    await page.goto('/dashboard/orders');

    const readyOrder = page.locator('[data-can-retry="true"]').first();

    if (await readyOrder.isVisible()) {
      await readyOrder.click();

      // Click retry button
      const retryButton = page.getByRole('button', { name: /Tekrar Dene/i });
      await retryButton.click();

      // Iyzico payment modal should appear (if using Iyzico)
      // Or manual payment instructions

      // Simulate successful payment (depends on payment method)
      // This part is environment-specific

      // Verify success notification
      await expect(
        page.locator('text=/Ödeme başarılı|Payment successful/i')
      ).toBeVisible({
        timeout: 15000,
      });

      // Verify order status updated
      await expect(page.locator('[data-status="PROCESSING"]')).toBeVisible();
    }
  });

  test('should show exhausted state after max retries', async ({ page }) => {
    // Navigate to exhausted order
    await page.goto('/dashboard/orders');

    const exhaustedOrder = page.locator('[data-status="EXHAUSTED"]').first();

    if (await exhaustedOrder.isVisible()) {
      await exhaustedOrder.click();

      // Verify exhausted badge
      await expect(page.getByText(/Tükendi|Exhausted/i)).toBeVisible();

      // Verify no retry button
      await expect(
        page.getByRole('button', { name: /Tekrar Dene/i })
      ).not.toBeVisible();
    }
  });

  test('should update retry count after failed retry', async ({ page }) => {
    // Navigate to order with retry available
    await page.goto('/dashboard/orders');

    const order = page.locator('[data-can-retry="true"]').first();

    if (await order.isVisible()) {
      await order.click();

      // Get current retry count
      const retryCountText = await page
        .locator('text=/\\d\\/\\d/')
        .textContent();
      const currentCount = parseInt(retryCountText?.split('/')[0] || '0');

      // Click retry button
      await page.getByRole('button', { name: /Tekrar Dene/i }).click();

      // Simulate payment failure (close modal or use invalid card)
      await page.keyboard.press('Escape');

      // Wait for retry count to update
      await page.waitForTimeout(2000);

      // Verify retry count increased
      const newRetryCountText = await page
        .locator('text=/\\d\\/\\d/')
        .textContent();
      const newCount = parseInt(newRetryCountText?.split('/')[0] || '0');

      expect(newCount).toBeGreaterThan(currentCount);
    }
  });

  test('should show error message on retry failure', async ({ page }) => {
    // Simulate network error during retry
    await page.route('**/api/v1/payments/*/retry', (route) =>
      route.abort('failed')
    );

    await page.goto('/dashboard/orders');
    const order = page.locator('[data-can-retry="true"]').first();

    if (await order.isVisible()) {
      await order.click();

      await page.getByRole('button', { name: /Tekrar Dene/i }).click();

      // Verify error toast
      await expect(page.locator('text=/Hata|Error/i')).toBeVisible();
    }
  });

  test('should refresh retry status automatically', async ({ page }) => {
    await page.goto('/dashboard/orders');
    const order = page.locator('[data-has-cooldown="true"]').first();

    if (await order.isVisible()) {
      await order.click();

      // Get initial countdown value
      const initialCountdown = await page
        .locator('text=/\\d:\\d{2}/')
        .textContent();

      // Wait for countdown to update
      await page.waitForTimeout(2000);

      // Get new countdown value
      const newCountdown = await page
        .locator('text=/\\d:\\d{2}/')
        .textContent();

      // Verify countdown decreased
      expect(newCountdown).not.toBe(initialCountdown);
    }
  });

  test('should navigate to payment page on successful retry', async ({
    page,
  }) => {
    await page.goto('/dashboard/orders');
    const order = page.locator('[data-can-retry="true"]').first();

    if (await order.isVisible()) {
      await order.click();

      await page.getByRole('button', { name: /Tekrar Dene/i }).click();

      // Should redirect to payment page or show payment modal
      await expect(page).toHaveURL(/\/checkout|\/payment/, { timeout: 10000 });
    }
  });
});

test.describe('Payment Retry - Buyer Restrictions', () => {
  test('should only show retry button to buyer, not seller', async ({
    page,
  }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('[name="email"]', 'seller@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to an order
    await page.goto('/dashboard/orders');
    const order = page.locator('[data-role="seller"]').first();

    if (await order.isVisible()) {
      await order.click();

      // Verify NO retry button for seller
      await expect(
        page.getByRole('button', { name: /Tekrar Dene/i })
      ).not.toBeVisible();
    }
  });
});

test.describe('Payment Retry - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display retry button properly on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const order = page.locator('[data-can-retry="true"]').first();

    if (await order.isVisible()) {
      await order.click();

      const retryButton = page.getByRole('button', { name: /Tekrar Dene/i });
      await expect(retryButton).toBeVisible();

      // Verify button is properly sized for mobile
      const buttonBox = await retryButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(100);
      expect(buttonBox?.height).toBeGreaterThan(36);
    }
  });
});
