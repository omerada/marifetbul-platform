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

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Package2 } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  OrderListFilters,
  OrderCard,
  OrderCardSkeleton,
  type OrderStats,
} from '@/components/dashboard/orders';
import { orderApi, unwrapOrderResponse } from '@/lib/api/orders';
import type {
  OrderSummaryResponse,
  OrderStatus,
  OrderStatistics,
  PageResponse,
} from '@/types/backend-aligned';
import { useWebSocket } from '@/hooks';

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
  // STATE
  // ================================================

  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [stats, setStats] = useState<OrderStats | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // WebSocket
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // ================================================
  // DATA FETCHING
  // ================================================

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch orders based on role
      const response =
        userRole === 'buyer'
          ? await orderApi.getBuyerOrders()
          : await orderApi.getSellerOrders();

      // Unwrap and extract orders from paged response
      const unwrapped = unwrapOrderResponse(
        response
      ) as PageResponse<OrderSummaryResponse>;
      const fetchedOrders = unwrapped.content || [];

      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err instanceof Error ? err.message : 'Siparişler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [userRole]);

  const loadStats = useCallback(async () => {
    try {
      const response = await orderApi.getOrderStatistics();
      const statistics = unwrapOrderResponse(response) as OrderStatistics;

      // Calculate counts from statistics
      const statsData: OrderStats = {
        total: statistics.totalOrders || 0,
        active: statistics.activeOrders || 0,
        completed: statistics.completedOrders || 0,
        cancelled: statistics.cancelledOrders || 0,
      };

      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Stats are optional, don't show error
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [loadOrders, loadStats]);

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
        loadOrders();
        loadStats();

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
  }, [isConnected, subscribe, unsubscribe, loadOrders, loadStats]);

  // ================================================
  // FILTERING & SORTING
  // ================================================

  const filteredOrders = orders
    .filter((order) => {
      // Status filter
      if (selectedStatus !== 'all' && order.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const orderNumber = (order.orderNumber || order.id).toLowerCase();
        const packageTitle = (order.packageTitle || '').toLowerCase();

        return orderNumber.includes(query) || packageTitle.includes(query);
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
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
    setSelectedStatus('all');
    setSearchQuery('');
    setSortBy('latest');
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
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          stats={stats}
          isLoading={isLoading}
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="py-12 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadOrders}>Tekrar Dene</Button>
          </div>
        )}

        {/* Empty State - No Orders */}
        {!isLoading && !error && orders.length === 0 && (
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
        {!isLoading &&
          !error &&
          orders.length > 0 &&
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
        {!isLoading && !error && filteredOrders.length > 0 && (
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
        {!isLoading && !error && filteredOrders.length > 0 && (
          <div className="text-muted-foreground text-center text-sm">
            {filteredOrders.length} sipariş gösteriliyor
            {orders.length !== filteredOrders.length &&
              ` (${orders.length} toplam)`}
          </div>
        )}
      </div>
    </div>
  );
}
