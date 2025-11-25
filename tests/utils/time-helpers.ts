/**
 * ================================================
 * TIME MANIPULATION UTILITIES FOR E2E TESTS
 * ================================================
 * Sprint: Review System E2E Test Coverage
 * Story 1: Test Infrastructure Setup
 *
 * Utilities for manipulating system time in Playwright tests
 * to test time-dependent features like:
 * - Review reminders (3/7/14 days)
 * - Auto-acceptance countdowns (72 hours)
 * - Order auto-completion (7 days + 24h warning)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since November 25, 2025
 */

import { Page } from '@playwright/test';

// ============================================================================
// TYPES
// ============================================================================

export interface TimeConfig {
  /** Target date to set system time to */
  date: Date;
  /** Whether to freeze time or allow normal progression */
  freeze?: boolean;
}

export interface TimeTravelOptions {
  /** Number of days to advance */
  days?: number;
  /** Number of hours to advance */
  hours?: number;
  /** Number of minutes to advance */
  minutes?: number;
  /** Whether to freeze time at target */
  freeze?: boolean;
}

// ============================================================================
// CORE TIME MANIPULATION
// ============================================================================

/**
 * Set system time to specific date/time
 *
 * This overrides Date constructor and Date.now() to return fixed time
 * Useful for testing scheduled jobs and time-based workflows
 *
 * @param page Playwright page instance
 * @param targetDate Target date to set
 * @param freeze Whether to freeze time (default: true)
 *
 * @example
 * ```typescript
 * // Set time to 3 days from now
 * const futureDate = new Date();
 * futureDate.setDate(futureDate.getDate() + 3);
 * await setSystemTime(page, futureDate);
 * ```
 */
export async function setSystemTime(
  page: Page,
  targetDate: Date,
  freeze = true
): Promise<void> {
  const timestamp = targetDate.getTime();

  await page.addInitScript(
    ({ timestamp, freeze }) => {
      const originalDate = Date;
      const startTime = timestamp;
      const initTime = originalDate.now();

      interface WindowWithMockTime extends Window {
        Date: typeof Date;
        __originalDate?: typeof Date;
        __mockTime?: number;
      }

      // Override Date constructor
      (window as WindowWithMockTime).Date = class extends originalDate {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(
              freeze ? startTime : startTime + (originalDate.now() - initTime)
            );
          } else {
            super(...(args as ConstructorParameters<typeof Date>));
          }
        }

        static override now() {
          return freeze
            ? startTime
            : startTime + (originalDate.now() - initTime);
        }
      } as typeof Date;

      // Store original Date for debugging
      (window as WindowWithMockTime).__originalDate = originalDate;
      (window as WindowWithMockTime).__mockTime = startTime;
    },
    { timestamp, freeze }
  );
}

/**
 * Advance system time by specified duration
 *
 * Convenient wrapper around setSystemTime for relative time travel
 *
 * @param page Playwright page instance
 * @param options Time travel options (days, hours, minutes)
 *
 * @example
 * ```typescript
 * // Test 3-day reminder
 * await advanceTime(page, { days: 3 });
 *
 * // Test 24-hour warning
 * await advanceTime(page, { hours: 24 });
 *
 * // Test 72-hour + 30 min countdown
 * await advanceTime(page, { hours: 72, minutes: 30 });
 * ```
 */
export async function advanceTime(
  page: Page,
  options: TimeTravelOptions
): Promise<void> {
  const { days = 0, hours = 0, minutes = 0, freeze = true } = options;

  const currentDate = new Date();
  const targetDate = new Date(currentDate);

  if (days) targetDate.setDate(targetDate.getDate() + days);
  if (hours) targetDate.setHours(targetDate.getHours() + hours);
  if (minutes) targetDate.setMinutes(targetDate.getMinutes() + minutes);

  await setSystemTime(page, targetDate, freeze);
}

/**
 * Reset system time to real time
 *
 * Removes time mocking and restores normal Date behavior
 *
 * @param page Playwright page instance
 */
