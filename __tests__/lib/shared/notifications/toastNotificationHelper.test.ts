/**
 * Unit tests for Toast Notification Helper
 * Tests notification type mapping, priority handling, and toast display logic
 */

import {
  getNotificationToastIcon,
  getNotificationToastVariant,
  getNotificationToastDuration,
} from '../../../../lib/shared/notifications/toastNotificationHelper';

describe('toastNotificationHelper', () => {
  describe('getNotificationToastIcon', () => {
    test('returns correct icon for ORDER_CONFIRMED', () => {
      expect(getNotificationToastIcon('ORDER_CONFIRMED')).toBe('✅');
    });

    test('returns correct icon for PAYMENT_RECEIVED', () => {
      expect(getNotificationToastIcon('PAYMENT_RECEIVED')).toBe('💰');
    });

    test('returns correct icon for MESSAGE_RECEIVED', () => {
      expect(getNotificationToastIcon('MESSAGE_RECEIVED')).toBe('💬');
    });

    test('returns correct icon for NEW_REVIEW', () => {
      expect(getNotificationToastIcon('NEW_REVIEW')).toBe('⭐');
    });

    test('returns default icon for SYSTEM type', () => {
      expect(getNotificationToastIcon('SYSTEM')).toBe('🔔');
    });

    test('returns default icon for NEW_FOLLOWER', () => {
      expect(getNotificationToastIcon('NEW_FOLLOWER')).toBe('👤');
    });
  });

  describe('getNotificationToastVariant', () => {
    test('returns success for ORDER_CONFIRMED', () => {
      expect(getNotificationToastVariant('ORDER_CONFIRMED')).toBe('success');
    });

    test('returns error for PAYMENT_FAILED', () => {
      expect(getNotificationToastVariant('PAYMENT_FAILED')).toBe('error');
    });

    test('returns error for ORDER_CANCELLED', () => {
      expect(getNotificationToastVariant('ORDER_CANCELLED')).toBe('error');
    });

    test('returns warning for ORDER_DISPUTED', () => {
      expect(getNotificationToastVariant('ORDER_DISPUTED')).toBe('warning');
    });

    test('returns info for MESSAGE_RECEIVED', () => {
      expect(getNotificationToastVariant('MESSAGE_RECEIVED')).toBe('info');
    });

    test('returns success for PAYMENT_RECEIVED', () => {
      expect(getNotificationToastVariant('PAYMENT_RECEIVED')).toBe('success');
    });
  });

  describe('getNotificationToastDuration', () => {
    test('returns 8000ms for urgent priority', () => {
      expect(getNotificationToastDuration('urgent')).toBe(8000);
    });

    test('returns 8000ms for high priority', () => {
      expect(getNotificationToastDuration('high')).toBe(8000);
    });

    test('returns 5000ms for medium priority', () => {
      expect(getNotificationToastDuration('medium')).toBe(5000);
    });

    test('returns 4000ms for low priority', () => {
      expect(getNotificationToastDuration('low')).toBe(4000);
    });

    test('returns 5000ms for default when no priority', () => {
      expect(getNotificationToastDuration('')).toBe(5000);
    });
  });
});
