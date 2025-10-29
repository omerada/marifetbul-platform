/**
 * ================================================
 * ORDER MESSAGE BADGE
 * ================================================
 * Shows unread message count for an order
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 5: Order Messaging Integration
 */

'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface OrderMessageBadgeProps {
  /** Order ID */
  orderId: string;
  /** Number of unread messages */
  unreadCount: number;
  /** Optional class name */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function OrderMessageBadge({
  orderId: _orderId,
  unreadCount,
  className,
  onClick,
}: OrderMessageBadgeProps) {
  if (unreadCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5',
        'bg-primary/10 text-primary hover:bg-primary/20',
        'transition-colors duration-200',
        'text-xs font-medium',
        className
      )}
      aria-label={`${unreadCount} okunmamış mesaj`}
    >
      <MessageCircle className="h-3.5 w-3.5" />
      <span>{unreadCount}</span>
    </button>
  );
}
