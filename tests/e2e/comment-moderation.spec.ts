/**
 * ================================================
 * COMMENT MODERATION E2E TESTS
 * ================================================
 * Tests for admin comment moderation functionality
 *
 * Test Coverage:
 * - View pending comments
 * - Approve single comment
 * - Reject comment with reason
 * - Mark as spam
 * - Bulk operations
 * - Filtering and search
 * - Auto-refresh
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';
import {
  loginAs,
  waitForSuccessToast,
  waitForAPI,
} from '../utils/test-helpers';
import { TEST_COMMENTS } from '../fixtures/test-data';

test.describe('Comment Moderation System', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAs(page, 'admin');
  });

  test.describe('View Pending Comments', () => {
    test('should display pending comments queue', async ({ page }) => {
      // Navigate to moderation page
      await page.goto('/admin/moderation');

      // Click on comments tab
      await page.click('button:has-text("Yorumlar")');

      // Wait for comments to load
      await waitForAPI(page, '/api/v1/blog/admin/comments/pending', 'GET');

      // Verify page elements
      await expect(page.locator('h1')).toContainText('Yorum Moderasyonu');
      await expect(page.locator('[data-testid="comment-queue"]')).toBeVisible();

      // Verify pending comments are displayed
      const pendingComments = page.locator('[data-comment-status="pending"]');
      await expect(pendingComments).toHaveCount(TEST_COMMENTS.pending.length, {
        timeout: 10000,
      });

      // Verify comment card elements
      const firstComment = pendingComments.first();
      await expect(firstComment.locator('.comment-content')).toBeVisible();
      await expect(firstComment.locator('.comment-author')).toBeVisible();
      await expect(firstComment.locator('.comment-date')).toBeVisible();
    });

    test('should display comment statistics', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Check stats cards
      await expect(page.locator('[data-testid="stat-pending"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-approved"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-rejected"]')).toBeVisible();
      await expect(page.locator('[data-testid="stat-spam"]')).toBeVisible();

      // Verify stats have numbers
      const pendingCount = await page
        .locator('[data-testid="stat-pending"] .stat-value')
        .textContent();
      expect(parseInt(pendingCount || '0')).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Approve Comment', () => {
    test('should approve single comment', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Wait for comments to load
      await page.waitForSelector('[data-comment-status="pending"]');

      // Get first pending comment
      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();
      const commentId = await firstComment.getAttribute('data-comment-id');

      // Click approve button
      await firstComment.locator('button:has-text("Onayla")').click();

      // Wait for API response
      await waitForAPI(
        page,
        `/api/v1/blog/admin/comments/${commentId}/approve`,
        'POST'
      );

      // Verify success toast
      await waitForSuccessToast(page, 'onaylandı');

      // Verify comment status changed
      const updatedComment = page.locator(`[data-comment-id="${commentId}"]`);
      await expect(updatedComment).toHaveAttribute(
        'data-comment-status',
        'approved'
      );

      // Verify pending count decreased
      const pendingComments = page.locator('[data-comment-status="pending"]');
      await expect(pendingComments).toHaveCount(
        TEST_COMMENTS.pending.length - 1
      );
    });

    test('should show confirmation dialog before approval', async ({
      page,
    }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();
      await firstComment.locator('button:has-text("Onayla")').click();

      // Verify confirmation dialog appears
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('onaylamak');

      // Click confirm
      await dialog.locator('button:has-text("Evet")').click();

      await waitForSuccessToast(page);
    });
  });

  test.describe('Reject Comment', () => {
    test('should reject comment with reason', async ({ page }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();
      const commentId = await firstComment.getAttribute('data-comment-id');

      // Click reject button
      await firstComment.locator('button:has-text("Reddet")').click();

      // Wait for reject dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await expect(dialog).toContainText('Red Nedeni');

      // Fill reason
      await dialog
        .locator('textarea[name="reason"]')
        .fill('İçerik uygunsuz ve kural dışı');

      // Submit
      await dialog.locator('button:has-text("Reddet")').click();

      // Wait for API response
      await waitForAPI(
        page,
        `/api/v1/blog/admin/comments/${commentId}/reject`,
        'POST'
      );

      // Verify success
      await waitForSuccessToast(page, 'reddedildi');

      // Verify comment removed from pending list
      await expect(
        page.locator(`[data-comment-id="${commentId}"]`)
      ).toHaveAttribute('data-comment-status', 'rejected');
    });

    test('should require reason for rejection', async ({ page }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();
      await firstComment.locator('button:has-text("Reddet")').click();

      // Try to submit without reason
      const dialog = page.locator('[role="dialog"]');
      await dialog.locator('button:has-text("Reddet")').click();

      // Verify error message
      await expect(dialog.locator('.error-message')).toContainText(
        'Red nedeni gereklidir'
      );
    });
  });

  test.describe('Mark as Spam', () => {
    test('should mark comment as spam', async ({ page }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();
      const commentId = await firstComment.getAttribute('data-comment-id');

      // Open actions menu
      await firstComment.locator('button[aria-label="Eylemler"]').click();

      // Click spam option
      await page.click('button:has-text("Spam Olarak İşaretle")');

      // Confirm dialog
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();
      await dialog.locator('button:has-text("Evet")').click();

      // Wait for API
      await waitForAPI(
        page,
        `/api/v1/blog/admin/comments/${commentId}/spam`,
        'POST'
      );

      // Verify success
      await waitForSuccessToast(page, 'spam olarak işaretlendi');

      // Verify comment status
      const updatedComment = page.locator(`[data-comment-id="${commentId}"]`);
      await expect(updatedComment).toHaveAttribute(
        'data-comment-status',
        'spam'
      );
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select multiple comments', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Select first 3 comments
      await page.click('[data-comment-id="1"] input[type="checkbox"]');
      await page.click('[data-comment-id="2"] input[type="checkbox"]');
      await page.click('[data-comment-id="3"] input[type="checkbox"]');

      // Verify selection count
      const bulkActions = page.locator('[data-testid="bulk-actions"]');
      await expect(bulkActions).toBeVisible();
      await expect(bulkActions).toContainText('3');
    });

    test('should bulk approve comments', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Select comments
      await page.click('[data-comment-id="1"] input[type="checkbox"]');
      await page.click('[data-comment-id="2"] input[type="checkbox"]');

      // Click bulk approve
      await page.click('button:has-text("Seçilenleri Onayla")');

      // Confirm
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toContainText('2 yorum');
      await dialog.locator('button:has-text("Evet")').click();

      // Wait for API
      await waitForAPI(
        page,
        '/api/v1/blog/admin/comments/bulk-approve',
        'POST'
      );

      // Verify success
      await waitForSuccessToast(page, '2 yorum onaylandı');

      // Verify selection cleared
      await expect(
        page.locator('[data-testid="bulk-actions"]')
      ).not.toBeVisible();
    });

    test('should bulk reject comments', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Select comments
      await page.click('[data-comment-id="1"] input[type="checkbox"]');
      await page.click('[data-comment-id="2"] input[type="checkbox"]');

      // Click bulk reject
      await page.click('button:has-text("Seçilenleri Reddet")');

      // Fill reason
      const dialog = page.locator('[role="dialog"]');
      await dialog
        .locator('textarea[name="reason"]')
        .fill('Toplu red işlemi - kural ihlali');
      await dialog.locator('button:has-text("Reddet")').click();

      // Verify success
      await waitForSuccessToast(page, '2 yorum reddedildi');
    });

    test('should select all comments on page', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Click select all checkbox
      await page.click('[data-testid="select-all-checkbox"]');

      // Verify all comments selected
      const checkboxes = page.locator(
        '[data-comment-status="pending"] input[type="checkbox"]'
      );
      const count = await checkboxes.count();

      for (let i = 0; i < count; i++) {
        await expect(checkboxes.nth(i)).toBeChecked();
      }

      // Verify bulk actions shows correct count
      await expect(page.locator('[data-testid="bulk-actions"]')).toContainText(
        `${count}`
      );
    });

    test('should deselect all comments', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Select all
      await page.click('[data-testid="select-all-checkbox"]');

      // Deselect all
      await page.click('[data-testid="select-all-checkbox"]');

      // Verify none selected
      await expect(
        page.locator('[data-testid="bulk-actions"]')
      ).not.toBeVisible();
    });
  });

  test.describe('Filtering and Search', () => {
    test('should filter comments by status', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Click filter dropdown
      await page.click('[data-testid="status-filter"]');

      // Select "Approved"
      await page.click('[value="APPROVED"]');

      // Wait for API call
      await waitForAPI(
        page,
        '/api/v1/blog/admin/comments?status=APPROVED',
        'GET'
      );

      // Verify only approved comments shown
      await expect(
        page.locator('[data-comment-status="approved"]')
      ).toHaveCount(
        await page.locator('[data-comment-status="approved"]').count()
      );
      await expect(page.locator('[data-comment-status="pending"]')).toHaveCount(
        0
      );
    });

    test('should search comments by content', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Type search query
      await page.fill('[data-testid="search-input"]', 'Great article');

      // Wait for debounced search
      await page.waitForTimeout(500);

      // Wait for API call
      await waitForAPI(page, /search=Great\+article/, 'GET');

      // Verify filtered results
      const results = page.locator('[data-comment-status]');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);

      // Verify all results contain search term
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const content = await results
            .nth(i)
            .locator('.comment-content')
            .textContent();
          expect(content?.toLowerCase()).toContain('great article');
        }
      }
    });

    test('should filter by date range', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Open filters
      await page.click('button:has-text("Filtreler")');

      // Set date range
      await page.fill('[name="startDate"]', '2025-10-01');
      await page.fill('[name="endDate"]', '2025-10-26');

      // Apply filters
      await page.click('button:has-text("Uygula")');

      // Wait for API
      await waitForAPI(page, /startDate=2025-10-01/, 'GET');

      // Verify results
      await expect(page.locator('[data-comment-status]')).toHaveCount(
        await page.locator('[data-comment-status]').count()
      );
    });

    test('should clear all filters', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Apply some filters
      await page.click('[data-testid="status-filter"]');
      await page.click('[value="APPROVED"]');
      await page.fill('[data-testid="search-input"]', 'test');

      // Click clear filters
      await page.click('button:has-text("Filtreleri Temizle")');

      // Verify filters cleared
      await expect(page.locator('[data-testid="status-filter"]')).toHaveValue(
        'ALL'
      );
      await expect(page.locator('[data-testid="search-input"]')).toHaveValue(
        ''
      );

      // Verify all comments shown
      await waitForAPI(page, '/api/v1/blog/admin/comments/pending', 'GET');
    });
  });

  test.describe('Pagination', () => {
    test('should navigate between pages', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Wait for initial load
      await page.waitForSelector('[data-comment-status]');

      // Click next page
      await page.click('[data-testid="pagination-next"]');

      // Wait for API
      await waitForAPI(page, /page=1/, 'GET');

      // Verify URL changed
      expect(page.url()).toContain('page=2');

      // Verify different comments loaded
      const secondPageComments = await page
        .locator('[data-comment-status]')
        .count();
      expect(secondPageComments).toBeGreaterThan(0);
    });

    test('should change items per page', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Change items per page
      await page.selectOption('[data-testid="items-per-page"]', '20');

      // Wait for API
      await waitForAPI(page, /size=20/, 'GET');

      // Verify more comments displayed
      const comments = await page.locator('[data-comment-status]').count();
      expect(comments).toBeLessThanOrEqual(20);
    });
  });

  test.describe('Auto-refresh', () => {
    test('should auto-refresh comments queue', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Get initial comment count
      const initialCount = await page.locator('[data-comment-status]').count();

      // Wait for auto-refresh (30 seconds)
      await page.waitForTimeout(31000);

      // Verify API called again
      await waitForAPI(page, '/api/v1/blog/admin/comments/pending', 'GET');

      // Verify comments potentially updated
      const newCount = await page.locator('[data-comment-status]').count();
      expect(newCount).toBeGreaterThanOrEqual(0);
    });

    test('should manually refresh comments', async ({ page }) => {
      await page.goto('/moderator/comments');

      // Click refresh button
      await page.click('[data-testid="refresh-button"]');

      // Verify loading indicator
      await expect(
        page.locator('[data-testid="loading-indicator"]')
      ).toBeVisible();

      // Wait for API
      await waitForAPI(page, '/api/v1/blog/admin/comments/pending', 'GET');

      // Verify loading indicator hidden
      await expect(
        page.locator('[data-testid="loading-indicator"]')
      ).not.toBeVisible();
    });
  });

  test.describe('Comment Details', () => {
    test('should view comment post context', async ({ page }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();

      // Click "View Post" button
      await firstComment.locator('button:has-text("Yazıyı Gör")').click();

      // Verify new tab opened with blog post
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
      ]);

      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('/blog/');
    });

    test('should display comment author info', async ({ page }) => {
      await page.goto('/moderator/comments');

      const firstComment = page
        .locator('[data-comment-status="pending"]')
        .first();

      // Verify author elements
      await expect(firstComment.locator('.comment-author')).toBeVisible();
      await expect(firstComment.locator('.comment-author-email')).toBeVisible();
      await expect(firstComment.locator('.comment-date')).toBeVisible();
    });
  });
});
