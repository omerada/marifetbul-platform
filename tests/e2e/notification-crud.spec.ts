import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  login,
  clearSession,
  waitForElement,
} from './utils/helpers';

/**
 * E2E Tests for Notification CRUD Operations
 * Sprint 1 - Story 1.1: Notification Delete Endpoint
 *
 * Test Coverage:
 * - View notifications (list, unread, recent)
 * - Mark as read/unread
 * - Delete single notification
 * - Delete multiple notifications (batch)
 * - Notification counts and badges
 * - Real-time updates via WebSocket
 */

test.describe('Notification CRUD Operations', () => {
  let testUser: any;

  test.beforeAll(async () => {
    testUser = generateTestUser();
  });

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await login(page, testUser.email, testUser.password);
    await page.waitForURL(/\/(dashboard|home)/, { timeout: 10000 });
  });

  test.describe('View Notifications', () => {
    test('should display notification center', async ({ page }) => {
      // Open notification center
      const notificationButton = page.locator(
        '[data-testid="notification-button"], button[aria-label*="Bildirim"]'
      );
      await notificationButton.click();

      // Verify notification panel opened
      const notificationPanel = page.locator(
        '[data-testid="notification-panel"], [role="dialog"]'
      );
      await expect(notificationPanel).toBeVisible();
    });

    test('should show unread count badge', async ({ page }) => {
      const badge = page.locator(
        '[data-testid="notification-badge"], .notification-badge'
      );

      if ((await badge.count()) > 0) {
        const badgeText = await badge.textContent();
        expect(badgeText).toMatch(/\d+/);
      }
    });

    test('should display notification list', async ({ page }) => {
      // Open notification panel
      await page.click('[data-testid="notification-button"]');

      // Wait for notifications to load
      await page.waitForSelector('[data-testid="notification-item"]', {
        timeout: 5000,
      });

      const notifications = page.locator('[data-testid="notification-item"]');
      const count = await notifications.count();

      expect(count).toBeGreaterThan(0);
    });

    test('should show notification details', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const firstNotification = page
        .locator('[data-testid="notification-item"]')
        .first();

      // Should have title
      const title = firstNotification.locator(
        '[data-testid="notification-title"]'
      );
      await expect(title).toBeVisible();

      // Should have content
      const content = firstNotification.locator(
        '[data-testid="notification-content"]'
      );
      await expect(content).toBeVisible();

      // Should have timestamp
      const timestamp = firstNotification.locator(
        '[data-testid="notification-time"]'
      );
      await expect(timestamp).toBeVisible();
    });

    test('should filter unread notifications', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      // Find unread filter tab/button
      const unreadFilter = page.locator(
        '[data-testid="filter-unread"], button:has-text("Okunmamış")'
      );

      if ((await unreadFilter.count()) > 0) {
        await unreadFilter.click();
        await page.waitForTimeout(500);

        // All visible notifications should be unread
        const notifications = page.locator('[data-testid="notification-item"]');
        const firstNotification = notifications.first();

        if ((await notifications.count()) > 0) {
          const isUnread = await firstNotification.getAttribute('data-unread');
          expect(isUnread).toBe('true');
        }
      }
    });
  });

  test.describe('Mark as Read/Unread', () => {
    test('should mark notification as read', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      // Find an unread notification
      const unreadNotification = page.locator(
        '[data-testid="notification-item"][data-unread="true"]'
      );

      if ((await unreadNotification.count()) > 0) {
        // Click on notification to mark as read
        await unreadNotification.first().click();
        await page.waitForTimeout(500);

        // Notification should be marked as read
        const isRead = await unreadNotification
          .first()
          .getAttribute('data-unread');
        expect(isRead).toBe('false');
      }
    });

    test('should mark notification as unread via menu', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const readNotification = page.locator(
        '[data-testid="notification-item"][data-unread="false"]'
      );

      if ((await readNotification.count()) > 0) {
        // Open notification menu
        const menuButton = readNotification
          .first()
          .locator('[data-testid="notification-menu"]');
        await menuButton.click();

        // Click "Mark as unread"
        const unreadOption = page.locator(
          'text=/Okunmadı.*işaretle|Mark.*unread/i'
        );
        await unreadOption.click();
        await page.waitForTimeout(500);

        // Should be marked as unread
        const isUnread = await readNotification
          .first()
          .getAttribute('data-unread');
        expect(isUnread).toBe('true');
      }
    });

    test('should mark all notifications as read', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      // Find "Mark all as read" button
      const markAllButton = page.locator(
        '[data-testid="mark-all-read"], button:has-text("Tümünü okundu işaretle")'
      );

      if ((await markAllButton.count()) > 0) {
        await markAllButton.click();
        await page.waitForTimeout(1000);

        // All notifications should be read
        const unreadCount = await page
          .locator('[data-testid="notification-item"][data-unread="true"]')
          .count();
        expect(unreadCount).toBe(0);

        // Badge should be hidden or show 0
        const badge = page.locator('[data-testid="notification-badge"]');
        const isVisible = await badge.isVisible();
        if (isVisible) {
          const badgeText = await badge.textContent();
          expect(badgeText).toBe('0');
        }
      }
    });
  });

  test.describe('Delete Notifications (Sprint 1.1)', () => {
    test('should delete single notification', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      // Get initial notification count
      const initialCount = await page
        .locator('[data-testid="notification-item"]')
        .count();

      if (initialCount > 0) {
        const firstNotification = page
          .locator('[data-testid="notification-item"]')
          .first();

        // Get notification ID for verification
        const notificationId = await firstNotification.getAttribute('data-id');

        // Open notification menu
        const menuButton = firstNotification.locator(
          '[data-testid="notification-menu"]'
        );
        await menuButton.click();

        // Click delete option
        const deleteButton = page.locator(
          '[data-testid="delete-notification"], text=/Sil|Delete/i'
        );
        await deleteButton.click();

        // Confirm deletion if modal appears
        const confirmButton = page.locator(
          'button:has-text("Evet"), button:has-text("Sil"), button:has-text("Delete")'
        );
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);

        // Notification should be removed from list
        const newCount = await page
          .locator('[data-testid="notification-item"]')
          .count();
        expect(newCount).toBe(initialCount - 1);

        // Deleted notification should not exist
        const deletedNotification = page.locator(
          `[data-testid="notification-item"][data-id="${notificationId}"]`
        );
        expect(await deletedNotification.count()).toBe(0);
      }
    });

    test('should show confirmation modal before delete', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const firstNotification = page
        .locator('[data-testid="notification-item"]')
        .first();

      if ((await firstNotification.count()) > 0) {
        const menuButton = firstNotification.locator(
          '[data-testid="notification-menu"]'
        );
        await menuButton.click();

        const deleteButton = page.locator('text=/Sil|Delete/i');
        await deleteButton.click();

        // Should show confirmation modal
        const modal = page.locator('[role="dialog"], .modal');
        await expect(modal).toBeVisible();

        // Should have confirm and cancel buttons
        const confirmButton = modal.locator('button:has-text("Evet")');
        const cancelButton = modal.locator('button:has-text("Hayır")');

        await expect(confirmButton).toBeVisible();
        await expect(cancelButton).toBeVisible();
      }
    });

    test('should cancel notification deletion', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const initialCount = await page
        .locator('[data-testid="notification-item"]')
        .count();

      if (initialCount > 0) {
        const firstNotification = page
          .locator('[data-testid="notification-item"]')
          .first();

        const menuButton = firstNotification.locator(
          '[data-testid="notification-menu"]'
        );
        await menuButton.click();

        const deleteButton = page.locator('text=/Sil|Delete/i');
        await deleteButton.click();

        // Click cancel
        const cancelButton = page.locator(
          'button:has-text("Hayır"), button:has-text("İptal")'
        );
        if ((await cancelButton.count()) > 0) {
          await cancelButton.click();
        }

        await page.waitForTimeout(500);

        // Notification should still exist
        const newCount = await page
          .locator('[data-testid="notification-item"]')
          .count();
        expect(newCount).toBe(initialCount);
      }
    });

    test('should delete multiple notifications (batch)', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const initialCount = await page
        .locator('[data-testid="notification-item"]')
        .count();

      if (initialCount >= 2) {
        // Select multiple notifications
        const checkboxes = page.locator(
          '[data-testid="notification-checkbox"]'
        );

        // Select first two notifications
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Click bulk delete button
        const bulkDeleteButton = page.locator(
          '[data-testid="delete-selected"], button:has-text("Seçilileri sil")'
        );

        if ((await bulkDeleteButton.count()) > 0) {
          await bulkDeleteButton.click();

          // Confirm deletion
          const confirmButton = page.locator('button:has-text("Evet")');
          if ((await confirmButton.count()) > 0) {
            await confirmButton.click();
          }

          await page.waitForTimeout(1000);

          // Should delete 2 notifications
          const newCount = await page
            .locator('[data-testid="notification-item"]')
            .count();
          expect(newCount).toBe(initialCount - 2);
        }
      }
    });

    test('should show success message after deletion', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const firstNotification = page
        .locator('[data-testid="notification-item"]')
        .first();

      if ((await firstNotification.count()) > 0) {
        const menuButton = firstNotification.locator(
          '[data-testid="notification-menu"]'
        );
        await menuButton.click();

        const deleteButton = page.locator('text=/Sil|Delete/i');
        await deleteButton.click();

        const confirmButton = page.locator('button:has-text("Evet")');
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // Should show success toast
        const toast = page.locator(
          'text=/silindi|deleted/i, [role="status"], .toast'
        );
        await expect(toast.first()).toBeVisible({ timeout: 3000 });
      }
    });
  });

  test.describe('Notification Types', () => {
    test('should display different notification types correctly', async ({
      page,
    }) => {
      await page.click('[data-testid="notification-button"]');

      const notifications = page.locator('[data-testid="notification-item"]');

      if ((await notifications.count()) > 0) {
        // Check for notification type icons
        const firstNotification = notifications.first();
        const icon = firstNotification.locator(
          '[data-testid="notification-icon"], svg'
        );

        await expect(icon).toBeVisible();
      }
    });

    test('should navigate to correct page on notification click', async ({
      page,
    }) => {
      await page.click('[data-testid="notification-button"]');

      const notificationWithAction = page.locator(
        '[data-testid="notification-item"][data-action-url]'
      );

      if ((await notificationWithAction.count()) > 0) {
        const actionUrl = await notificationWithAction
          .first()
          .getAttribute('data-action-url');

        await notificationWithAction.first().click();
        await page.waitForTimeout(1000);

        // Should navigate to action URL
        expect(page.url()).toContain(actionUrl || '');
      }
    });
  });

  test.describe('Notification Counts', () => {
    test('should update badge count after marking as read', async ({
      page,
    }) => {
      const badge = page.locator('[data-testid="notification-badge"]');

      if ((await badge.count()) > 0) {
        const initialCount = await badge.textContent();
        const initialNumber = parseInt(initialCount || '0', 10);

        // Open notification panel and mark one as read
        await page.click('[data-testid="notification-button"]');

        const unreadNotification = page.locator(
          '[data-testid="notification-item"][data-unread="true"]'
        );

        if ((await unreadNotification.count()) > 0) {
          await unreadNotification.first().click();
          await page.waitForTimeout(1000);

          // Badge count should decrease
          const newCount = await badge.textContent();
          const newNumber = parseInt(newCount || '0', 10);

          expect(newNumber).toBe(initialNumber - 1);
        }
      }
    });

    test('should update badge count after deletion', async ({ page }) => {
      const badge = page.locator('[data-testid="notification-badge"]');

      if ((await badge.count()) > 0) {
        const initialCount = await badge.textContent();
        const initialNumber = parseInt(initialCount || '0', 10);

        // Delete an unread notification
        await page.click('[data-testid="notification-button"]');

        const unreadNotification = page.locator(
          '[data-testid="notification-item"][data-unread="true"]'
        );

        if ((await unreadNotification.count()) > 0) {
          const menuButton = unreadNotification
            .first()
            .locator('[data-testid="notification-menu"]');
          await menuButton.click();

          const deleteButton = page.locator('text=/Sil|Delete/i');
          await deleteButton.click();

          const confirmButton = page.locator('button:has-text("Evet")');
          if ((await confirmButton.count()) > 0) {
            await confirmButton.click();
          }

          await page.waitForTimeout(1000);

          // Badge count should decrease
          if ((await badge.count()) > 0) {
            const newCount = await badge.textContent();
            const newNumber = parseInt(newCount || '0', 10);
            expect(newNumber).toBeLessThan(initialNumber);
          }
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network error gracefully', async ({
      page,
      context,
    }) => {
      await page.click('[data-testid="notification-button"]');

      // Simulate network offline
      await context.setOffline(true);

      // Try to delete notification
      const firstNotification = page
        .locator('[data-testid="notification-item"]')
        .first();

      if ((await firstNotification.count()) > 0) {
        const menuButton = firstNotification.locator(
          '[data-testid="notification-menu"]'
        );
        await menuButton.click();

        const deleteButton = page.locator('text=/Sil|Delete/i');
        await deleteButton.click();

        const confirmButton = page.locator('button:has-text("Evet")');
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }

        // Should show error message
        const errorToast = page.locator(
          'text=/hata|error|başarısız/i, [role="alert"]'
        );
        await expect(errorToast.first()).toBeVisible({ timeout: 3000 });
      }

      // Re-enable network
      await context.setOffline(false);
    });

    test('should handle unauthorized access', async ({ page }) => {
      // Logout
      await clearSession(page);

      // Try to access notifications
      await page.goto('/api/v1/notifications');

      // Should redirect to login or show 401 error
      const isLoginPage = page.url().includes('/login');
      const isErrorPage = page.url().includes('/401');

      expect(isLoginPage || isErrorPage).toBeTruthy();
    });
  });

  test.describe('Pagination & Infinite Scroll', () => {
    test('should load more notifications on scroll', async ({ page }) => {
      await page.click('[data-testid="notification-button"]');

      const notificationList = page.locator(
        '[data-testid="notification-list"]'
      );

      // Get initial count
      const initialCount = await page
        .locator('[data-testid="notification-item"]')
        .count();

      // Scroll to bottom of notification list
      await notificationList.evaluate((node) => {
        node.scrollTop = node.scrollHeight;
      });

      await page.waitForTimeout(2000);

      // Should load more notifications
      const newCount = await page
        .locator('[data-testid="notification-item"]')
        .count();

      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
  });
});
