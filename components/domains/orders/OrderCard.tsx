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
import type {
  OrderResponse as Order,
  OrderSummaryResponse as OrderSummary,
} from '@/types/backend-aligned';
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
  // Type-safe property access using type assertions
  type OrderWithExtras = typeof order & {
    packageTitle?: string;
    packageDetails?: { packageTitle?: string; tier?: string };
    customOrderDetails?: { title?: string };
    seller?: { username?: string; name?: string };
    buyer?: { username?: string; name?: string };
    sellerName?: string;
    buyerName?: string;
    financials?: { total?: number; currency?: string };
    amount?: number;
    totalAmount?: number;
    updatedAt?: string;
    orderedAt?: string;
  };

  const orderData = order as OrderWithExtras;

  const packageTitle =
    orderData.packageTitle ||
    orderData.packageDetails?.packageTitle ||
    orderData.customOrderDetails?.title ||
    'Özel Sipariş';

  const sellerName =
    orderData.sellerName ||
    orderData.seller?.username ||
    orderData.seller?.name ||
    'Satıcı';

  const buyerName =
    orderData.buyerName ||
    orderData.buyer?.username ||
    orderData.buyer?.name ||
    'Alıcı';

  const otherUserInfo =
    userRole === 'buyer'
      ? { name: sellerName, role: 'Satıcı' }
      : { name: buyerName, role: 'Alıcı' };

  const lastUpdate =
    orderData.updatedAt || orderData.orderedAt
      ? formatDistanceToNow(
          new Date(orderData.updatedAt || orderData.orderedAt!),
          {
            addSuffix: true,
            locale: tr,
          }
        )
      : null;

  // Extract financials safely
  const totalAmount =
    orderData.totalAmount ??
    orderData.financials?.total ??
    orderData.amount ??
    0;

  const currency =
    orderData.currency ?? orderData.financials?.currency ?? 'TRY';

  const tier = orderData.packageDetails?.tier;

  return (
    <div
      className={cn(
        'bg-card rounded-lg border p-4 transition-all sm:p-6',
        'hover:border-primary/20 hover:shadow-md',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold sm:text-base">
                {packageTitle}
              </h3>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              #{order.orderNumber || order.id.slice(0, 8)}
            </p>
          </div>
          <span
            className={cn(
              'self-start rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap sm:px-3',
              getStatusColor(order.status)
            )}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>

        {/* Info Grid - Mobile optimized */}
        <div className="space-y-2 text-sm sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
          {/* User Info */}
          <div className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4 shrink-0" />
            <span className="truncate text-xs sm:text-sm">
              {otherUserInfo.name}
              <span className="ml-1 text-xs opacity-75">
                ({otherUserInfo.role})
              </span>
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center gap-2 font-medium">
            <DollarSign className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">
              {totalAmount.toFixed(2)} {currency}
            </span>
          </div>

          {/* Deadline */}
          {order.deadline && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs sm:text-sm">
                {new Date(order.deadline).toLocaleDateString('tr-TR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {/* Package Tier */}
          {tier && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate text-xs capitalize sm:text-sm">
                {tier.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        {/* Footer - Mobile stacked */}
        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <div className="text-muted-foreground order-2 flex items-center gap-2 text-xs sm:order-1">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{lastUpdate || 'Bilinmiyor'}</span>
          </div>

          <Link
            href={`/dashboard/orders/${order.id}`}
            onClick={(e) => e.stopPropagation()}
            className="order-1 sm:order-2"
          >
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
    <div className="bg-card animate-pulse rounded-lg border p-4 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-5 w-3/4 rounded" />
            <div className="bg-muted h-4 w-1/4 rounded" />
          </div>
          <div className="bg-muted h-6 w-20 rounded-full" />
        </div>

        {/* Info Grid */}
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-muted h-4 w-4 rounded" />
              <div className="bg-muted h-4 flex-1 rounded" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <div className="bg-muted order-2 h-4 w-24 rounded sm:order-1" />
          <div className="bg-muted order-1 h-9 w-full rounded sm:order-2 sm:w-28" />
        </div>
      </div>
    </div>
  );
}

OrderCard.displayName = 'OrderCard';
