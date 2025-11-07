/**
 * ================================================
 * NOTIFICATION HELPERS
 * ================================================
 * Centralized utility functions for notification display
 * Prevents duplicate icon/badge logic across components
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 8 - Story 6: Notification Center
 */

import {
  Bell,
  AlertCircle,
  DollarSign,
  FileText,
  MessageCircle,
  Package,
  UserPlus,
  Heart,
  Star,
  Zap,
  Eye,
} from 'lucide-react';

export type BadgeVariant = 'success' | 'destructive' | 'default' | 'secondary';

/**
 * Get icon component for notification type
 */
export function getNotificationIcon(type: string) {
  const iconClasses = 'h-4 w-4';

  if (type.includes('payment'))
    return <DollarSign className={`${iconClasses} text-green-600`} />;
  if (type.includes('escrow'))
    return <DollarSign className={`${iconClasses} text-green-600`} />;
  if (type.includes('refund'))
    return <DollarSign className={`${iconClasses} text-orange-600`} />;
  if (type.includes('invoice'))
    return <FileText className={`${iconClasses} text-blue-600`} />;
  if (type.includes('proposal'))
    return <MessageCircle className={`${iconClasses} text-blue-600`} />;
  if (type.includes('message'))
    return <MessageCircle className={`${iconClasses} text-blue-600`} />;
  if (type.includes('order'))
    return <Package className={`${iconClasses} text-blue-600`} />;
  if (type.includes('service'))
    return <Package className={`${iconClasses} text-green-600`} />;
  if (type.includes('review'))
    return <Star className={`${iconClasses} text-yellow-600`} />;
  if (type.includes('rating'))
    return <Star className={`${iconClasses} text-yellow-600`} />;
  if (type.includes('follow'))
    return <UserPlus className={`${iconClasses} text-blue-600`} />;
  if (type.includes('favorite'))
    return <Heart className={`${iconClasses} text-red-600`} />;
  if (type.includes('promotion'))
    return <Zap className={`${iconClasses} text-purple-600`} />;
  if (type.includes('system'))
    return <Bell className={`${iconClasses} text-gray-600`} />;
  if (type.includes('security'))
    return <AlertCircle className={`${iconClasses} text-red-600`} />;
  if (type.includes('profile'))
    return <Eye className={`${iconClasses} text-blue-600`} />;

  return <Bell className={`${iconClasses} text-gray-600`} />;
}

/**
 * Get badge label for notification type
 */
export function getNotificationBadge(type: string): string {
  if (
    type.includes('payment') ||
    type.includes('escrow') ||
    type.includes('refund')
  ) {
    return 'Ödeme';
  }
  if (type.includes('order') || type.includes('service')) {
    return 'Sipariş';
  }
  if (type.includes('message') || type.includes('proposal')) {
    return 'Mesaj';
  }
  if (type.includes('review') || type.includes('rating')) {
    return 'Değerlendirme';
  }
  return 'Sistem';
}

/**
 * Get badge variant (color) for notification type
 */
export function getBadgeVariant(type: string): BadgeVariant {
  if (type.includes('payment') || type.includes('escrow')) {
    return 'success';
  }
  if (
    type.includes('failed') ||
    type.includes('rejected') ||
    type.includes('cancelled')
  ) {
    return 'destructive';
  }
  if (type.includes('order') || type.includes('proposal')) {
    return 'default';
  }
  return 'secondary';
}

/**
 * Format timestamp as relative time (e.g., "2dk önce", "3sa önce")
 */
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Şimdi';
  if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}sa önce`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}g önce`;

  return time.toLocaleDateString('tr-TR');
}

/**
 * Get notification type filter categories
 */
export const NOTIFICATION_FILTERS = {
  all: { label: 'Tümü', matcher: () => true },
  unread: {
    label: 'Okunmamış',
    matcher: (n: { isRead: boolean }) => !n.isRead,
  },
  payment: {
    label: 'Ödeme',
    matcher: (n: { type: string }) =>
      n.type.includes('payment') ||
      n.type.includes('escrow') ||
      n.type.includes('refund'),
  },
  order: {
    label: 'Sipariş',
    matcher: (n: { type: string }) =>
      n.type.includes('order') || n.type.includes('service'),
  },
  message: {
    label: 'Mesaj',
    matcher: (n: { type: string }) =>
      n.type.includes('message') || n.type.includes('proposal'),
  },
} as const;

export type NotificationFilterType = keyof typeof NOTIFICATION_FILTERS;
