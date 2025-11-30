/**
 * ================================================
 * RECENT ORDERS LIST
 * ================================================
 * Compact list of recent orders for dashboard
 *
 * Features:
 * - Last 5 orders
 * - Compact display
 * - Status badges
 * - Quick actions
 * - Click to navigate
 * - Empty state
 * - Loading skeleton
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
} from 'lucide-react';
import type { Order } from '@/types/business/features/orders';
import {
  getOrderStatusColor,
  getOrderStatusLabel,
} from '@/types/order-helpers';

// ================================================
// TYPES
// ================================================

export interface RecentOrdersListProps {
  /** Orders to display */
  orders: Order[];
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Maximum orders to show */
  maxItems?: number;
  /** User role */
  userRole?: 'buyer' | 'seller';
  /** Show "View All" link */
  showViewAll?: boolean;
  /** Callback when "View All" is clicked */
  onViewAll?: () => void;
}

// ================================================
// SUB-COMPONENTS
// ================================================

function OrderListItem({
  order,
  userRole,
}: {
  order: Order;
  userRole?: 'buyer' | 'seller';
}) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  const otherUser = userRole === 'buyer' ? order.seller : order.buyer;
  const otherUserName = otherUser
    ? `${otherUser.firstName} ${otherUser.lastName}`
    : 'Kullanıcı';

  return (
    <div
      onClick={handleClick}
      className="group flex cursor-pointer items-center gap-3 border-b border-gray-100 p-4 transition-colors last:border-0 hover:bg-gray-50"
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">
        {order.status === 'completed' && (
          <CheckCircle className="h-8 w-8 text-green-600" />
        )}
        {(order.status === 'active' || order.status === 'in_progress') && (
          <Package className="h-8 w-8 text-blue-600" />
        )}
        {order.status === 'pending' && (
          <Clock className="h-8 w-8 text-yellow-600" />
        )}
        {(order.status === 'cancelled' || order.status === 'disputed') && (
          <AlertCircle className="h-8 w-8 text-red-600" />
        )}
      </div>

      {/* Order Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-medium text-gray-900">
            {order.customOrderDetails?.title || `Sipariş #${order.orderNumber}`}
          </p>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getOrderStatusColor(
              order.status
            )}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {otherUserName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
          </span>
        </div>
      </div>

      {/* Amount & Arrow */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="font-semibold text-gray-900">
            {order.totalAmount} {order.currency}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

export function RecentOrdersList({
  orders,
  isLoading = false,
  error = null,
  maxItems = 5,
  userRole = 'buyer',
  showViewAll = false,
  onViewAll,
}: RecentOrdersListProps) {
  const router = useRouter();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push('/dashboard/orders');
    }
  };

  // ================================================
  // LOADING STATE
  // ================================================

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Son Siparişler</h3>
        </div>
        <LoadingSkeleton />
      </Card>
    );
  }

  // ================================================
  // ERROR STATE
  // ================================================

  if (error) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Son Siparişler</h3>
        </div>
        <div className="p-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-12 w-12 text-red-600" />
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  // ================================================
  // EMPTY STATE
  // ================================================

  if (!orders || orders.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900">Son Siparişler</h3>
        </div>
        <div className="p-8 text-center">
          <Package className="text-muted-foreground mx-auto mb-2 h-12 w-12" />
          <p className="text-muted-foreground mb-4">Henüz sipariş yok</p>
          {userRole === 'buyer' && (
            <Button onClick={() => router.push('/marketplace')}>
              Paketlere Göz Atın
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // ================================================
  // SLICE ORDERS
  // ================================================

  const displayOrders = orders.slice(0, maxItems);

  // ================================================
  // RENDER
  // ================================================

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 p-4">
        <h3 className="font-semibold text-gray-900">Son Siparişler</h3>
        {showViewAll && orders.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Tümünü Gör
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Order List */}
      <div className="divide-y divide-gray-100">
        {displayOrders.map((order) => (
          <OrderListItem key={order.id} order={order} userRole={userRole} />
        ))}
      </div>

      {/* Footer */}
      {orders.length > maxItems && (
        <div className="border-t border-gray-100 bg-gray-50 p-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            +{orders.length - maxItems} sipariş daha
          </Button>
        </div>
      )}
    </Card>
  );
}
