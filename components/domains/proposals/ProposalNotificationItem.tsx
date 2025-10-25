/**
 * ================================================
 * PROPOSAL NOTIFICATION COMPONENTS
 * ================================================
 * Components for displaying proposal notifications
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Proposal System Sprint - Day 7-8
 */

'use client';

import React, { memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Bell,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import type {
  ProposalNotificationData,
  ProposalNotificationType,
} from '@/hooks/business/useProposalNotifications';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type: ProposalNotificationType) => {
  switch (type) {
    case 'PROPOSAL_SUBMITTED':
      return <FileText className="h-5 w-5 text-blue-600" />;
    case 'PROPOSAL_VIEWED':
      return <Eye className="h-5 w-5 text-purple-600" />;
    case 'PROPOSAL_ACCEPTED':
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    case 'PROPOSAL_REJECTED':
      return <XCircle className="h-5 w-5 text-red-600" />;
    case 'NEW_PROPOSAL':
      return <Bell className="h-5 w-5 text-blue-600" />;
    case 'PROPOSAL_WITHDRAWN':
      return <AlertCircle className="h-5 w-5 text-gray-600" />;
    case 'PROPOSAL_REMINDER':
      return <DollarSign className="h-5 w-5 text-amber-600" />;
    default:
      return <Bell className="h-5 w-5 text-gray-600" />;
  }
};

/**
 * Get background color for notification type
 */
const getNotificationBgColor = (type: ProposalNotificationType) => {
  switch (type) {
    case 'PROPOSAL_SUBMITTED':
      return 'bg-blue-50';
    case 'PROPOSAL_VIEWED':
      return 'bg-purple-50';
    case 'PROPOSAL_ACCEPTED':
      return 'bg-green-50';
    case 'PROPOSAL_REJECTED':
      return 'bg-red-50';
    case 'NEW_PROPOSAL':
      return 'bg-blue-50';
    case 'PROPOSAL_WITHDRAWN':
      return 'bg-gray-50';
    case 'PROPOSAL_REMINDER':
      return 'bg-amber-50';
    default:
      return 'bg-gray-50';
  }
};

/**
 * Single proposal notification item
 */
interface ProposalNotificationItemProps {
  notification: ProposalNotificationData;
  onClick?: (notification: ProposalNotificationData) => void;
  onMarkAsRead?: (notificationId: string) => void;
  className?: string;
}

export const ProposalNotificationItem = memo<ProposalNotificationItemProps>(
  function ProposalNotificationItem({
    notification,
    onClick,
    onMarkAsRead,
    className = '',
  }) {
    const handleClick = () => {
      if (!notification.read && onMarkAsRead) {
        onMarkAsRead(notification.id);
      }
      if (onClick) {
        onClick(notification);
      }
    };

    const formatBudget = (amount?: number) => {
      if (!amount) return '';
      return `₺${amount.toLocaleString('tr-TR')}`;
    };

    return (
      <div
        className={`flex cursor-pointer items-start space-x-3 rounded-lg border p-4 transition-all hover:shadow-md ${notification.read ? 'border-gray-200 bg-white' : 'border-blue-200 bg-blue-50/50'} ${className} `}
        onClick={handleClick}
      >
        {/* Icon */}
        <div
          className={`flex-shrink-0 rounded-full p-2 ${getNotificationBgColor(notification.type)} `}
        >
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between">
            <h4 className="line-clamp-1 text-sm font-semibold text-gray-900">
              {notification.title}
            </h4>
            {!notification.read && (
              <Badge
                variant="default"
                className="ml-2 flex-shrink-0 bg-blue-600 text-xs text-white"
              >
                Yeni
              </Badge>
            )}
          </div>

          <p className="mb-2 line-clamp-2 text-sm text-gray-700">
            {notification.message}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {notification.jobTitle && (
              <span className="flex items-center">
                <FileText className="mr-1 h-3 w-3" />
                {notification.jobTitle}
              </span>
            )}
            {notification.proposedBudget && (
              <span className="flex items-center">
                <DollarSign className="mr-1 h-3 w-3" />
                {formatBudget(notification.proposedBudget)}
              </span>
            )}
            <span>
              {formatDistanceToNow(notification.createdAt, {
                addSuffix: true,
                locale: tr,
              })}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

ProposalNotificationItem.displayName = 'ProposalNotificationItem';

/**
 * List of proposal notifications
 */
interface ProposalNotificationListProps {
  notifications: ProposalNotificationData[];
  onNotificationClick?: (notification: ProposalNotificationData) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  className?: string;
}

export const ProposalNotificationList = memo<ProposalNotificationListProps>(
  function ProposalNotificationList({
    notifications,
    onNotificationClick,
    onMarkAsRead,
    onMarkAllAsRead,
    className = '',
  }) {
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
      <div className={`flex flex-col ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Teklif Bildirimleri
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600 text-white">
                {unreadCount}
              </Badge>
            )}
          </h3>
          {unreadCount > 0 && onMarkAllAsRead && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-sm text-gray-600">
                Henüz teklif bildirimi yok
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => (
                <ProposalNotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={onNotificationClick}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

ProposalNotificationList.displayName = 'ProposalNotificationList';

/**
 * Badge showing unread proposal notification count
 */
interface ProposalNotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export const ProposalNotificationBadge = memo<ProposalNotificationBadgeProps>(
  function ProposalNotificationBadge({ count, onClick, className = '' }) {
    return (
      <button
        onClick={onClick}
        className={`relative rounded-full p-2 transition-colors hover:bg-gray-100 ${className} `}
        aria-label={`${count} okunmamış bildirim`}
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
    );
  }
);

ProposalNotificationBadge.displayName = 'ProposalNotificationBadge';
