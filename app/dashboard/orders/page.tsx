/**
 * ================================================
 * UNIFIED ORDER LIST PAGE
 * ================================================
 * Consolidated order list page for all users
 *
 * Features:
 * - Status-based filtering with tabs
 * - Search by order number
 * - Sort options
 * - Order statistics badges
 * - Real-time updates via WebSocket
 * - Pagination
 * - Empty states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 8: Order List Pages Improvement
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  OrderListFilters,
  OrderCard,
  OrderCardSkeleton,
} from '@/components/dashboard/orders';
import { useWebSocket, useOrderState } from '@/hooks';

// ================================================
// TYPES
// ================================================

interface OrderListPageProps {
  /** User role */
  userRole: 'buyer' | 'seller';
}

// ================================================
// COMPONENT
// ================================================

export default function OrderListPage({ userRole }: OrderListPageProps) {
  const router = useRouter();

  // ================================================
  // STATE - Using custom hook
  // ================================================

  const { state, actions } = useOrderState({ userRole, autoLoad: true });

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
        update.type === 'ORDER_ACCEPTED'
      ) {
        // Refresh order list
        actions.loadOrders();
        actions.loadStats();

        // Show notification
        const notificationTexts: Record<string, string> = {
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
  }, [isConnected, subscribe, unsubscribe, actions]);

  // ================================================
  // FILTERING & SORTING
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
  // HANDLERS
  // ================================================

  const handleOrderClick = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

  const handleClearFilters = () => {
    actions.clearFilters();
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Siparişlerim</h1>
        <p className="text-muted-foreground">
          {userRole === 'buyer'
            ? 'Verdiğiniz siparişleri görüntüleyin ve yönetin'
            : 'Aldığınız siparişleri görüntüleyin ve yönetin'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
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
      </div>

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
            <h3 className="mb-2 text-lg font-semibold">Henüz sipariş yok</h3>
            <p className="text-muted-foreground mb-6">
              {userRole === 'buyer'
                ? 'Bir hizmet satın alarak ilk siparişinizi verin'
                : 'İlk siparişinizi bekleyiniz'}
            </p>
            {userRole === 'buyer' && (
              <Button onClick={() => router.push('/marketplace')}>
                Paketlere Göz Atın
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
              <h3 className="mb-2 text-lg font-semibold">Sonuç bulunamadı</h3>
              <p className="text-muted-foreground mb-6">
                Seçtiğiniz filtrelere uygun sipariş bulunamadı
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
            {filteredOrders.length} sipariş gösteriliyor
            {state.orders.length !== filteredOrders.length &&
              ` (${state.orders.length} toplam)`}
          </div>
        )}
      </div>
    </div>
  );
}
