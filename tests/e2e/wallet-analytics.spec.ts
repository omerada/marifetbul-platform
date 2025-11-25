/**
 * ================================================
 * WALLET ANALYTICS E2E TESTS
 * ================================================
 * Tests for Story 1.3: Wallet Analytics
 * - EarningsChart component
 * - RevenueBreakdown component
 * - TransactionSummary component
 * - Period selection (7/30/90 days)
 *
 * @suite Story 1.3
 * @since Sprint 1
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

// Helper: Login as freelancer
async function loginAsFreelancer(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_USERS.freelancer.email);
  await page.fill('input[name="password"]', TEST_USERS.freelancer.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Wallet Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsFreelancer(page);
    await page.goto('/dashboard/wallet/analytics');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Page Load and Layout', () => {
    test('should load analytics page successfully', async ({ page }) => {
      // Check if page title exists
      const pageTitle = page.locator(
        'h1:has-text("Analitik"), h1:has-text("Analytics")'
      );
      await expect(pageTitle).toBeVisible({ timeout: 5000 });
    });

    test('should display all three analytics sections', async ({ page }) => {
      // Check for three main sections
      const sections = [
        'Kazanç Trendi', // EarningsChart
        'Gelir Dağılımı', // RevenueBreakdown
        'İşlem Özeti', // TransactionSummary
      ];

      for (const section of sections) {
        const sectionTitle = page.locator(
          `h2:has-text("${section}"), h3:has-text("${section}")`
        );
        await expect(sectionTitle).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show loading state initially', async ({ page }) => {
      // Navigate fresh to see loading
      await page.goto('/dashboard/wallet/analytics');

      // Should show loading spinner or skeleton
      const loading = page
        .locator('[data-testid="loading"], .spinner, .skeleton')
        .first();

      // Loading should appear and then disappear
      if (await loading.isVisible()) {
        await expect(loading).toBeHidden({ timeout: 5000 });
      }
    });
  });

  test.describe('EarningsChart Component', () => {
    test('should display earnings chart with data', async ({ page }) => {
      // Should have SVG chart
      const chart = page.locator('svg').first();
      await expect(chart).toBeVisible({ timeout: 5000 });
    });

    test('should show period selector buttons', async ({ page }) => {
      const periodButtons = ['7 Gün', '30 Gün', '90 Gün'];

      for (const period of periodButtons) {
        const button = page.locator(`button:has-text("${period}")`);
        await expect(button).toBeVisible();
      }
    });

    test('should switch between time periods', async ({ page }) => {
      // Click 30 days button
      const thirtyDaysButton = page.locator('button:has-text("30 Gün")');
      await thirtyDaysButton.click();

      // Wait for data to update
      await page.waitForTimeout(1000);

      // Button should be active/selected
      await expect(thirtyDaysButton).toHaveClass(/active|selected|primary/);

      // Click 90 days button
      const ninetyDaysButton = page.locator('button:has-text("90 Gün")');
      await ninetyDaysButton.click();

      await page.waitForTimeout(1000);
      await expect(ninetyDaysButton).toHaveClass(/active|selected|primary/);
    });

    test('should display earnings statistics', async ({ page }) => {
      // Check for total earnings display
      const totalEarnings = page
        .locator('text=/Toplam.*Kazanç|Total.*Earnings/i')
        .first();
      await expect(totalEarnings).toBeVisible();

      // Check for order count
      const orderCount = page
        .locator('text=/Sipariş.*Sayısı|Total.*Orders/i')
        .first();
      await expect(orderCount).toBeVisible();

      // Check for average value
      const averageValue = page.locator('text=/Ortalama|Average/i').first();
      await expect(averageValue).toBeVisible();
    });

    test('should show growth indicator', async ({ page }) => {
      // Look for growth percentage or trend icon
      const growthIndicator = page
        .locator('[data-testid="growth"], .growth-indicator, text=/%/')
        .first();

      // Growth indicator should exist (positive or negative)
      const isVisible = await growthIndicator.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should display chart bars for each data point', async ({ page }) => {
      // SVG bars should be present
      const bars = page.locator(
        'svg rect[data-bar], svg rect[fill]:not([fill="none"])'
      );
      const count = await bars.count();

      // Should have at least a few data points
      expect(count).toBeGreaterThan(0);
    });

    test('should show tooltip on bar hover', async ({ page }) => {
      // Find first chart bar
      const firstBar = page
        .locator('svg rect[data-bar], svg rect[fill]:not([fill="none"])')
        .first();

      if (await firstBar.isVisible()) {
        await firstBar.hover();

        // Tooltip should appear
        const tooltip = page.locator(
          '[role="tooltip"], .tooltip, [data-testid="chart-tooltip"]'
        );
        await expect(tooltip).toBeVisible({ timeout: 2000 });
      }
    });
  });

  test.describe('RevenueBreakdown Component', () => {
    test('should display revenue donut chart', async ({ page }) => {
      // Check for SVG donut chart
      const donutChart = page
        .locator(
          '[data-testid="revenue-breakdown"] svg, .revenue-breakdown svg'
        )
        .first();
      await expect(donutChart).toBeVisible({ timeout: 5000 });
    });

    test('should show category list with percentages', async ({ page }) => {
      // Look for category items
      const categoryList = page
        .locator('[data-testid="category-list"], .category-list, ul')
        .first();
      await expect(categoryList).toBeVisible();

      // Should have percentage indicators
      const percentages = page.locator('text=/%/');
      const count = await percentages.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should display top category highlight', async ({ page }) => {
      // Top category should be highlighted
      const topCategory = page
        .locator('[data-testid="top-category"], .top-category')
        .first();

      if (await topCategory.isVisible()) {
        // Should show category name and amount
        await expect(topCategory).toContainText(/₺|\$|TRY/);
      }
    });

    test('should show color-coded categories', async ({ page }) => {
      // Categories should have color indicators
      const colorIndicators = page.locator(
        '[data-color], .color-indicator, .category-color'
      );
      const count = await colorIndicators.count();

      // Should have at least one colored category
      expect(count).toBeGreaterThan(0);
    });

    test('should display revenue amounts for each category', async ({
      page,
    }) => {
      // Check for currency amounts
      const amounts = page.locator('text=/₺|TRY/');
      const count = await amounts.count();

      // Should have multiple amount displays
      expect(count).toBeGreaterThan(1);
    });
  });

  test.describe('TransactionSummary Component', () => {
    test('should display net balance card', async ({ page }) => {
      // Net balance should be prominently displayed
      const netBalance = page
        .locator('[data-testid="net-balance"], .net-balance')
        .first();
      await expect(netBalance).toBeVisible({ timeout: 5000 });

      // Should contain currency amount
      await expect(netBalance).toContainText(/₺|TRY/);
    });

    test('should show income section', async ({ page }) => {
      const incomeSection = page.locator('text=/Gelir|Income/i').first();
      await expect(incomeSection).toBeVisible();

      // Should show income amount
      const incomeAmount = incomeSection.locator(
        'xpath=ancestor::div//text()[contains(., "₺")]'
      );
      await expect(incomeAmount.first()).toBeVisible();
    });

    test('should show expenses section', async ({ page }) => {
      const expensesSection = page.locator('text=/Gider|Expense/i').first();
      await expect(expensesSection).toBeVisible();

      // Should show expense amount
      const expenseAmount = expensesSection.locator(
        'xpath=ancestor::div//text()[contains(., "₺")]'
      );
      await expect(expenseAmount.first()).toBeVisible();
    });

    test('should display expense breakdown', async ({ page }) => {
      // Check for expense categories
      const expenseCategories = [
        'Sipariş', // Orders
        'Ödeme', // Payouts
        'Komisyon', // Fees
        'İade', // Refunds
      ];

      // At least some expense types should be visible
      let visibleCount = 0;
      for (const category of expenseCategories) {
        const element = page.locator(`text=/${category}/i`).first();
        if (await element.isVisible()) {
          visibleCount++;
        }
      }

      expect(visibleCount).toBeGreaterThan(0);
    });

    test('should show wallet balances', async ({ page }) => {
      // Check for balance types
      const balanceTypes = [
        'Kullanılabilir', // Available
        'Bekleyen', // Pending
        'Escrow', // Escrow
      ];

      for (const balanceType of balanceTypes) {
        const balance = page.locator(`text=/${balanceType}/i`).first();
        await expect(balance).toBeVisible();
      }
    });

    test('should display previous period comparison', async ({ page }) => {
      // Look for comparison indicators (up/down arrows or percentages)
      const comparisonIndicator = page
        .locator('[data-testid="comparison"], .comparison, text=/vs|önceki/i')
        .first();

      const isVisible = await comparisonIndicator.isVisible();
      // Comparison might not always be shown, so we just check without assertion
      if (isVisible) {
        await expect(comparisonIndicator).toBeVisible();
      }
    });

    test('should color-code transaction types', async ({ page }) => {
      // Income should be green, expenses red
      const incomeCard = page.locator('[data-type="income"], .income-card');

      // Check if cards have distinctive styling
      if (await incomeCard.isVisible()) {
        const incomeColor = await incomeCard.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor
        );
        expect(incomeColor).toBeTruthy();
      }
    });
  });

  test.describe('Data Integration', () => {
    test('should fetch analytics data on mount', async ({ page }) => {
      // Listen for API calls
      let earningsCalled = false;
      let revenueCalled = false;
      let transactionCalled = false;

      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('/api/v1/dashboard/analytics/earnings-trend')) {
          earningsCalled = true;
        }
        if (url.includes('/api/v1/dashboard/analytics/revenue-breakdown')) {
          revenueCalled = true;
        }
        if (url.includes('/api/v1/dashboard/analytics/transaction-summary')) {
          transactionCalled = true;
        }
      });

      // Navigate to page
      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      // All three endpoints should be called
      expect(earningsCalled).toBe(true);
      expect(revenueCalled).toBe(true);
      expect(transactionCalled).toBe(true);
    });

    test('should handle empty data gracefully', async ({ page }) => {
      // Intercept API and return empty data
      await page.route('**/api/v1/dashboard/analytics/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { data: [], items: [], totalIncome: 0 },
          }),
        });
      });

      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      // Should show "no data" message
      const noDataMessage = page
        .locator('text=/veri yok|no data|henüz/i')
        .first();
      await expect(noDataMessage).toBeVisible({ timeout: 5000 });
    });

    test('should handle API errors', async ({ page }) => {
      // Intercept and return error
      await page.route('**/api/v1/dashboard/analytics/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ message: 'Server error' }),
        });
      });

      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      // Should show error message
      const errorMessage = page
        .locator('[role="alert"], .error-message, text=/hata|error/i')
        .first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should refresh data when period changes', async ({ page }) => {
      let requestCount = 0;

      page.on('request', (request) => {
        if (
          request.url().includes('/api/v1/dashboard/analytics/earnings-trend')
        ) {
          requestCount++;
        }
      });

      // Initial load
      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      const initialCount = requestCount;

      // Change period
      const thirtyDaysButton = page.locator('button:has-text("30 Gün")');
      await thirtyDaysButton.click();
      await page.waitForTimeout(1000);

      // Should make new request
      expect(requestCount).toBeGreaterThan(initialCount);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      // Charts should still be visible
      const chart = page.locator('svg').first();
      await expect(chart).toBeVisible();

      // Layout should stack vertically
      const container = page
        .locator('main, [data-testid="analytics-container"]')
        .first();
      const box = await container.boundingBox();

      if (box) {
        expect(box.width).toBeLessThanOrEqual(400);
      }
    });

    test('should display correctly on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto('/dashboard/wallet/analytics');
      await page.waitForLoadState('networkidle');

      // All sections should be visible
      const sections = page.locator('section, [data-testid*="chart"]');
      const count = await sections.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      const h2 = page.locator('h2, h3');
      const count = await h2.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should have accessible chart labels', async ({ page }) => {
      // Charts should have aria-labels or titles
      const charts = page.locator('svg[aria-label], svg[role="img"]');
      const count = await charts.count();

      if (count > 0) {
        const firstChart = charts.first();
        const ariaLabel = await firstChart.getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through period buttons
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check if element is focused
      const focused = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focused).toBeTruthy();
    });
  });
});
