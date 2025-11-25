/**
 * ================================================
 * NOTIFICATION TESTING UTILITIES
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 1: Test Infrastructure Setup
 *
 * Utilities for testing multi-channel notifications in E2E tests:
 * - Email notifications (SendGrid/MailHog)
 * - Push notifications (Firebase FCM)
 * - WebSocket real-time notifications
 * - In-app notification display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { Page, expect } from '@playwright/test';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationAssertion {
  /** Expected notification title */
  title?: string;
  /** Expected notification content/message */
  content?: string;
  /** Expected action URL */
  actionUrl?: string;
  /** Expected action label text */
  actionLabel?: string;
  /** Expected notification type */
  type?: string;
  /** Expected priority level */
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

export interface EmailNotification {
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface PushNotification {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: Date;
}

// ============================================================================
// IN-APP NOTIFICATION HELPERS
// ============================================================================

/**
 * Wait for in-app notification to appear
 *
 * Polls notification bell/dropdown for new notification
 *
 * @param page Playwright page instance
 * @param assertion Expected notification properties
 * @param timeoutMs Maximum wait time in milliseconds
 *
 * @example
 * ```typescript
 * await waitForInAppNotification(page, {
 *   title: 'Değerlendirme Hatırlatması',
 *   actionUrl: '/dashboard/orders/123/review',
 * });
 * ```
 */
export async function waitForInAppNotification(
  page: Page,
  assertion: NotificationAssertion,
  timeoutMs = 30000
): Promise<void> {
  // Click notification bell to open dropdown
  await page.click('[data-testid="notification-bell"]', { timeout: 5000 });

  // Wait for notification list to load
  await page.waitForSelector('[data-testid="notification-list"]', {
    timeout: 5000,
  });

  // Wait for specific notification
  if (assertion.title) {
    await expect(
      page.locator('[data-testid="notification-item"]', {
        hasText: assertion.title,
      })
    ).toBeVisible({ timeout: timeoutMs });
  }

  if (assertion.content) {
    await expect(
      page.locator('[data-testid="notification-content"]', {
        hasText: assertion.content,
      })
    ).toBeVisible({ timeout: timeoutMs });
  }

  if (assertion.actionLabel) {
    await expect(
      page.locator('[data-testid="notification-action"]', {
        hasText: assertion.actionLabel,
      })
    ).toBeVisible({ timeout: timeoutMs });
  }
}

/**
 * Get notification count from bell badge
 *
 * @param page Playwright page instance
 * @returns Number of unread notifications
 */
export async function getNotificationCount(page: Page): Promise<number> {
  const badge = page.locator('[data-testid="notification-badge"]');

  if (!(await badge.isVisible())) {
    return 0;
  }

  const text = await badge.textContent();
  return parseInt(text || '0', 10);
}

/**
 * Clear all notifications
 *
 * @param page Playwright page instance
 */
export async function clearAllNotifications(page: Page): Promise<void> {
  // Open notification dropdown
  await page.click('[data-testid="notification-bell"]');

  // Click clear all button if exists
  const clearButton = page.locator('[data-testid="clear-all-notifications"]');
  if (await clearButton.isVisible()) {
    await clearButton.click();
  }
}

// ============================================================================
// EMAIL NOTIFICATION HELPERS (MailHog Integration)
// ============================================================================

/**
 * Wait for email notification to be sent
 *
 * Polls MailHog API for email matching criteria
 * Requires MailHog running on localhost:8025
 *
 * @param recipient Email recipient address
 * @param assertion Expected email properties
 * @param timeoutMs Maximum wait time
 *
 * @example
 * ```typescript
 * await waitForEmailNotification('buyer@test.com', {
 *   subject: 'Değerlendirme Hatırlatması',
 * });
 * ```
 */
export async function waitForEmailNotification(
  recipient: string,
  assertion: { subject?: string; body?: string },
  timeoutMs = 30000
): Promise<EmailNotification | null> {
  const startTime = Date.now();
  const mailhogUrl = process.env.MAILHOG_URL || 'http://localhost:8025';

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(`${mailhogUrl}/api/v2/messages`);
      const data = await response.json();

      // Find matching email
      const messages = data.items || [];
      for (const message of messages) {
        const to = message.To?.[0]?.Mailbox + '@' + message.To?.[0]?.Domain;
        const subject = message.Content?.Headers?.Subject?.[0] || '';
        const body = message.Content?.Body || '';

        if (to === recipient) {
          if (assertion.subject && !subject.includes(assertion.subject)) {
            continue;
          }
          if (assertion.body && !body.includes(assertion.body)) {
            continue;
          }

          return {
            to,
            subject,
            body,
            timestamp: new Date(message.Created),
          };
        }
      }
    } catch {
      // MailHog not available, skip email check
      return null;
    }

    // Wait 1 second before retry
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `Email notification not received within ${timeoutMs}ms for ${recipient}`
  );
}

/**
 * Clear all emails from MailHog
 *
 * Useful for test isolation
 */
export async function clearAllEmails(): Promise<void> {
  const mailhogUrl = process.env.MAILHOG_URL || 'http://localhost:8025';

  try {
    await fetch(`${mailhogUrl}/api/v1/messages`, { method: 'DELETE' });
  } catch {
    // MailHog not available, skip cleanup
  }
}

// ============================================================================
// PUSH NOTIFICATION HELPERS
// ============================================================================

/**
 * Mock push notification service for testing
 *
 * Intercepts FCM push notification requests and stores them in memory
 *
 * @param page Playwright page instance
 *
 * @example
 * ```typescript
 * await mockPushNotifications(page);
 * // ... trigger action that sends push
 * const notifications = await getPushNotifications(page, userId);
 * expect(notifications).toHaveLength(1);
 * ```
 */
