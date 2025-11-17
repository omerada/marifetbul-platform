import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * E2E Tests for Invoice Download Flow
 * Tests the complete user journey for downloading and emailing invoices
 */

test.describe('Invoice Download Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as buyer
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should show invoice download button for completed order', async ({
    page,
  }) => {
    await page.goto('/dashboard/orders');

    // Find a completed order
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // Verify invoice download button is visible
    await expect(
      page.getByRole('button', { name: /Fatura İndir|Download Invoice/i })
    ).toBeVisible();
  });

  test('should not show invoice button for pending order', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const pendingOrder = page.locator('[data-status="PENDING"]').first();

    if (await pendingOrder.isVisible()) {
      await pendingOrder.click();

      // Verify NO invoice button for pending order
      await expect(
        page.getByRole('button', { name: /Fatura İndir|Download Invoice/i })
      ).not.toBeVisible();
    }
  });

  test('should download PDF invoice', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await page
      .getByRole('button', { name: /Fatura İndir|Download Invoice/i })
      .click();

    // Wait for download
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toMatch(/invoice-.*\.pdf/);

    // Verify file downloaded successfully
    const path = await download.path();
    expect(path).toBeTruthy();

    // Optional: Verify file size > 0
    if (path) {
      const stats = fs.statSync(path);
      expect(stats.size).toBeGreaterThan(0);
    }
  });

  test('should show loading state during download', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // Intercept request to slow it down
    await page.route('**/api/v1/orders/*/invoice', async (route) => {
      await page.waitForTimeout(2000);
      route.continue();
    });

    // Click download button
    await page.getByRole('button', { name: /Fatura İndir/i }).click();

    // Verify loading indicator
    await expect(page.locator('text=/İndiriliyor|Downloading/i')).toBeVisible();
  });

  test('should send invoice via email', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // Click email button (if available)
    const emailButton = page.getByRole('button', {
      name: /Email Gönder|Send Email/i,
    });

    if (await emailButton.isVisible()) {
      await emailButton.click();

      // Verify success notification
      await expect(
        page.locator('text=/Email gönderildi|Email sent/i')
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('should handle download errors gracefully', async ({ page }) => {
    // Simulate download error
    await page.route('**/api/v1/orders/*/invoice', (route) =>
      route.abort('failed')
    );

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    await page.getByRole('button', { name: /Fatura İndir/i }).click();

    // Verify error toast
    await expect(
      page.locator('text=/İndirme hatası|Download error/i')
    ).toBeVisible();
  });

  test('should display invoice info card', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // Check if invoice info card is visible
    const invoiceCard = page.locator('[data-testid="invoice-info-card"]');

    if (await invoiceCard.isVisible()) {
      // Verify invoice details are shown
      await expect(
        invoiceCard.locator('text=/Fatura No|Invoice Number/i')
      ).toBeVisible();
      await expect(invoiceCard.locator('text=/Tarih|Date/i')).toBeVisible();
      await expect(invoiceCard.locator('text=/Tutar|Amount/i')).toBeVisible();
    }
  });

  test('should allow multiple downloads', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const completedOrder = page.locator('[data-status="COMPLETED"]').first();
    await completedOrder.click();

    // First download
    const download1Promise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Fatura İndir/i }).click();
    const download1 = await download1Promise;
    expect(download1.suggestedFilename()).toMatch(/invoice-.*\.pdf/);

    // Wait a bit
    await page.waitForTimeout(1000);

    // Second download
    const download2Promise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Fatura İndir/i }).click();
    const download2 = await download2Promise;
    expect(download2.suggestedFilename()).toMatch(/invoice-.*\.pdf/);
  });

  test('should show invoice in orders list', async ({ page }) => {
    await page.goto('/dashboard/orders');

    // Find completed orders with invoice available
    const ordersWithInvoice = page.locator('[data-has-invoice="true"]');

    if ((await ordersWithInvoice.count()) > 0) {
      // Verify invoice indicator/icon is shown
      await expect(ordersWithInvoice.first()).toBeVisible();
    }
  });
});

test.describe('Invoice Download - Seller View', () => {
  test('should show invoice button to seller as well', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('[name="email"]', 'seller@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();

    if (await completedOrder.isVisible()) {
      await completedOrder.click();

      // Seller should also be able to download invoice
      await expect(
        page.getByRole('button', { name: /Fatura İndir/i })
      ).toBeVisible();
    }
  });
});

test.describe('Invoice Download - Mobile Responsive', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display invoice button properly on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();

    if (await completedOrder.isVisible()) {
      await completedOrder.click();

      const downloadButton = page.getByRole('button', {
        name: /Fatura İndir/i,
      });
      await expect(downloadButton).toBeVisible();

      // Verify button is properly sized for mobile
      const buttonBox = await downloadButton.boundingBox();
      expect(buttonBox?.width).toBeGreaterThan(100);
    }
  });

  test('should download invoice on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();

    if (await completedOrder.isVisible()) {
      await completedOrder.click();

      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /Fatura İndir/i }).click();
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toMatch(/invoice-.*\.pdf/);
    }
  });
});

test.describe('Invoice Download - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();

    if (await completedOrder.isVisible()) {
      await completedOrder.click();

      // Tab to invoice button
      await page.keyboard.press('Tab');

      const downloadButton = page.getByRole('button', {
        name: /Fatura İndir/i,
      });

      // Verify button can receive focus
      if (await downloadButton.isVisible()) {
        await downloadButton.focus();
        await expect(downloadButton).toBeFocused();

        // Trigger download with keyboard
        const downloadPromise = page.waitForEvent('download');
        await page.keyboard.press('Enter');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/invoice-.*\.pdf/);
      }
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'buyer@test.com');
    await page.fill('[name="password"]', 'Test123456!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/dashboard/orders');
    const completedOrder = page.locator('[data-status="COMPLETED"]').first();

    if (await completedOrder.isVisible()) {
      await completedOrder.click();

      const downloadButton = page.getByRole('button', {
        name: /Fatura İndir/i,
      });

      if (await downloadButton.isVisible()) {
        // Verify accessible name exists
        const accessibleName = await downloadButton.getAttribute('aria-label');
        expect(
          accessibleName || (await downloadButton.textContent())
        ).toBeTruthy();
      }
    }
  });
});
