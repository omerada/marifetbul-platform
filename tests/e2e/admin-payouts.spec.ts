/**
 * ================================================
 * ADMIN PAYOUT E2E TESTS
 * ================================================
 * Tests for Story 1.2: Payout Approval UI
 * - Bulk approval flow
 * - Individual approval/rejection
 * - CSV export
 * - Selection limits (max 50)
 *
 * @suite Story 1.2
 * @since Sprint 1
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

// Helper: Login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', TEST_USERS.admin.email);
  await page.fill('input[name="password"]', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Admin Payout Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/payouts');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Payout List Display', () => {
    test('should display pending payouts table', async ({ page }) => {
      // Check if table is visible
      const table = page.locator('table, [data-testid="payout-table"]');
      await expect(table).toBeVisible({ timeout: 5000 });

      // Check table headers
      const headers = [
        'Kullanıcı',
        'Tutar',
        'Yöntem',
        'Durum',
        'Tarih',
        'İşlemler',
      ];

      for (const header of headers) {
        const headerCell = page.locator(`th:has-text("${header}")`).first();
        await expect(headerCell).toBeVisible();
      }
    });

    test('should show payout statistics', async ({ page }) => {
      // Check statistics cards
      const stats = ['Bekleyen', 'Onaylanan', 'Reddedilen', 'Toplam'];

      for (const stat of stats) {
        const statCard = page.locator(`text=${stat}`).first();
        await expect(statCard).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display selection checkbox for each payout', async ({
      page,
    }) => {
      // Wait for table rows
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toBeVisible({ timeout: 5000 });

      // Check if checkbox exists
      const checkbox = firstRow.locator('input[type="checkbox"]');
      await expect(checkbox).toBeVisible();
    });
  });

  test.describe('Individual Payout Approval', () => {
    test('should open approval modal when clicking approve button', async ({
      page,
    }) => {
      // Find first pending payout row
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toBeVisible({ timeout: 5000 });

      // Click approve button
      const approveButton = firstRow.locator(
        'button:has-text("Onayla"), button[data-action="approve"]'
      );
      await approveButton.click();

      // Check if modal opened
      const modal = page.locator(
        '[role="dialog"], .modal, [data-testid="approval-modal"]'
      );
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Check modal title
      const modalTitle = modal.locator('h2, h3, [data-testid="modal-title"]');
      await expect(modalTitle).toContainText(/Ödeme.*Onayla|Approve.*Payout/i);
    });

    test('should approve payout successfully', async ({ page }) => {
      // Open approval modal
      const firstRow = page.locator('tbody tr').first();
      const approveButton = firstRow.locator('button:has-text("Onayla")');
      await approveButton.click();

      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Click confirm button
      const confirmButton = modal.locator(
        'button:has-text("Onayla"), button[type="submit"]'
      );
      await confirmButton.click();

      // Wait for success message
      const toast = page.locator('[role="alert"], .toast').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText(
        /başarıyla.*onaylandı|successfully.*approved/i
      );
    });

    test('should reject payout with reason', async ({ page }) => {
      // Find first pending payout
      const firstRow = page.locator('tbody tr').first();

      // Click reject button
      const rejectButton = firstRow.locator(
        'button:has-text("Reddet"), button[data-action="reject"]'
      );
      await rejectButton.click();

      // Wait for modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      // Fill rejection reason
      const reasonTextarea = modal.locator(
        'textarea[name="reason"], textarea[placeholder*="neden"]'
      );
      await reasonTextarea.fill('Test rejection reason - insufficient funds');

      // Submit
      const submitButton = modal.locator(
        'button:has-text("Reddet"), button[type="submit"]'
      );
      await submitButton.click();

      // Verify success
      const toast = page.locator('[role="alert"]').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText(/reddedildi|rejected/i);
    });

    test('should show validation error for empty rejection reason', async ({
      page,
    }) => {
      const firstRow = page.locator('tbody tr').first();
      const rejectButton = firstRow.locator('button:has-text("Reddet")');
      await rejectButton.click();

      const modal = page.locator('[role="dialog"]');

      // Try to submit without reason
      const submitButton = modal.locator('button:has-text("Reddet")');
      await submitButton.click();

      // Should show validation error
      const errorMessage = modal.locator(
        'text=/zorunlu|required|en az.*karakter/i'
      );
      await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple payouts', async ({ page }) => {
      // Select first 3 checkboxes
      const checkboxes = page.locator('tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();

      if (count >= 3) {
        for (let i = 0; i < 3; i++) {
          await checkboxes.nth(i).check();
        }

        // Verify selection count
        const selectionInfo = page.locator('text=/3.*seçildi|3.*selected/i');
        await expect(selectionInfo).toBeVisible({ timeout: 3000 });
      }
    });

    test('should select all payouts with header checkbox', async ({ page }) => {
      // Click "select all" checkbox in table header
      const selectAllCheckbox = page
        .locator('thead input[type="checkbox"]')
        .first();
      await selectAllCheckbox.check();

      // Verify all rows are selected
      const checkboxes = page.locator('tbody tr input[type="checkbox"]');
      const count = await checkboxes.count();

      for (let i = 0; i < count && i < 5; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }
    });

    test('should show bulk actions bar when payouts are selected', async ({
      page,
    }) => {
      // Select first payout
      const firstCheckbox = page
        .locator('tbody tr input[type="checkbox"]')
        .first();
      await firstCheckbox.check();

      // Check if bulk actions bar appears
      const bulkActionsBar = page.locator(
        '[data-testid="bulk-actions"], .bulk-actions'
      );
      await expect(bulkActionsBar).toBeVisible({ timeout: 3000 });

      // Verify buttons are present
      await expect(
        bulkActionsBar.locator('button:has-text("Toplu Onayla")')
      ).toBeVisible();
      await expect(
        bulkActionsBar.locator('button:has-text("Toplu Reddet")')
      ).toBeVisible();
    });

    test('should bulk approve selected payouts', async ({ page }) => {
      // Select 2 payouts
      const checkboxes = page.locator('tbody tr input[type="checkbox"]');
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Click bulk approve
      const bulkApproveButton = page.locator('button:has-text("Toplu Onayla")');
      await bulkApproveButton.click();

      // Confirm in modal
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      const confirmButton = modal.locator('button:has-text("Onayla")');
      await confirmButton.click();

      // Verify success
      const toast = page.locator('[role="alert"]').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
      await expect(toast).toContainText(/başarıyla|successfully/i);
    });

    test('should bulk reject selected payouts with reason', async ({
      page,
    }) => {
      // Select 2 payouts
      const checkboxes = page.locator('tbody tr input[type="checkbox"]');
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Click bulk reject
      const bulkRejectButton = page.locator('button:has-text("Toplu Reddet")');
      await bulkRejectButton.click();

      // Fill reason and submit
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();

      const reasonTextarea = modal.locator('textarea');
      await reasonTextarea.fill('Bulk rejection test reason');

      const submitButton = modal.locator('button:has-text("Reddet")');
      await submitButton.click();

      // Verify success
      const toast = page.locator('[role="alert"]').first();
      await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test('should enforce max 50 selection limit', async ({ page }) => {
      // This test requires having >50 pending payouts
      // We'll check if the warning appears when trying to select too many

      const selectAllCheckbox = page
        .locator('thead input[type="checkbox"]')
        .first();
      await selectAllCheckbox.check();

      // If there are >50 payouts, should show warning
      const warningMessage = page.locator('text=/en fazla.*50|maximum.*50/i');

      // Either warning is shown or all are selected (if <50)
      const checkboxCount = await page
        .locator('tbody tr input[type="checkbox"]')
        .count();

      if (checkboxCount > 50) {
        await expect(warningMessage).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('CSV Export', () => {
    test('should export selected payouts to CSV', async ({ page }) => {
      // Select some payouts
      const checkboxes = page.locator('tbody tr input[type="checkbox"]');
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      // Click CSV export button
      const exportButton = page.locator(
        'button:has-text("CSV"), button:has-text("Dışa Aktar")'
      );

      // Setup download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });

      await exportButton.click();

      // Wait for download
      const download = await downloadPromise;

      // Verify filename
      expect(download.suggestedFilename()).toMatch(
        /payouts.*\.csv|odemeler.*\.csv/i
      );
    });

    test('should export CSV with UTF-8 BOM for Excel compatibility', async ({
      page,
    }) => {
      // Select payouts
      const firstCheckbox = page
        .locator('tbody tr input[type="checkbox"]')
        .first();
      await firstCheckbox.check();

      // Trigger export
      const exportButton = page.locator('button:has-text("CSV")');
      const downloadPromise = page.waitForEvent('download');

      await exportButton.click();
      const download = await downloadPromise;

      // Save and check file content
      const path = await download.path();

      if (path) {
        const { readFileSync } = await import('fs');
        const content = readFileSync(path);

        // Check for UTF-8 BOM (0xEF, 0xBB, 0xBF)
        expect(content[0]).toBe(0xef);
        expect(content[1]).toBe(0xbb);
        expect(content[2]).toBe(0xbf);
      }
    });
  });

  test.describe('Filtering and Search', () => {
    test('should filter payouts by status', async ({ page }) => {
      // Click status filter dropdown
      const statusFilter = page
        .locator('select[name="status"], button:has-text("Durum")')
        .first();
      await statusFilter.click();

      // Select "Bekleyen" status
      const pendingOption = page.locator(
        'option:has-text("Bekleyen"), [role="option"]:has-text("Bekleyen")'
      );
      await pendingOption.click();

      // Wait for results to update
      await page.waitForTimeout(1000);

      // Verify URL or filtered results
      expect(page.url()).toContain('status=PENDING');
    });

    test('should search payouts by user name', async ({ page }) => {
      const searchInput = page
        .locator('input[type="search"], input[placeholder*="Ara"]')
        .first();
      await searchInput.fill('test');

      // Wait for search results
      await page.waitForTimeout(1000);

      // Verify results contain search term
      const firstRow = page.locator('tbody tr').first();
      await expect(firstRow).toContainText(/test/i);
    });
  });

  test.describe('Error Handling', () => {
    test('should show error if no payouts are selected for bulk action', async ({
      page,
    }) => {
      // Try to click bulk approve without selection
      const bulkApproveButton = page.locator('button:has-text("Toplu Onayla")');

      // Button should be disabled or show warning
      const isDisabled = await bulkApproveButton.isDisabled();
      expect(isDisabled).toBeTruthy();
    });

    test('should handle API errors gracefully', async ({ page }) => {
      // Intercept API call and return error
      await page.route('**/api/v1/admin/payouts/*/approve', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ message: 'Internal server error' }),
        });
      });

      // Try to approve a payout
      const firstRow = page.locator('tbody tr').first();
      const approveButton = firstRow.locator('button:has-text("Onayla")');
      await approveButton.click();

      const modal = page.locator('[role="dialog"]');
      const confirmButton = modal.locator('button:has-text("Onayla")');
      await confirmButton.click();

      // Should show error message
      const errorToast = page.locator('[role="alert"]').first();
      await expect(errorToast).toBeVisible({ timeout: 5000 });
      await expect(errorToast).toContainText(/hata|error/i);
    });
  });
});
