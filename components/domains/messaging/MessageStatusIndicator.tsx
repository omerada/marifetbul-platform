'use client';

import { memo } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export type MessageStatus =
  | 'sending' // Message is being sent
  | 'sent' // Message sent to server
  | 'delivered' // Message delivered to recipient
  | 'read' // Message read by recipient
  | 'failed'; // Message failed to send

interface MessageStatusIndicatorProps {
  /** Current message status */
  status: MessageStatus;
  /** Timestamp for the status */
  timestamp?: string;
  /** Show detailed status text */
  showText?: boolean;
  /** Compact mode (icon only) */
  compact?: boolean;
}

/**
 * Get status configuration
 */
function getStatusConfig(status: MessageStatus) {
  switch (status) {
    case 'sending':
      return {
        icon: Clock,
        text: 'Gönderiliyor',
        color: 'text-gray-400',
        animate: true,
      };
    case 'sent':
      return {
        icon: Check,
        text: 'Gönderildi',
        color: 'text-gray-400',
        animate: false,
      };
    case 'delivered':
      return {
        icon: CheckCheck,
        text: 'İletildi',
        color: 'text-gray-400',
        animate: false,
      };
    case 'read':
      return {
        icon: CheckCheck,
        text: 'Okundu',
        color: 'text-blue-500',
        animate: false,
      };
    case 'failed':
      return {
        icon: AlertCircle,
        text: 'Gönderilemedi',
        color: 'text-red-500',
        animate: false,
      };
  }
}

/**
 * MessageStatusIndicator Component
 *
 * Displays message delivery/read status with:
 * - Visual icons (check marks)
 * - Status text
 * - Timestamp
 * - Color coding
 * - Animation for sending state
 */
export const MessageStatusIndicator = memo(function MessageStatusIndicator({
  status,
  timestamp,
  showText = true,
  compact = false,
}: MessageStatusIndicatorProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  // Compact mode: icon only
  if (compact) {
    return (
      <div className="flex items-center">
        <Icon
          className={`h-3.5 w-3.5 ${config.color} ${
            config.animate ? 'animate-pulse' : ''
          }`}
        />
      </div>
    );
  }

  // Full mode: icon + text + timestamp
  return (
    <div className="flex items-center gap-1">
      <Icon
        className={`h-3.5 w-3.5 ${config.color} ${
          config.animate ? 'animate-pulse' : ''
        }`}
      />

      {showText && (
        <span className={`text-xs ${config.color}`}>{config.text}</span>
      )}

      {timestamp && !showText && (
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(timestamp), {
            addSuffix: true,
            locale: tr,
          })}
        </span>
      )}
    </div>
  );
});

/**
 * Helper function to determine message status from Message object
 */
export function getMessageStatus(message: {
  id: string;
  isRead?: boolean;
  readAt?: string;
  sentAt?: string;
}): MessageStatus {
  // Check if message is being sent (temporary ID)
  if (message.id.startsWith('temp-')) {
    return 'sending';
  }

  // Check if message is read
  if (message.isRead || message.readAt) {
    return 'read';
  }

  // Check if message is delivered (has sentAt timestamp)
  if (message.sentAt) {
    return 'delivered';
  }

  // Default: sent
  return 'sent';
}
