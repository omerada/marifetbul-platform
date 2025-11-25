/**
 * ================================================
 * AUTO-FLAGGING E2E TESTS
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 3: Auto-Flagging E2E Test (3 SP)
 *
 * Tests for auto-flagging mechanism:
 * - 3 different users report same review → auto-flag
 * - Admin receives notification
 * - Flagged review appears in moderation queue
 *
 * Backend Implementation:
 * - ReviewModerationService.java (AUTO_FLAG_THRESHOLD = 3)
 * - flagReview(), resolveFlag()
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { test, expect, Browser } from '@playwright/test';
import {
  createFlagTestUsers,
  createAdminSession,
  closeMultipleUserSessions,
  UserSession,
} from '../utils/multi-user-helpers';
import {
  waitForInAppNotification,
  clearAllTestNotifications,
} from '../utils/notification-helpers';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_REVIEW_ID = 'test-review-flag-123';

// ============================================================================
// TEST SUITE: AUTO-FLAGGING WORKFLOW
// ============================================================================

test.describe('Auto-Flagging System - 3 Report Threshold', () => {
  let user1: UserSession;
  let user2: UserSession;
  let user3: UserSession;
  let admin: UserSession;

  test.beforeEach(async ({ browser }: { browser: Browser }) => {
    // Create 3 users for flagging + 1 admin
    [user1, user2, user3] = await createFlagTestUsers(browser);
    admin = await createAdminSession(browser);

    // Clear notifications
    await clearAllTestNotifications(admin.page);
  });

  test.afterEach(async () => {
    await closeMultipleUserSessions([user1, user2, user3, admin]);
  });

  // ==========================================================================
  // US-5.1: AUTO-FLAG AT 3 REPORTS
  // ==========================================================================

  test('should auto-flag review when 3 different users report it', async () => {
    // Navigate all users to review page
    const reviewUrl = `/dashboard/reviews/${TEST_REVIEW_ID}`;
    await Promise.all([
      user1.page.goto(reviewUrl),
      user2.page.goto(reviewUrl),
      user3.page.goto(reviewUrl),
    ]);

    // ========== STEP 1: First user reports (count = 1) ==========
    await user1.page.click('[data-testid="flag-review-button"]');
    await user1.page.click('[data-testid="flag-reason-spam"]');
    await user1.page.click('[data-testid="submit-flag"]');

    // Wait for success toast
    await expect(user1.page.locator('.toast-success')).toContainText(
      'Bildiriminiz alındı'
    );

    // Verify review still visible (not flagged yet)
    await expect(
      user1.page.locator('[data-testid="review-content"]')
    ).toBeVisible();

    // ========== STEP 2: Second user reports (count = 2) ==========
    await user2.page.click('[data-testid="flag-review-button"]');
    await user2.page.click('[data-testid="flag-reason-offensive"]');
    await user2.page.click('[data-testid="submit-flag"]');

    await expect(user2.page.locator('.toast-success')).toBeVisible();

    // Review still not flagged
    await expect(
      user2.page.locator('[data-testid="review-content"]')
    ).toBeVisible();

    // ========== STEP 3: Third user reports (count = 3) → AUTO-FLAG ==========
    await user3.page.click('[data-testid="flag-review-button"]');
    await user3.page.click('[data-testid="flag-reason-inappropriate"]');
    await user3.page.click('[data-testid="submit-flag"]');

    await expect(user3.page.locator('.toast-success')).toBeVisible();

    // ========== STEP 4: Verify review auto-flagged ==========
    // Reload page to see updated status
    await user3.page.reload();

    // Review should now show flagged status
    await expect(
      user3.page.locator('[data-testid="review-flagged-badge"]')
    ).toBeVisible({ timeout: 5000 });

    // ========== STEP 5: Verify admin notification ==========
    await waitForInAppNotification(admin.page, {
      title: 'Değerlendirme Otomatik İşaretlendi',
      type: 'MODERATION',
      actionUrl: `/admin/moderation/reviews/${TEST_REVIEW_ID}`,
    });

    // ========== STEP 6: Verify appears in moderation queue ==========
    await admin.page.goto('/admin/moderation/reviews');

    // Filter by flagged status
    await admin.page.click('[data-testid="filter-status"]');
    await admin.page.click('[data-testid="status-flagged"]');

    // Verify review in list
    await expect(
      admin.page.locator(`[data-testid="review-${TEST_REVIEW_ID}"]`)
    ).toBeVisible();

    // Verify flagged count badge shows "3"
    await expect(
      admin.page.locator(`[data-testid="review-${TEST_REVIEW_ID}"] .flag-count`)
    ).toHaveText('3');
  });

  // ==========================================================================
  // US-5.2: SAME USER CANNOT FLAG TWICE
  // ==========================================================================

  test('should prevent duplicate flags from same user', async () => {
    const reviewUrl = `/dashboard/reviews/${TEST_REVIEW_ID}`;
    await user1.page.goto(reviewUrl);

    // ========== First flag ==========
    await user1.page.click('[data-testid="flag-review-button"]');
    await user1.page.click('[data-testid="flag-reason-spam"]');
    await user1.page.click('[data-testid="submit-flag"]');

    await expect(user1.page.locator('.toast-success')).toBeVisible();

    // ========== Attempt second flag ==========
    // Flag button should be disabled or show "Already Reported"
    const flagButton = user1.page.locator('[data-testid="flag-review-button"]');

    await expect(flagButton).toBeDisabled();
    // OR
    await expect(flagButton).toHaveText(/Bildirildi|Already Reported/);
  });

  // ==========================================================================
  // US-5.3: ADMIN RESOLVES FLAG
  // ==========================================================================

  test('should allow admin to resolve flagged review', async () => {
    // Setup: Review already flagged (3 reports)
    await admin.page.goto(`/admin/moderation/reviews/${TEST_REVIEW_ID}`);

    // Verify review is flagged
    await expect(
      admin.page.locator('[data-testid="review-status"]')
    ).toContainText('FLAGGED');

    // ========== STEP 1: Admin approves review (not violating) ==========
    await admin.page.click('[data-testid="approve-review-button"]');
    await admin.page.fill(
      '[data-testid="resolution-notes"]',
      'İncelendi, kural ihlali bulunmadı.'
    );
    await admin.page.click('[data-testid="confirm-approve"]');

    // Wait for success
    await expect(admin.page.locator('.toast-success')).toContainText(
      'Değerlendirme onaylandı'
    );

    // ========== STEP 2: Verify status changed ==========
    await expect(
      admin.page.locator('[data-testid="review-status"]')
    ).toContainText('APPROVED');

    // ========== STEP 3: Verify removed from flagged queue ==========
    await admin.page.goto('/admin/moderation/reviews?status=FLAGGED');

    // Review should not appear in flagged list
    await expect(
      admin.page.locator(`[data-testid="review-${TEST_REVIEW_ID}"]`)
    ).not.toBeVisible();
  });

  // ==========================================================================
  // US-5.4: ADMIN REJECTS FLAGGED REVIEW
  // ==========================================================================

  test('should allow admin to reject flagged review', async () => {
    await admin.page.goto(`/admin/moderation/reviews/${TEST_REVIEW_ID}`);

    // Verify flagged status
    await expect(
      admin.page.locator('[data-testid="review-status"]')
    ).toContainText('FLAGGED');

    // ========== Reject review ==========
    await admin.page.click('[data-testid="reject-review-button"]');
    await admin.page.fill(
      '[data-testid="rejection-reason"]',
      'Uygunsuz içerik: Spam ve hakaret içeriyor.'
    );
    await admin.page.click('[data-testid="confirm-reject"]');

    // Verify success
    await expect(admin.page.locator('.toast-success')).toContainText(
      'Değerlendirme reddedildi'
    );

    // Verify status changed to REJECTED
    await expect(
      admin.page.locator('[data-testid="review-status"]')
    ).toContainText('REJECTED');

    // Verify reviewer notified
    // (Would need reviewer session to verify)
  });

  // ==========================================================================
  // US-5.5: FLAG REASONS DISPLAYED TO ADMIN
  // ==========================================================================

  test('should display all flag reasons to admin', async () => {
    // Setup: Review flagged with different reasons
    await admin.page.goto(`/admin/moderation/reviews/${TEST_REVIEW_ID}`);

    // Verify flag count
    await expect(
      admin.page.locator('[data-testid="flag-count"]')
    ).toContainText('3');

    // Verify flag reasons listed
    await expect(
      admin.page.locator('[data-testid="flag-reasons"]')
    ).toContainText('Spam');
    await expect(
      admin.page.locator('[data-testid="flag-reasons"]')
    ).toContainText('Offensive');
    await expect(
      admin.page.locator('[data-testid="flag-reasons"]')
    ).toContainText('Inappropriate');
  });

  // ==========================================================================
  // US-5.6: BULK FLAG RESOLUTION
  // ==========================================================================

  test('should allow bulk resolution of flagged reviews', async () => {
    await admin.page.goto('/admin/moderation/reviews?status=FLAGGED');

    // Select multiple flagged reviews
    await admin.page.click('[data-testid="select-all-reviews"]');

    // Verify selection count
    const selectedCount = await admin.page
      .locator('[data-testid="selected-count"]')
      .textContent();
    expect(parseInt(selectedCount || '0')).toBeGreaterThan(1);

    // Bulk approve
    await admin.page.click('[data-testid="bulk-approve-button"]');
    await admin.page.fill(
      '[data-testid="bulk-resolution-notes"]',
      'Toplu inceleme tamamlandı, sorun yok.'
    );
    await admin.page.click('[data-testid="confirm-bulk-approve"]');

    // Verify success
    await expect(admin.page.locator('.toast-success')).toContainText(
      'değerlendirme onaylandı'
    );

    // Verify flagged queue empty or reduced
    const remainingFlagged = await admin.page
      .locator('[data-testid="flagged-review-item"]')
      .count();
    expect(remainingFlagged).toBe(0);
  });
});
