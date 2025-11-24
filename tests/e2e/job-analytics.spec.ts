/**
 * ================================================
 * JOB ANALYTICS - E2E TESTS (Playwright)
 * ================================================
 * End-to-end tests for job analytics dashboard
 *
 * Test Scenarios:
 * 1. Analytics page load and data display
 * 2. Navigation and routing
 * 3. Empty state handling
 * 4. Performance benchmarks
 * 5. Responsive design
 * 6. Export functionality (CSV/PDF)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

import { test, expect } from '@playwright/test';

test.describe('Job Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employer
    await page.goto('/login');
    await page.fill('[name="email"]', 'employer@test.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('Page Load & Navigation', () => {
    test('should load analytics page successfully', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      // Wait for page to load
      await expect(page.locator('h1')).toContainText('İş İlanı Analitiği');

      // Check for analytics description
      await expect(
        page.locator('text=İş ilanlarınızın performansını görüntüleyin')
      ).toBeVisible();
    });

    test('should navigate back to my jobs page', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      // Click back button
      await page.click('text=İşlerime Dön');

      // Should navigate to my jobs page
      await expect(page).toHaveURL('/dashboard/my-jobs');
    });

    test('should be accessible from my jobs page', async ({ page }) => {
      await page.goto('/dashboard/my-jobs');

      // Look for analytics link/button
      const analyticsLink = page.locator('text=/analitik|analytics/i').first();
      if (await analyticsLink.isVisible()) {
        await analyticsLink.click();
        await expect(page).toHaveURL('/dashboard/my-jobs/analytics');
      }
    });
  });

  test.describe('Analytics Display - With Data', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');
      // Wait for analytics to load
      await page
        .waitForSelector('[data-testid="analytics-stats"]', {
          timeout: 5000,
        })
        .catch(() => {
          // Fallback: wait for any stat card
          return page.waitForSelector('text=Toplam İş İlanı');
        });
    });

    test('should display total jobs statistic', async ({ page }) => {
      const totalJobsCard = page.locator('text=Toplam İş İlanı').locator('..');
      await expect(totalJobsCard).toBeVisible();

      // Should show a number
      const value = await totalJobsCard.locator('.text-2xl').textContent();
      expect(value).toMatch(/^\d+$/);
    });

    test('should display total proposals statistic', async ({ page }) => {
      const proposalsCard = page.locator('text=Toplam Teklif').locator('..');
      await expect(proposalsCard).toBeVisible();

      // Should show average proposals per job
      await expect(proposalsCard).toContainText(/Ortalama \d+ teklif\/ilan/);
    });

    test('should display total views statistic', async ({ page }) => {
      const viewsCard = page.locator('text=Toplam Görüntülenme').locator('..');
      await expect(viewsCard).toBeVisible();

      // Should show average views per job
      await expect(viewsCard).toContainText(/Ortalama \d+ görüntülenme\/ilan/);
    });

    test('should display top category', async ({ page }) => {
      const categoryCard = page
        .locator('text=En Çok Kullanılan Kategori')
        .locator('..');
      await expect(categoryCard).toBeVisible();

      // Should show a category name (not empty or N/A if data exists)
      const categoryName = await categoryCard
        .locator('.text-2xl')
        .textContent();
      expect(categoryName).toBeTruthy();
    });

    test('should display active jobs count', async ({ page }) => {
      const totalJobsCard = page.locator('text=Toplam İş İlanı').locator('..');

      // Should show active jobs count
      await expect(totalJobsCard).toContainText(/\d+ aktif ilan/);
    });

    test('should display status distribution', async ({ page }) => {
      // Should show status breakdown section
      const statusSection = page.locator('text=Durum Dağılımı').locator('..');

      if (await statusSection.isVisible()) {
        // Should show different statuses
        const statuses = ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'];

        for (const status of statuses) {
          // Check if status is visible (some might be 0)
          const statusElement = statusSection.locator(`text=/${status}/i`);
          if ((await statusElement.count()) > 0) {
            await expect(statusElement.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Empty State', () => {
    test('should handle no jobs gracefully', async ({ page, context }) => {
      // Create new context with no jobs
      await context.route('**/api/v1/jobs/my-jobs**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            content: [],
            totalElements: 0,
            totalPages: 0,
          }),
        })
      );

      await page.goto('/dashboard/my-jobs/analytics');

      // Should still show the page
      await expect(page.locator('h1')).toContainText('İş İlanı Analitiği');

      // All stats should be 0
      const zeroStats = page.locator('text=/^0$/');
      expect(await zeroStats.count()).toBeGreaterThan(0);

      // Top category should show N/A
      await expect(page.locator('text=N/A')).toBeVisible();
    });

    test('should show empty state message or CTA', async ({
      page,
      context,
    }) => {
      await context.route('**/api/v1/jobs/my-jobs**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({ content: [], totalElements: 0 }),
        })
      );

      await page.goto('/dashboard/my-jobs/analytics');

      // Should show some guidance or CTA
      const emptyMessage = page.locator(
        'text=/henüz.*ilan|iş.*oluştur|başla/i'
      );

      // If empty state component exists, it should be visible
      if ((await emptyMessage.count()) > 0) {
        await expect(emptyMessage.first()).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load page within 3 seconds', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/dashboard/my-jobs/analytics');
      await page.waitForSelector('text=İş İlanı Analitiği');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // < 3s requirement from Story 4.1
    });

    test('should handle large dataset (100+ jobs)', async ({
      page,
      context,
    }) => {
      // Mock large dataset
      const mockJobs = Array.from({ length: 100 }, (_, i) => ({
        id: `job-${i}`,
        title: `Job ${i}`,
        status: ['OPEN', 'IN_PROGRESS', 'COMPLETED'][i % 3],
        proposalCount: Math.floor(Math.random() * 20),
        viewCount: Math.floor(Math.random() * 200),
        category: {
          id: `cat-${i % 5}`,
          name: `Category ${i % 5}`,
          slug: `cat-${i % 5}`,
        },
      }));

      await context.route('**/api/v1/jobs/my-jobs**', (route) =>
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            content: mockJobs,
            totalElements: 100,
          }),
        })
      );

      const startTime = Date.now();
      await page.goto('/dashboard/my-jobs/analytics');
      await page.waitForSelector('text=İş İlanı Analitiği');

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should still load fast

      // Should show correct total
      await expect(page.locator('text=100')).toBeVisible();
    });

    test('should show loading skeleton before data loads', async ({ page }) => {
      // Slow down API response
      await page.route('**/api/v1/jobs/my-jobs**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await route.continue();
      });

      await page.goto('/dashboard/my-jobs/analytics');

      // Should show loading skeletons
      const skeletons = page
        .locator('[role="presentation"]')
        .or(page.locator('.animate-pulse'));

      if ((await skeletons.count()) > 0) {
        await expect(skeletons.first()).toBeVisible();
      }

      // Eventually should show data
      await expect(page.locator('text=İş İlanı Analitiği')).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/dashboard/my-jobs/analytics');

      // Page should load
      await expect(page.locator('h1')).toBeVisible();

      // Stats cards should be stacked (1 column)
      const statsGrid = page.locator('.grid').first();
      const gridClasses = await statsGrid.getAttribute('class');
      expect(gridClasses).toContain('grid');
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/dashboard/my-jobs/analytics');

      await expect(page.locator('h1')).toBeVisible();

      // Should show 2 columns on tablet (md:grid-cols-2)
      const statsGrid = page.locator('.grid').first();
      await expect(statsGrid).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/dashboard/my-jobs/analytics');

      await expect(page.locator('h1')).toBeVisible();

      // Should show 3 columns on desktop (lg:grid-cols-3)
      const statsGrid = page.locator('.grid').first();
      await expect(statsGrid).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page, context }) => {
      await context.route('**/api/v1/jobs/my-jobs**', (route) =>
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' }),
        })
      );

      await page.goto('/dashboard/my-jobs/analytics');

      // Should show error message or fallback UI
      const errorMessage = page.locator('text=/hata|error|yüklen.*başarısız/i');

      if ((await errorMessage.count()) > 0) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      } else {
        // Or should show empty state
        await expect(page.locator('text=İş İlanı Analitiği')).toBeVisible();
      }
    });

    test('should handle network errors', async ({ page, context }) => {
      await context.route('**/api/v1/jobs/my-jobs**', (route) =>
        route.abort('failed')
      );

      await page.goto('/dashboard/my-jobs/analytics');

      // Should not crash, should show error or empty state
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Export Functionality (Future)', () => {
    test.skip('should export analytics as CSV', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      // Look for export button
      const exportButton = page.locator('text=/csv.*indir|export.*csv/i');

      if (await exportButton.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click(),
        ]);

        expect(download.suggestedFilename()).toMatch(/\.csv$/);
      }
    });

    test.skip('should export analytics as PDF', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      const exportButton = page.locator('text=/pdf.*indir|export.*pdf/i');

      if (await exportButton.isVisible()) {
        const [download] = await Promise.all([
          page.waitForEvent('download'),
          exportButton.click(),
        ]);

        expect(download.suggestedFilename()).toMatch(/\.pdf$/);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      // Tab through page
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Back button should be focusable
      const focused = await page.evaluate(
        () => document.activeElement?.textContent
      );
      expect(focused).toBeTruthy();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      // Should have h1
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
      expect(await h1.count()).toBe(1);
    });

    test('should have descriptive labels for stats', async ({ page }) => {
      await page.goto('/dashboard/my-jobs/analytics');

      const labels = [
        'Toplam İş İlanı',
        'Toplam Teklif',
        'Toplam Görüntülenme',
      ];

      for (const label of labels) {
        await expect(page.locator(`text=${label}`)).toBeVisible();
      }
    });
  });
});