export async function resetSystemTime(page: Page): Promise<void> {
  await page.addInitScript(() => {
    interface WindowWithMockTime extends Window {
      Date: typeof Date;
      __originalDate?: typeof Date;
      __mockTime?: number;
    }

    const win = window as WindowWithMockTime;
    if (win.__originalDate) {
      win.Date = win.__originalDate as typeof Date;
      delete win.__mockTime;
      delete win.__originalDate;
    }
  });
}

/**
 * Get current mocked time (if any)
 *
 * Returns null if time is not mocked
 *
 * @param page Playwright page instance
 * @returns Current mocked timestamp or null
 */
export async function getCurrentMockTime(page: Page): Promise<number | null> {
  return await page.evaluate(() => {
    interface WindowWithMockTime extends Window {
      __mockTime?: number;
    }
    return (window as WindowWithMockTime).__mockTime || null;
  });
}

// ============================================================================
// SCHEDULER TESTING HELPERS
// ============================================================================

/**
 * Simulate scheduler execution at specific time
 *
 * Useful for testing scheduled jobs that run at specific times
 *
 * @param page Playwright page instance
 * @param schedulerTime Target time for scheduler (e.g., "10:00 AM")
 *
 * @example
 * ```typescript
 * // Test review reminder scheduler (runs at 10 AM daily)
 * await simulateSchedulerTime(page, { hour: 10, minute: 0 });
 * await triggerScheduler(page, '/api/v1/admin/schedulers/review-reminder/trigger');
 * ```
 */
export async function simulateSchedulerTime(
  page: Page,
  schedulerTime: { hour: number; minute: number; second?: number }
): Promise<void> {
  const targetDate = new Date();
  targetDate.setHours(
    schedulerTime.hour,
    schedulerTime.minute,
    schedulerTime.second || 0,
    0
  );

  await setSystemTime(page, targetDate, true);
}

/**
 * Trigger a scheduler job manually via API
 *
 * Most schedulers have manual trigger endpoints for testing
 *
 * @param page Playwright page instance
 * @param triggerEndpoint API endpoint to trigger scheduler
 *
 * @example
 * ```typescript
 * await triggerScheduler(page, '/api/v1/admin/schedulers/review-reminder/trigger');
 * ```
 */
export async function triggerScheduler(
  page: Page,
  triggerEndpoint: string
): Promise<{
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
}> {
  const response = await page.request.post(triggerEndpoint);
  return await response.json();
}

// ============================================================================
// COUNTDOWN TESTING HELPERS
// ============================================================================

/**
 * Fast-forward to countdown threshold
 *
 * Useful for testing auto-acceptance/auto-completion countdowns
 *
 * @param page Playwright page instance
 * @param thresholdHours Hours until auto-action (e.g., 72 for milestone)
 * @param offsetMinutes Minutes before/after threshold (negative = before)
 *
 * @example
 * ```typescript
 * // Test 5 minutes before 72-hour auto-acceptance
 * await fastForwardToCountdown(page, 72, -5);
 *
 * // Test 1 minute after threshold
 * await fastForwardToCountdown(page, 72, 1);
 * ```
 */
export async function fastForwardToCountdown(
  page: Page,
  thresholdHours: number,
  offsetMinutes = 0
): Promise<void> {
  const totalMinutes = thresholdHours * 60 + offsetMinutes;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  await advanceTime(page, { hours: totalHours, minutes: remainingMinutes });
}

// ============================================================================
// DATE FORMATTING HELPERS
// ============================================================================

/**
 * Format date for Turkish locale (matches backend format)
 *
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatTestDate(date: Date): string {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calculate days between two dates
 *
 * @param start Start date
 * @param end End date
 * @returns Number of days between dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** Review reminder schedule (days after order completion) */
export const REVIEW_REMINDER_SCHEDULE = {
  FIRST: 3,
  SECOND: 7,
  FINAL: 14,
} as const;

/** Milestone auto-acceptance threshold (hours) */
export const MILESTONE_AUTO_ACCEPT_HOURS = 72;

/** Order auto-completion threshold (days) */
export const ORDER_AUTO_COMPLETE_DAYS = 7;

/** Order auto-completion warning (hours before) */
export const ORDER_WARNING_HOURS = 24;

/** Proposal reminder schedule (hours) */
export const PROPOSAL_REMINDER_HOURS = {
  FIRST: 24,
  SECOND: 48,
  FINAL: 72,
} as const;
