/**
 * ================================================
 * ORDER DASHBOARD OVERVIEW PAGE
 * ================================================
 * Main dashboard for order management
 *
 * Features:
 * - Order statistics summary
 * - Recent orders list
 * - Quick actions
 * - Real-time updates via WebSocket
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  OrderStatsWidget,
  RecentOrdersList,
  OrderQuickActions,
} from '@/components/domains/orders';
import { useOrderStats, useOrders, useWebSocket } from '@/hooks';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

interface OrderDashboardProps {
  /** User role */
  userRole?: 'buyer' | 'seller';
}

// ================================================
// COMPONENT
// ================================================

export default function OrderDashboardPage({
  userRole = 'buyer',
}: OrderDashboardProps) {
  const router = useRouter();

  // ================================================
  // HOOKS
  // ================================================

  // Fetch stats
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useOrderStats({ autoLoad: true, enablePolling: false });

  // Fetch recent orders
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    refresh: refreshOrders,
  } = useOrders({
    autoLoad: true,
    pageSize: 5, // Only fetch last 5
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // WebSocket
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // ================================================
  // WEBSOCKET SUBSCRIPTION
  // ================================================

  useEffect(() => {
    if (!isConnected) return;

    const destination = '/user/queue/orders';
    const _subscriptionId = subscribe(destination, (msg: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = msg as any;
      const update = message.body;

      if (
        update.type === 'ORDER_STATUS_CHANGED' ||
        update.type === 'ORDER_DELIVERED' ||
        update.type === 'ORDER_ACCEPTED' ||
        update.type === 'NEW_ORDER'
      ) {
        // Refresh stats and orders
        refreshStats();
        refreshOrders();

        // Show notification
        const notificationTexts: Record<string, string> = {
          NEW_ORDER: 'Yeni sipariş aldınız!',
          ORDER_DELIVERED: 'Sipariş teslim edildi!',
          ORDER_ACCEPTED: 'Sipariş kabul edildi!',
          ORDER_STATUS_CHANGED: 'Sipariş durumu güncellendi',
        };

        toast.success(notificationTexts[update.type] || 'Sipariş güncellendi', {
          description: update.data.orderNumber
            ? `Sipariş #${update.data.orderNumber}`
            : undefined,
          duration: 3000,
        });
      }
    });

    return () => {
      unsubscribe(destination);
    };
  }, [isConnected, subscribe, unsubscribe, refreshStats, refreshOrders]);

  // ================================================
  // HANDLERS
  // ================================================

  const handleStatClick = (statType: string) => {
    // Navigate to orders page with filter
    const filterMap: Record<string, string> = {
      totalOrders: 'all',
      completedOrders: 'completed',
      cancelledOrders: 'cancelled',
      disputedOrders: 'disputed',
    };

    const status = filterMap[statType] || 'all';
    router.push(`/dashboard/orders?status=${status}`);
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Sipariş Yönetimi</h1>
        <p className="text-muted-foreground">
          {userRole === 'buyer'
            ? 'Verdiğiniz siparişleri görüntüleyin ve yönetin'
            : 'Aldığınız siparişleri görüntüleyin ve yönetin'}
        </p>
      </div>

      {/* Stats */}
      <OrderStatsWidget
        stats={stats}
        isLoading={statsLoading}
        error={statsError}
        showRevenue={userRole === 'seller'}
        onStatClick={handleStatClick}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders (2/3 width) */}
        <div className="lg:col-span-2">
          <RecentOrdersList
            orders={orders}
            isLoading={ordersLoading}
            error={ordersError}
            maxItems={5}
            userRole={userRole}
            showViewAll={true}
          />
        </div>

        {/* Quick Actions (1/3 width) */}
        <div>
          <OrderQuickActions userRole={userRole} />
        </div>
      </div>
    </div>
  );
}
