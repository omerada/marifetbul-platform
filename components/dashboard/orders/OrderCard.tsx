/**
 * ================================================
 * ORDER CARD COMPONENT
 * ================================================
 * Card component for displaying order summary in list view
 *
 * Features:
 * - Order information display
 * - Status badge
 * - User info (buyer/seller based on role)
 * - Quick actions
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import Link from 'next/link';
import { Calendar, Clock, DollarSign, Package, User } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Order, OrderSummary } from '@/lib/api/validators/order';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ================================================
// TYPES
// ================================================

export interface OrderCardProps {
  /** Order data */
  order: Order | OrderSummary;
  /** User role */
  userRole: 'buyer' | 'seller';
  /** Click handler */
  onClick?: () => void;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function getStatusColor(
  status: Order['status'] | OrderSummary['status']
): string {
  const colors: Record<Order['status'], string> = {
    PENDING_PAYMENT:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    PAID: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    IN_PROGRESS:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    DELIVERED:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    COMPLETED:
      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    CANCELED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    REFUNDED:
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
    DISPUTED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    IN_REVIEW:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  };

  return colors[status] || colors.PENDING_PAYMENT;
}

function getStatusLabel(
  status: Order['status'] | OrderSummary['status']
): string {
  const labels: Record<Order['status'], string> = {
    PENDING_PAYMENT: 'Ödeme Bekliyor',
    PAID: 'Ödendi',
    IN_PROGRESS: 'Devam Ediyor',
    DELIVERED: 'Teslim Edildi',
    COMPLETED: 'Tamamlandı',
    CANCELED: 'İptal Edildi',
    REFUNDED: 'İade Edildi',
    DISPUTED: 'İhtilafta',
    IN_REVIEW: 'İncelemede',
  };

  return labels[status] || status;
}

// ================================================
// COMPONENT
// ================================================

export function OrderCard({ order, userRole, onClick }: OrderCardProps) {
  const packageTitle = order.packageDetails?.packageTitle || 'Özel Sipariş';

  const otherUserInfo =
    userRole === 'buyer'
      ? { name: order.seller?.username || 'Satıcı', role: 'Satıcı' }
      : { name: order.buyer?.username || 'Alıcı', role: 'Alıcı' };

  const lastUpdate = order.updatedAt
    ? formatDistanceToNow(new Date(order.updatedAt), {
        addSuffix: true,
        locale: tr,
      })
    : null;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-6 transition-all',
        'hover:border-primary/20 hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-1 text-base font-semibold">
                {packageTitle}
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              #{order.orderNumber || order.id.slice(0, 8)}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap',
              getStatusColor(order.status)
            )}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {/* User Info */}
          <div className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {otherUserInfo.name}
              <span className="ml-1 text-xs">({otherUserInfo.role})</span>
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2 font-medium">
            <DollarSign className="text-muted-foreground h-4 w-4 shrink-0" />
            <span>
              {order.financials.total.toFixed(2)} {order.financials.currency}
            </span>
          </div>

          {/* Deadline */}
          {order.deadline && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {new Date(order.deadline).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Package Tier */}
          {order.packageDetails?.tier && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate capitalize">
                {order.packageDetails.tier.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <Clock className="h-3.5 w-3.5" />
            <span>{lastUpdate || 'Bilinmiyor'}</span>
          </div>

          <Link
            href={`/dashboard/orders/${order.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm">
              Detayları Gör
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton for OrderCard
 */
export function OrderCardSkeleton() {
  return (
    <div className="bg-card animate-pulse rounded-lg border p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-3/4 rounded" />
            <div className="bg-muted h-4 w-1/4 rounded" />
          </div>
          <div className="bg-muted h-6 w-20 rounded-full" />
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-muted h-4 w-4 rounded" />
              <div className="bg-muted h-4 flex-1 rounded" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="bg-muted h-4 w-24 rounded" />
          <div className="bg-muted h-9 w-28 rounded" />
        </div>
      </div>
    </div>
  );
}