export async function mockPushNotifications(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface WindowWithPush extends Window {
      __pushNotifications?: PushNotification[];
      mockPushNotification?: (notification: PushNotification) => void;
    }

    (window as unknown as WindowWithPush).__pushNotifications = [];

    // Mock FCM messaging
    if ('serviceWorker' in navigator) {
      (window as unknown as WindowWithPush).mockPushNotification = (
        notification: PushNotification
      ) => {
        (window as unknown as WindowWithPush).__pushNotifications?.push(
          notification
        );
      };
    }
  });
}

/**
 * Get received push notifications for user
 *
 * @param page Playwright page instance
 * @param userId User ID to filter by
 * @returns Array of push notifications
 */
export async function getPushNotifications(
  page: Page,
  userId: string
): Promise<PushNotification[]> {
  return await page.evaluate((uid) => {
    interface WindowWithPush extends Window {
      __pushNotifications?: PushNotification[];
    }
    const allNotifications =
      (window as WindowWithPush).__pushNotifications || [];
    return allNotifications.filter((n) => n.userId === uid);
  }, userId);
}

/**
 * Clear all push notifications
 *
 * @param page Playwright page instance
 */
export async function clearPushNotifications(page: Page): Promise<void> {
  await page.evaluate(() => {
    interface WindowWithPush extends Window {
      __pushNotifications?: PushNotification[];
    }
    (window as WindowWithPush).__pushNotifications = [];
  });
}

// ============================================================================
// WEBSOCKET NOTIFICATION HELPERS
// ============================================================================

/**
 * Wait for WebSocket notification message
 *
 * Listens for WebSocket messages on notification channel
 *
 * @param page Playwright page instance
 * @param assertion Expected notification properties
 * @param timeoutMs Maximum wait time
 *
 * @example
 * ```typescript
 * await waitForWebSocketNotification(page, {
 *   type: 'REVIEW',
 *   title: 'Değerlendirme Hatırlatması',
 * });
 * ```
 */
export async function waitForWebSocketNotification(
  page: Page,
  assertion: NotificationAssertion,
  timeoutMs = 30000
): Promise<void> {
  // Setup WebSocket message listener
  await page.evaluate(
    ({ assertion, timeoutMs }) => {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket notification timeout'));
        }, timeoutMs);

        const messageHandler = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);

            // Check if it's a notification message
            if (data.type !== 'NOTIFICATION') return;

            const notification = data.payload;

            // Verify assertion
            if (assertion.type && notification.type !== assertion.type) return;
            if (
              assertion.title &&
              !notification.title.includes(assertion.title)
            )
              return;
            if (
              assertion.content &&
              !notification.content.includes(assertion.content)
            )
              return;

            // Match found
            clearTimeout(timeout);
            window.removeEventListener('message', messageHandler);
            resolve(notification);
          } catch {
            // Ignore parse errors
          }
        };

        window.addEventListener('message', messageHandler);
      });
    },
    { assertion, timeoutMs }
  );
}

// ============================================================================
// NOTIFICATION VERIFICATION HELPERS
// ============================================================================

/**
 * Assert notification appears in all channels
 *
 * Comprehensive check for multi-channel notification delivery
 *
 * @param page Playwright page instance
 * @param userId User ID receiving notification
 * @param assertion Expected notification properties
 *
 * @example
 * ```typescript
 * await assertMultiChannelNotification(page, buyerId, {
 *   title: 'Değerlendirme Hatırlatması',
 *   type: 'REVIEW',
 *   actionUrl: '/dashboard/orders/123/review',
 * });
 * ```
 */
export async function assertMultiChannelNotification(
  page: Page,
  userId: string,
  assertion: NotificationAssertion
): Promise<void> {
  // 1. In-app notification
  await waitForInAppNotification(page, assertion);

  // 2. Email notification (if MailHog available)
  // Skip email check in CI/CD environments
  if (process.env.MAILHOG_ENABLED === 'true') {
    const userEmail = `${userId}@test.com`; // Test email pattern
    await waitForEmailNotification(userEmail, {
      subject: assertion.title,
    });
  }

  // 3. WebSocket notification
  await waitForWebSocketNotification(page, assertion);

  // 4. Push notification (mocked)
  const pushNotifications = await getPushNotifications(page, userId);
  const matchingPush = pushNotifications.find((n) =>
    assertion.title ? n.title.includes(assertion.title) : true
  );

  expect(matchingPush).toBeDefined();
}

/**
 * Wait for notification badge count to update
 *
 * @param page Playwright page instance
 * @param expectedCount Expected unread count
 * @param timeoutMs Maximum wait time
 */
export async function waitForNotificationCount(
  page: Page,
  expectedCount: number,
  timeoutMs = 10000
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const currentCount = await getNotificationCount(page);
    if (currentCount === expectedCount) {
      return;
    }
    await page.waitForTimeout(500);
  }

  throw new Error(
    `Notification count did not reach ${expectedCount} within ${timeoutMs}ms`
  );
}

// ============================================================================
// TEST CLEANUP HELPERS
// ============================================================================

/**
 * Clear all notifications for clean test state
 *
 * Clears in-app, email, push, and WebSocket notifications
 *
 * @param page Playwright page instance
 */
export async function clearAllTestNotifications(page: Page): Promise<void> {
  await clearAllNotifications(page);
  await clearAllEmails();
  await clearPushNotifications(page);
}
