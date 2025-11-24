/**
 * Advanced Job Search E2E Tests
 * Sprint 5 - Story 5.3: Advanced Job Search Enhancement
 *
 * Tests:
 * - Date range filtering (postedAfter, deadlineBefore)
 * - Skills multi-select with debounced search
 * - URL parameter synchronization
 * - Filter combinations
 * - Bookmarkable URLs
 * - Clear filters functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Advanced Job Search', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to jobs page
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
  });

  test('should filter jobs by posted date range', async ({ page }) => {
    // Open date range picker
    const startDateInput = page.locator(
      'input[aria-label="İlan Tarihi (Sonra)"]'
    );
    const endDateInput = page.locator(
      'input[aria-label="Son Başvuru Tarihi (Önce)"]'
    );

    // Set date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // 30 days ago
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days from now

    await startDateInput.fill(startDate.toISOString().split('T')[0]);
    await endDateInput.fill(endDate.toISOString().split('T')[0]);

    // Wait for filter to apply
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/jobs') && response.status() === 200
    );

    // Verify URL params
    await expect(page).toHaveURL(/postedAfter=/);
    await expect(page).toHaveURL(/deadlineBefore=/);

    // Verify results loaded
    const jobCards = page.locator('[data-testid="job-card"]');
    await expect(jobCards.first()).toBeVisible();
  });

  test('should clear date range filters', async ({ page }) => {
    // Set date filters first
    const startDateInput = page.locator(
      'input[aria-label="İlan Tarihi (Sonra)"]'
    );
    await startDateInput.fill('2025-11-01');
    await page.waitForLoadState('networkidle');

    // Click clear button in DateRangePicker
    const clearButton = page.locator('button:has-text("Temizle")').first();
    await clearButton.click();

    // Verify dates cleared
    await expect(startDateInput).toHaveValue('');

    // Verify URL params removed
    const url = page.url();
    expect(url).not.toContain('postedAfter');
    expect(url).not.toContain('deadlineBefore');
  });

  test('should filter by skills with multi-select', async ({ page }) => {
    // Open skills multi-select
    const skillsSelect = page.locator('button:has-text("Yetenek seç")');
    await skillsSelect.click();

    // Select multiple skills
    await page.locator('button:has-text("React")').click();
    await page.locator('button:has-text("TypeScript")').click();
    await page.locator('button:has-text("Node.js")').click();

    // Close dropdown by clicking outside
    await page.click('body', { position: { x: 0, y: 0 } });

    // Wait for API call
    await page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/jobs') && response.status() === 200
    );

    // Verify URL contains skills
    await expect(page).toHaveURL(/skills=react,typescript,node.js/i);

    // Verify selected badges visible
    await expect(page.locator('text=React').first()).toBeVisible();
    await expect(page.locator('text=TypeScript').first()).toBeVisible();
  });

  test('should debounce search input', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="İş ara..."]');

    // Track API calls
    let apiCallCount = 0;
    page.on('request', (request) => {
      if (
        request.url().includes('/api/v1/jobs') &&
        request.method() === 'GET'
      ) {
        apiCallCount++;
      }
    });

    // Type search query character by character
    await searchInput.fill('React Developer');

    // Wait for debounce delay (400ms) + buffer
    await page.waitForTimeout(500);

    // Should have only 1 API call due to debounce
    expect(apiCallCount).toBeLessThanOrEqual(2); // Allow initial load + debounced call
  });

  test('should synchronize filters to URL params', async ({ page }) => {
    // Apply multiple filters
    await page
      .locator('select')
      .filter({ hasText: 'Kategori' })
      .selectOption({ index: 1 });
    await page.locator('input[placeholder="Min"]').fill('5000');
    await page.locator('input[placeholder="Max"]').fill('15000');
    await page
      .locator('input[type="checkbox"]')
      .filter({ hasText: 'Sadece uzaktan' })
      .check();

    await page.waitForLoadState('networkidle');

    // Verify URL contains all params
    const url = page.url();
    expect(url).toMatch(/categoryId=/);
    expect(url).toMatch(/budgetMin=5000/);
    expect(url).toMatch(/budgetMax=15000/);
    expect(url).toMatch(/isRemote=true/);
  });

  test('should restore filters from URL on page load', async ({ page }) => {
    // Navigate with URL params
    await page.goto(
      '/jobs?categoryId=123&budgetMin=5000&budgetMax=15000&skills=react,typescript&isRemote=true'
    );
    await page.waitForLoadState('networkidle');

    // Verify filters are applied
    await expect(page.locator('input[placeholder="Min"]')).toHaveValue('5000');
    await expect(page.locator('input[placeholder="Max"]')).toHaveValue('15000');
    await expect(
      page
        .locator('input[type="checkbox"]')
        .filter({ hasText: 'Sadece uzaktan' })
    ).toBeChecked();

    // Verify skills badges visible
    await expect(page.locator('text=React').first()).toBeVisible();
    await expect(page.locator('text=TypeScript').first()).toBeVisible();
  });

  test('should support browser back/forward navigation', async ({ page }) => {
    // Apply first filter
    await page.locator('input[placeholder="İş ara..."]').fill('Developer');
    await page.waitForTimeout(500); // Wait for debounce

    // Apply second filter
    await page.locator('input[placeholder="Min"]').fill('10000');
    await page.waitForLoadState('networkidle');

    // Go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Verify first filter still active, second cleared
    const url = page.url();
    expect(url).toMatch(/search=Developer/i);
    expect(url).not.toMatch(/budgetMin=/);

    // Go forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Verify both filters restored
    const forwardUrl = page.url();
    expect(forwardUrl).toMatch(/search=Developer/i);
    expect(forwardUrl).toMatch(/budgetMin=10000/);
  });

  test('should clear all filters', async ({ page }) => {
    // Apply multiple filters
    await page.locator('input[placeholder="İş ara..."]').fill('React');
    await page.locator('input[placeholder="Min"]').fill('5000');
    await page
      .locator('input[type="checkbox"]')
      .filter({ hasText: 'Sadece uzaktan' })
      .check();
    await page.waitForTimeout(500);

    // Click clear all button
    await page.locator('button:has-text("Temizle")').first().click();

    // Verify all filters cleared
    await expect(page.locator('input[placeholder="İş ara..."]')).toHaveValue(
      ''
    );
    await expect(page.locator('input[placeholder="Min"]')).toHaveValue('');
    await expect(
      page
        .locator('input[type="checkbox"]')
        .filter({ hasText: 'Sadece uzaktan' })
    ).not.toBeChecked();

    // Verify URL has no filter params
    const url = page.url();
    expect(url).toBe(new URL('/jobs', page.url()).href);
  });

  test('should show active filter count badge', async ({ page }) => {
    // Initially no active filters
    const filterBadge = page.locator('text=/\\d+ aktif/');
    await expect(filterBadge).not.toBeVisible();

    // Apply 3 filters
    await page.locator('input[placeholder="İş ara..."]').fill('Developer');
    await page.locator('input[placeholder="Min"]').fill('5000');
    await page
      .locator('input[type="checkbox"]')
      .filter({ hasText: 'Sadece uzaktan' })
      .check();
    await page.waitForTimeout(500);

    // Verify badge shows "3 aktif"
    await expect(page.locator('text="3 aktif"')).toBeVisible();
  });

  test('should validate date range (end >= start)', async ({ page }) => {
    const startDateInput = page.locator(
      'input[aria-label="İlan Tarihi (Sonra)"]'
    );
    const endDateInput = page.locator(
      'input[aria-label="Son Başvuru Tarihi (Önce)"]'
    );

    // Set end date before start date
    await startDateInput.fill('2025-12-01');
    await endDateInput.fill('2025-11-01');

    // Verify error message shown
    await expect(
      page.locator('text="Bitiş tarihi başlangıç tarihinden sonra olmalıdır"')
    ).toBeVisible();

    // Verify filter not applied (no API call)
    const url = page.url();
    expect(url).not.toContain('postedAfter');
    expect(url).not.toContain('deadlineBefore');
  });

  test('should combine filters with pagination', async ({ page }) => {
    // Apply filters
    await page.locator('input[placeholder="İş ara..."]').fill('Developer');
    await page.locator('input[placeholder="Min"]').fill('5000');
    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    // Go to page 2
    const page2Button = page.locator('button:has-text("2")').first();
    if (await page2Button.isVisible()) {
      await page2Button.click();
      await page.waitForLoadState('networkidle');

      // Verify URL has both filters and page param
      const url = page.url();
      expect(url).toMatch(/search=Developer/i);
      expect(url).toMatch(/budgetMin=5000/);
      expect(url).toMatch(/page=1/); // 0-indexed
    }
  });

  test('should reset page to 0 when filters change', async ({ page }) => {
    // Go to page 2 first
    await page.goto('/jobs?page=2');
    await page.waitForLoadState('networkidle');

    // Apply a filter
    await page.locator('input[placeholder="İş ara..."]').fill('React');
    await page.waitForTimeout(500);

    // Verify page reset to 0
    const url = page.url();
    expect(url).toMatch(/page=0|^(?!.*page=)/); // Either page=0 or no page param (defaults to 0)
  });

  test('should handle budget slider changes', async ({ page }) => {
    // Find budget slider
    const slider = page.locator('[role="slider"]').first();

    // Get slider bounding box
    const boundingBox = await slider.boundingBox();
    if (boundingBox) {
      // Drag slider to middle (approximately 50,000 TL if max is 100,000)
      await slider.click({
        position: { x: boundingBox.width / 2, y: boundingBox.height / 2 },
      });

      await page.waitForLoadState('networkidle');

      // Verify budget values updated in URL
      const url = page.url();
      expect(url).toMatch(/budgetMin=|budgetMax=/);
    }
  });

  test('should search skills in multi-select dropdown', async ({ page }) => {
    // Open skills dropdown
    await page.locator('button:has-text("Yetenek seç")').click();

    // Type in search input
    const searchInput = page.locator('input[placeholder="Ara..."]');
    await searchInput.fill('React');

    // Verify only React-related skills shown
    await expect(page.locator('button:has-text("React")')).toBeVisible();

    // Verify other skills hidden
    const pythonOption = page.locator('button:has-text("Python")');
    if ((await pythonOption.count()) > 0) {
      await expect(pythonOption).not.toBeVisible();
    }
  });

  test('should show "no results" message when search yields nothing', async ({
    page,
  }) => {
    // Search for non-existent skill
    await page.locator('button:has-text("Yetenek seç")').click();
    await page
      .locator('input[placeholder="Ara..."]')
      .fill('NonExistentSkillXYZ123');

    // Verify no results message
    await expect(page.locator('text="Sonuç bulunamadı"')).toBeVisible();
  });
});
