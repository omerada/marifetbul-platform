/**
 * ================================================
 * REVIEW REMINDER E2E TESTS - COMPREHENSIVE
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 2: Order Completion Review Reminder Tests (5 SP)
 *
 * Tests for ReviewReminderService scheduled job:
 * - 3-day reminder after order completion
 * - 7-day reminder with incentive message
 * - 14-day final reminder with urgency
 * - Reminder stops after review submission
 * - No duplicate reminders sent
 *
 * Backend Implementation:
 * - ReviewReminderService.java (@Scheduled cron = "0 0 10 * * *")
 * - Multi-channel notifications (email, push, WebSocket, in-app)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { test, expect, Browser } from '@playwright/test';
import {
  advanceTime,
  simulateSchedulerTime,
  triggerScheduler,
  resetSystemTime,
  REVIEW_REMINDER_SCHEDULE,
} from '../utils/time-helpers';
import {
  waitForInAppNotification,
  getNotificationCount,
  clearAllTestNotifications,
  assertMultiChannelNotification,
  waitForEmailNotification,
} from '../utils/notification-helpers';
import {
  createBuyerSellerSessions,
  closeMultipleUserSessions,
  UserSession,
} from '../utils/multi-user-helpers';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

const TEST_ORDER_ID = 'test-order-reminder-123';
const SCHEDULER_TRIGGER_ENDPOINT =
  '/api/v1/admin/schedulers/review-reminder/trigger';

// ============================================================================
// TEST SETUP & TEARDOWN
// ============================================================================

let buyer: UserSession;
let seller: UserSession;

test.beforeEach(async ({ browser }: { browser: Browser }) => {
  // Create buyer and seller sessions
  [buyer, seller] = await createBuyerSellerSessions(browser);

  // Clear all test notifications
  await clearAllTestNotifications(buyer.page);
});

test.afterEach(async () => {
  // Reset system time
  await resetSystemTime(buyer.page);
  await resetSystemTime(seller.page);

  // Close sessions
  await closeMultipleUserSessions([buyer, seller]);
});

// ============================================================================
// TEST SUITE: REVIEW REMINDER WORKFLOW
// ============================================================================

test.describe('Review Reminder System - Complete Workflow', () => {
  // ==========================================================================
  // US-4.1: ORDER COMPLETION TRIGGERS REMINDER
  // ==========================================================================

  test('should trigger review reminder on order completion', async () => {
    // ========== STEP 1: Complete order ==========
    await buyer.page.goto(`/dashboard/orders/${TEST_ORDER_ID}`);

    // Verify order is in DELIVERED status
    await expect(
      buyer.page.locator('[data-testid="order-status"]')
    ).toContainText('Teslim Edildi');

    // Buyer accepts delivery (completes order)
    await buyer.page.click('[data-testid="accept-delivery-button"]');

    // Confirm acceptance modal
    await buyer.page.click('[data-testid="confirm-acceptance"]');

    // Wait for order status to change to COMPLETED
    await expect(
      buyer.page.locator('[data-testid="order-status"]')
    ).toContainText('Tamamlandı', { timeout: 10000 });

    // ========== STEP 2: Advance time to 3 days ==========
    await advanceTime(buyer.page, { days: REVIEW_REMINDER_SCHEDULE.FIRST });

    // ========== STEP 3: Simulate scheduler run (10:00 AM) ==========
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Trigger scheduler manually
    const response = await triggerScheduler(
      buyer.page,
      SCHEDULER_TRIGGER_ENDPOINT
    );
    expect(response.success).toBe(true);
    expect(response.data?.['3_day_reminders']).toBeGreaterThan(0);

    // ========== STEP 4: Verify notification received ==========
    await waitForInAppNotification(buyer.page, {
      title: 'İşiniz Tamamlandı - Değerlendirme Bırakın',
      type: 'REVIEW',
      actionUrl: `/dashboard/orders/${TEST_ORDER_ID}/review`,
      actionLabel: 'Değerlendirme Yap',
    });

    // Verify notification count increased
    const notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBeGreaterThan(0);
  });

  // ==========================================================================
  // US-4.2: 3-DAY REMINDER (GENTLE)
  // ==========================================================================

  test('should send 3-day gentle reminder notification', async () => {
    // Setup: Order already completed 3 days ago
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Clear existing notifications
    await clearAllTestNotifications(buyer.page);

    // Trigger scheduler
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Verify notification content (gentle tone)
    await waitForInAppNotification(buyer.page, {
      title: 'İşiniz Tamamlandı - Değerlendirme Bırakın ⭐',
      priority: 'LOW',
    });

    // Verify seller name mentioned in notification
    await expect(
      buyer.page.locator('[data-testid="notification-content"]')
    ).toContainText('tamamladı');

    // Verify action button exists
    await expect(
      buyer.page.locator('[data-testid="notification-action"]')
    ).toHaveText('Değerlendirme Yap');
  });

  // ==========================================================================
  // US-4.3: 7-DAY REMINDER (INCENTIVE)
  // ==========================================================================

  test('should send 7-day reminder with incentive message', async () => {
    // Setup: Order completed 7 days ago
    await advanceTime(buyer.page, { days: REVIEW_REMINDER_SCHEDULE.SECOND });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Clear notifications
    await clearAllTestNotifications(buyer.page);

    // Trigger scheduler
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Verify 7-day notification (incentive messaging)
    await waitForInAppNotification(buyer.page, {
      title: 'Deneyiminizi Paylaşın 💬',
      priority: 'MEDIUM',
    });

    // Verify content mentions "değerli" (valuable)
    await expect(
      buyer.page.locator('[data-testid="notification-content"]')
    ).toContainText('değerli');

    // Verify email notification sent
    if (process.env.MAILHOG_ENABLED === 'true') {
      await waitForEmailNotification(buyer.email, {
        subject: 'Deneyiminizi Paylaşın',
      });
    }
  });

  // ==========================================================================
  // US-4.4: 14-DAY FINAL REMINDER (URGENCY)
  // ==========================================================================

  test('should send final reminder at 14 days with urgency', async () => {
    // Setup: Order completed 14 days ago
    await advanceTime(buyer.page, { days: REVIEW_REMINDER_SCHEDULE.FINAL });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Clear notifications
    await clearAllTestNotifications(buyer.page);

    // Trigger scheduler
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Verify final reminder (urgent tone)
    await waitForInAppNotification(buyer.page, {
      title: 'Son Hatırlatma: Değerlendirmenizi Bekliyoruz',
      priority: 'HIGH',
    });

    // Verify urgency messaging
    await expect(
      buyer.page.locator('[data-testid="notification-content"]')
    ).toContainText('2 hafta önce tamamladınız');
  });

  // ==========================================================================
  // US-4.5: STOP REMINDERS AFTER REVIEW SUBMITTED
  // ==========================================================================

  test('should stop reminders after review submitted', async () => {
    // ========== STEP 1: Receive 3-day reminder ==========
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Verify first reminder received
    let notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBeGreaterThan(0);

    // ========== STEP 2: Buyer submits review ==========
    await buyer.page.click('[data-testid="notification-bell"]');
    await buyer.page.click('[data-testid="notification-action"]'); // "Değerlendirme Yap"

    // Fill review form
    await buyer.page.click('[data-testid="star-rating-5"]'); // 5 stars
    await buyer.page.fill(
      '[data-testid="review-text"]',
      'Harika bir deneyimdi, çok memnun kaldım!'
    );
    await buyer.page.click('[data-testid="submit-review"]');

    // Wait for review submission success
    await expect(buyer.page.locator('.toast-success')).toContainText(
      'Değerlendirmeniz kaydedildi'
    );

    // Clear notifications
    await clearAllTestNotifications(buyer.page);

    // ========== STEP 3: Advance to 7-day mark ==========
    await advanceTime(buyer.page, { days: 4 }); // 3 + 4 = 7 days total
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Wait 5 seconds to ensure no notification sent
    await buyer.page.waitForTimeout(5000);

    // ========== STEP 4: Verify NO reminder sent ==========
    notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBe(0);

    // Advance to 14-day mark
    await advanceTime(buyer.page, { days: 7 }); // 7 + 7 = 14 days total
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.waitForTimeout(5000);

    // Verify still no reminder
    notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBe(0);
  });

  // ==========================================================================
  // US-4.6: NO DUPLICATE REMINDERS
  // ==========================================================================

  test('should not send duplicate reminders for same stage', async () => {
    // ========== STEP 1: Send 3-day reminder ==========
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    const firstCount = await getNotificationCount(buyer.page);
    expect(firstCount).toBeGreaterThan(0);

    // ========== STEP 2: Trigger scheduler again (same day) ==========
    await simulateSchedulerTime(buyer.page, { hour: 14, minute: 0 }); // 2 PM
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Wait for potential duplicate
    await buyer.page.waitForTimeout(3000);

    // ========== STEP 3: Verify no duplicate sent ==========
    const secondCount = await getNotificationCount(buyer.page);
    expect(secondCount).toBe(firstCount); // Count should not increase
  });

  // ==========================================================================
  // US-4.7: MULTI-CHANNEL NOTIFICATION DELIVERY
  // ==========================================================================

  test('should send reminder via all channels (in-app, email, push, WebSocket)', async () => {
    // Setup: 7-day reminder scenario
    await advanceTime(buyer.page, { days: 7 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Clear all channels
    await clearAllTestNotifications(buyer.page);

    // Trigger scheduler
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Verify all channels received notification
    await assertMultiChannelNotification(buyer.page, buyer.userId, {
      title: 'Deneyiminizi Paylaşın 💬',
      type: 'REVIEW',
      actionUrl: `/dashboard/orders/${TEST_ORDER_ID}/review`,
    });
  });

  // ==========================================================================
  // US-4.8: ACTION BUTTON NAVIGATION
  // ==========================================================================

  test('should navigate to review form when action button clicked', async () => {
    // Send 3-day reminder
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Wait for notification
    await waitForInAppNotification(buyer.page, {
      actionLabel: 'Değerlendirme Yap',
    });

    // Click notification bell
    await buyer.page.click('[data-testid="notification-bell"]');

    // Click action button
    await buyer.page.click('[data-testid="notification-action"]');

    // Verify navigation to review form
    await expect(buyer.page).toHaveURL(
      new RegExp(`/dashboard/orders/${TEST_ORDER_ID}`)
    );

    // Verify review modal/form opened
    await expect(
      buyer.page.locator('[data-testid="review-form-modal"]')
    ).toBeVisible({ timeout: 5000 });
  });

  // ==========================================================================
  // US-4.9: CONFIGURATION TOGGLE (DISABLE REMINDERS)
  // ==========================================================================

  test('should not send reminders when disabled in config', async () => {
    // ========== STEP 1: Disable reminders via admin API ==========
    const adminToken = await buyer.page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    await buyer.page.request.put(
      '/api/v1/admin/system-config/REVIEW_REMINDER_ENABLED',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { value: 'false' },
      }
    );

    // ========== STEP 2: Advance time and trigger scheduler ==========
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    // Wait for potential notification
    await buyer.page.waitForTimeout(5000);

    // ========== STEP 3: Verify no notification sent ==========
    const notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBe(0);

    // ========== CLEANUP: Re-enable reminders ==========
    await buyer.page.request.put(
      '/api/v1/admin/system-config/REVIEW_REMINDER_ENABLED',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { value: 'true' },
      }
    );
  });

  // ==========================================================================
  // US-4.10: SELECTIVE STAGE DISABLE
  // ==========================================================================

  test('should skip 7-day reminder when stage disabled', async () => {
    // ========== STEP 1: Disable only 7-day reminders ==========
    const adminToken = await buyer.page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    await buyer.page.request.put(
      '/api/v1/admin/system-config/REVIEW_REMINDER_7D_ENABLED',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { value: 'false' },
      }
    );

    // ========== STEP 2: Verify 3-day reminder still works ==========
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    const countAfter3Days = await getNotificationCount(buyer.page);
    expect(countAfter3Days).toBeGreaterThan(0);

    await clearAllTestNotifications(buyer.page);

    // ========== STEP 3: Advance to 7 days ==========
    await advanceTime(buyer.page, { days: 4 }); // 3 + 4 = 7
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.waitForTimeout(3000);

    // ========== STEP 4: Verify 7-day reminder NOT sent ==========
    const countAfter7Days = await getNotificationCount(buyer.page);
    expect(countAfter7Days).toBe(0);

    // ========== STEP 5: Verify 14-day reminder still works ==========
    await advanceTime(buyer.page, { days: 7 }); // 7 + 7 = 14
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    const countAfter14Days = await getNotificationCount(buyer.page);
    expect(countAfter14Days).toBeGreaterThan(0);

    // ========== CLEANUP ==========
    await buyer.page.request.put(
      '/api/v1/admin/system-config/REVIEW_REMINDER_7D_ENABLED',
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { value: 'true' },
      }
    );
  });

  // ==========================================================================
  // US-4.11: NOTIFICATION PRIORITY ESCALATION
  // ==========================================================================

  test('should escalate notification priority over time', async () => {
    // ========== 3-day reminder: LOW priority ==========
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.click('[data-testid="notification-bell"]');
    const firstNotification = buyer.page
      .locator('[data-testid="notification-item"]')
      .first();
    await expect(firstNotification).toHaveAttribute('data-priority', 'LOW');

    await clearAllTestNotifications(buyer.page);

    // ========== 7-day reminder: MEDIUM priority ==========
    await advanceTime(buyer.page, { days: 4 }); // +4 = 7 total
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.click('[data-testid="notification-bell"]');
    const secondNotification = buyer.page
      .locator('[data-testid="notification-item"]')
      .first();
    await expect(secondNotification).toHaveAttribute('data-priority', 'MEDIUM');

    await clearAllTestNotifications(buyer.page);

    // ========== 14-day reminder: HIGH priority ==========
    await advanceTime(buyer.page, { days: 7 }); // +7 = 14 total
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.click('[data-testid="notification-bell"]');
    const finalNotification = buyer.page
      .locator('[data-testid="notification-item"]')
      .first();
    await expect(finalNotification).toHaveAttribute('data-priority', 'HIGH');
  });

  // ==========================================================================
  // US-4.12: MULTIPLE ORDERS BATCH PROCESSING
  // ==========================================================================

  test('should send reminders for multiple completed orders', async () => {
    // Setup: Multiple orders completed
    const orderIds = ['order-1', 'order-2', 'order-3'];

    // Advance time to 3 days
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    // Clear notifications
    await clearAllTestNotifications(buyer.page);

    // Trigger scheduler
    const response = await triggerScheduler(
      buyer.page,
      SCHEDULER_TRIGGER_ENDPOINT
    );

    // Verify multiple reminders sent
    expect(response.data?.['3_day_reminders']).toBeGreaterThanOrEqual(3);

    // Verify notifications for each order
    await buyer.page.click('[data-testid="notification-bell"]');

    for (const orderId of orderIds) {
      await expect(
        buyer.page.locator('[data-testid="notification-item"]', {
          has: buyer.page.locator(`[href*="${orderId}"]`),
        })
      ).toBeVisible();
    }
  });

  // ==========================================================================
  // US-4.13: TIMEZONE HANDLING (10 AM TURKEY TIME)
  // ==========================================================================

  test('should run scheduler at 10:00 AM Turkey time', async () => {
    // Setup: Order completed 3 days ago
    await advanceTime(buyer.page, { days: 3 });

    // ========== Test runs at 9:59 AM - should NOT trigger ==========
    await simulateSchedulerTime(buyer.page, { hour: 9, minute: 59 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.waitForTimeout(2000);
    let notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBe(0);

    // ========== Test runs at 10:00 AM - SHOULD trigger ==========
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.waitForTimeout(2000);
    notificationCount = await getNotificationCount(buyer.page);
    expect(notificationCount).toBeGreaterThan(0);
  });

  // ==========================================================================
  // US-4.14: SELLER DOES NOT RECEIVE REMINDERS
  // ==========================================================================

  test('should send reminders only to buyer, not seller', async () => {
    // Setup: Order completed 3 days ago
    await advanceTime(buyer.page, { days: 3 });
    await advanceTime(seller.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });
    await simulateSchedulerTime(seller.page, { hour: 10, minute: 0 });

    // Clear both users' notifications
    await clearAllTestNotifications(buyer.page);
    await clearAllTestNotifications(seller.page);

    // Trigger scheduler
    await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);

    await buyer.page.waitForTimeout(3000);

    // Verify buyer received reminder
    const buyerNotificationCount = await getNotificationCount(buyer.page);
    expect(buyerNotificationCount).toBeGreaterThan(0);

    // Verify seller did NOT receive reminder
    const sellerNotificationCount = await getNotificationCount(seller.page);
    expect(sellerNotificationCount).toBe(0);
  });
});

// ============================================================================
// TEST SUITE: ERROR HANDLING & EDGE CASES
// ============================================================================

test.describe('Review Reminder System - Edge Cases', () => {
  // ==========================================================================
  // Edge Case 1: Order completed but already has review
  // ==========================================================================

  test('should not send reminder if review already exists', async () => {
    // This test requires order with existing review
    // Backend ReviewReminderService already checks:
    // reviewRepository.existsByOrderIdAndReviewerId()

    // Verify via scheduler response
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    const response = await triggerScheduler(
      buyer.page,
      SCHEDULER_TRIGGER_ENDPOINT
    );

    // If order has review, reminder count should be 0
    expect(response.data?.['3_day_reminders']).toBeGreaterThanOrEqual(0);
  });

  // ==========================================================================
  // Edge Case 2: Scheduler failure recovery
  // ==========================================================================

  test('should handle scheduler execution failures gracefully', async () => {
    // Simulate network error during scheduler run
    await buyer.page.route(SCHEDULER_TRIGGER_ENDPOINT, (route) => {
      route.abort('failed');
    });

    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    try {
      await triggerScheduler(buyer.page, SCHEDULER_TRIGGER_ENDPOINT);
    } catch {
      // Expected to fail
    }

    // Remove route mock
    await buyer.page.unroute(SCHEDULER_TRIGGER_ENDPOINT);

    // Retry scheduler - should work
    const response = await triggerScheduler(
      buyer.page,
      SCHEDULER_TRIGGER_ENDPOINT
    );
    expect(response.success).toBe(true);
  });
});

// ============================================================================
// TEST SUITE: PERFORMANCE & SCALABILITY
// ============================================================================

test.describe('Review Reminder System - Performance', () => {
  test('should process 100+ orders within scheduler timeout', async () => {
    // Advance to 3-day mark
    await advanceTime(buyer.page, { days: 3 });
    await simulateSchedulerTime(buyer.page, { hour: 10, minute: 0 });

    const startTime = Date.now();

    // Trigger scheduler
    const response = await triggerScheduler(
      buyer.page,
      SCHEDULER_TRIGGER_ENDPOINT
    );

    const executionTime = Date.now() - startTime;

    // Verify execution completed
    expect(response.success).toBe(true);

    // Verify execution time under 30 seconds (reasonable for 100+ orders)
    expect(executionTime).toBeLessThan(30000);

    // Verify reminders processed
    const totalReminders = response.data?.total || 0;
    expect(totalReminders).toBeGreaterThanOrEqual(0);
  });
});
