/**
 * ================================================
 * UNIFIED ORDER MANAGEMENT PAGE
 * ================================================
 * Production-ready order management with dual views:
 * - Overview: Dashboard with stats, recent orders, quick actions
 * - All Orders: Complete list with advanced filtering
 *
 * Features:
 * - Tab-based navigation (Overview + All Orders)
 * - Order statistics and analytics
 * - Advanced filtering and search
 * - Real-time updates via WebSocket
 * - Responsive design
 * - Empty states
 *
 * Sprint: Order Management System Consolidation
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created 2025-11-19
 */

'use client';

export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Package2, LayoutGrid, List } from 'lucide-react';
import useSWR from 'swr';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Loading,
} from '@/components/ui';
import {
  OrderListFilters,
  OrderCard,
  OrderCardSkeleton,
  OrderStatsWidget,
  RecentOrdersList,
  OrderQuickActions,
} from '@/components/domains/orders';
import { useWebSocket, useOrderState, useOrderStats } from '@/hooks';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { getMyOrders } from '@/lib/api/orders';
import type { Order } from '@/types/business/features/orders';
import type { OrderStatus } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

type OrderView = 'overview' | 'list';

// ================================================
// COMPONENT
// ================================================

function UnifiedOrderManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  // Determine user role from auth store
  const userRole = user?.role === 'FREELANCER' ? 'seller' : 'buyer';

  // Active tab state
  const initialTab = (searchParams.get('view') as OrderView) || 'overview';
  const [activeView, setActiveView] = useState<OrderView>(initialTab);

  // ================================================
  // HOOKS - Order List State
  // ================================================

  const { state, actions } = useOrderState({ userRole, autoLoad: true });

  // ================================================
  // HOOKS - Overview Stats
  // ================================================

  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useOrderStats({ autoLoad: true, enablePolling: false });

  // Fetch recent orders with SWR for overview
  const {
    data: recentOrdersData,
    isLoading: recentOrdersLoading,
    error: recentOrdersError,
    mutate: refreshRecentOrders,
  } = useSWR(
    activeView === 'overview' ? 'recent-orders' : null,
    async () => {
      const response = await getMyOrders({
        page: 0,
        size: 5,
        sort: 'createdAt,desc',
      });
      return response.data.content;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  ) as {
    data?: Order[];
    isLoading: boolean;
    error?: Error;
    mutate: () => void;
  };

  const recentOrders = recentOrdersData || [];

  // ================================================
  // WEBSOCKET
  // ================================================

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
        // Refresh both list and overview data
        actions.loadOrders();
        actions.loadStats();
        refreshStats();
        refreshRecentOrders();

        // Show notification
        const notificationTexts: Record<string, string> = {
          NEW_ORDER: 'Yeni sipariÅŸ aldÄ±nÄ±z!',
          ORDER_DELIVERED: 'SipariÅŸ teslim edildi!',
          ORDER_ACCEPTED: 'SipariÅŸ kabul edildi!',
          ORDER_STATUS_CHANGED: 'SipariÅŸ durumu gÃ¼ncellendi',
        };

        toast.success(
          notificationTexts[update.type] || 'SipariÅŸ gÃ¼ncellendi',
          {
            description: update.data.orderNumber
              ? `SipariÅŸ #${update.data.orderNumber}`
              : undefined,
            duration: 3000,
          }
        );
      }
    });

    return () => {
      unsubscribe(destination);
    };
  }, [
    isConnected,
    subscribe,
    unsubscribe,
    actions,
    refreshStats,
    refreshRecentOrders,
  ]);

  // ================================================
  // HANDLERS
  // ================================================

  const handleViewChange = useCallback(
    (view: string) => {
      const newView = view as OrderView;
      setActiveView(newView);

      // Update URL without page refresh
      const url = new URL(window.location.href);
      url.searchParams.set('view', newView);
      router.replace(url.pathname + url.search);

      logger.debug('[UnifiedOrders] View changed', { view: newView });
    },
    [router]
  );

  const handleStatClick = useCallback(
    (statType: string) => {
      // Switch to list view with appropriate filter
      const filterMap: Record<string, OrderStatus | 'all'> = {
        totalOrders: 'all',
        completedOrders: 'COMPLETED' as OrderStatus,
        cancelledOrders: 'CANCELLED' as OrderStatus,
        disputedOrders: 'DISPUTED' as OrderStatus,
      };

      const status = filterMap[statType];
      if (status) {
        actions.setSelectedStatus(status);
      }
      setActiveView('list');
    },
    [actions]
  );

  const handleOrderClick = useCallback(
    (orderId: string) => {
      router.push(`/dashboard/orders/${orderId}`);
    },
    [router]
  );

  const handleClearFilters = useCallback(() => {
    actions.clearFilters();
  }, [actions]);

  // ================================================
  // FILTERING & SORTING (for list view)
  // ================================================

  const filteredOrders = state.orders
    .filter((order) => {
      // Status filter
      if (
        state.selectedStatus !== 'all' &&
        order.status !== state.selectedStatus
      ) {
        return false;
      }

      // Search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const orderNumber = (order.orderNumber || order.id).toLowerCase();
        const packageTitle = (order.packageTitle || '').toLowerCase();

        return orderNumber.includes(query) || packageTitle.includes(query);
      }

      return true;
    })
    .sort((a, b) => {
      switch (state.sortBy) {
        case 'latest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'amount_high':
          return b.totalAmount - a.totalAmount;
        case 'amount_low':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">SipariÅŸ YÃ¶netimi</h1>
        <p className="text-muted-foreground">
          {userRole === 'buyer'
            ? 'VerdiÄŸiniz sipariÅŸleri gÃ¶rÃ¼ntÃ¼leyin ve yÃ¶netin'
            : 'AldÄ±ÄŸÄ±nÄ±z sipariÅŸleri gÃ¶rÃ¼ntÃ¼leyin ve yÃ¶netin'}
        </p>
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeView}
        onValueChange={handleViewChange}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span>Genel BakÄ±ÅŸ</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>TÃ¼m SipariÅŸler</span>
          </TabsTrigger>
        </TabsList>

        {/* ================================================ */}
        {/* OVERVIEW TAB */}
        {/* ================================================ */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats */}
          <OrderStatsWidget
            stats={stats}
            isLoading={statsLoading}
            error={statsError}
            showRevenue={userRole === 'seller'}
            onStatClick={handleStatClick}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent Orders (2/3 width) */}
            <div className="lg:col-span-2">
              <RecentOrdersList
                orders={recentOrders}
                isLoading={recentOrdersLoading}
                error={recentOrdersError?.message}
                maxItems={5}
                userRole={userRole}
                showViewAll={true}
                onViewAll={() => setActiveView('list')}
              />
            </div>

            {/* Quick Actions (1/3 width) */}
            <div>
              <OrderQuickActions userRole={userRole} />
            </div>
          </div>
        </TabsContent>

        {/* ================================================ */}
        {/* ALL ORDERS TAB */}
        {/* ================================================ */}
        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <OrderListFilters
            selectedStatus={state.selectedStatus}
            onStatusChange={actions.setSelectedStatus}
            searchQuery={state.searchQuery}
            onSearchChange={actions.setSearchQuery}
            sortBy={state.sortBy}
            onSortChange={actions.setSortBy}
            stats={state.stats}
            isLoading={state.isLoading}
          />

          {/* Content */}
          <div className="space-y-6">
            {/* Loading State */}
            {state.isLoading && (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(3)].map((_, i) => (
                  <OrderCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {!state.isLoading && state.error && (
              <div className="py-12 text-center">
                <p className="text-destructive mb-4">{state.error}</p>
                <Button onClick={actions.loadOrders}>Tekrar Dene</Button>
              </div>
            )}

            {/* Empty State - No Orders */}
            {!state.isLoading && !state.error && state.orders.length === 0 && (
              <div className="py-16 text-center">
                <Package2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                <h3 className="mb-2 text-lg font-semibold">
                  HenÃ¼z sipariÅŸ yok
                </h3>
                <p className="text-muted-foreground mb-6">
                  {userRole === 'buyer'
                    ? 'Bir hizmet satÄ±n alarak ilk sipariÅŸinizi verin'
                    : 'Ä°lk sipariÅŸinizi bekleyiniz'}
                </p>
                {userRole === 'buyer' && (
                  <Button onClick={() => router.push('/marketplace')}>
                    Paketlere GÃ¶z AtÄ±n
                  </Button>
                )}
              </div>
            )}

            {/* Empty State - No Results */}
            {!state.isLoading &&
              !state.error &&
              state.orders.length > 0 &&
              filteredOrders.length === 0 && (
                <div className="py-16 text-center">
                  <Package2 className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                  <h3 className="mb-2 text-lg font-semibold">
                    SonuÃ§ bulunamadÄ±
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    SeÃ§tiÄŸiniz filtrelere uygun sipariÅŸ bulunamadÄ±
                  </p>
                  <Button variant="outline" onClick={handleClearFilters}>
                    Filtreleri Temizle
                  </Button>
                </div>
              )}

            {/* Order List */}
            {!state.isLoading && !state.error && filteredOrders.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    userRole={userRole}
                    onClick={() => handleOrderClick(order.id)}
                  />
                ))}
              </div>
            )}

            {/* Results Count */}
            {!state.isLoading && !state.error && filteredOrders.length > 0 && (
              <div className="text-muted-foreground text-center text-sm">
                {filteredOrders.length} sipariÅŸ gÃ¶steriliyor
                {state.orders.length !== filteredOrders.length &&
                  ` (${state.orders.length} toplam)`}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function UnifiedOrderManagementPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="Yükleniyor..." />}>
      <UnifiedOrderManagementContent />
    </Suspense>
  );
}
