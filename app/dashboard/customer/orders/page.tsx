/**
 * ================================================
 * CUSTOMER ORDERS PAGE
 * ================================================
 * Customer's order history and management
 *
 * Route: /dashboard/customer/orders
 *
 * Features:
 * - Order list (my purchases)
 * - Filter by status
 * - Order details link
 * - Quick actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 26
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, MessageCircle, Eye, Search } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { orderApi } from '@/lib/api/orders';
import type {
  OrderSummaryResponse,
  OrderStatus,
} from '@/types/backend-aligned';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Load orders
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderApi.getBuyerOrders({
        status: statusFilter === 'ALL' ? undefined : [statusFilter],
        page: currentPage,
        size: 10,
      });
      setOrders(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: OrderStatus) => {
    const colorClass = orderApi.getOrderStatusColor(status);
    const label = orderApi.getOrderStatusLabel(status);
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
      >
        {label}
      </span>
    );
  };

  // Filter orders by search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.sellerName.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
            <p className="mt-2 text-gray-600">
              Satın aldığınız paketleri buradan takip edebilirsiniz
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Sipariş no veya satıcı adı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as OrderStatus | 'ALL');
                setCurrentPage(0);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="ALL">Tüm Siparişler</option>
              <option value="PENDING">Beklemede</option>
              <option value="ACCEPTED">Kabul Edildi</option>
              <option value="IN_PROGRESS">Devam Ediyor</option>
              <option value="DELIVERED">Teslim Edildi</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal Edildi</option>
            </select>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-red-800">{error}</p>
              <Button onClick={loadOrders} className="mt-4" variant="outline">
                Tekrar Dene
              </Button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <p className="text-gray-600">Henüz siparişiniz bulunmuyor</p>
              <Button
                onClick={() => router.push('/marketplace/packages')}
                className="mt-4"
              >
                Paketlere Göz Atın
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <h3 className="mb-1 font-semibold text-gray-900">
                        {orderApi.getOrderTypeLabel(order.type)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Satıcı:{' '}
                        <span className="font-medium">{order.sellerName}</span>
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/orders/${order.id}`)
                        }
                      >
                        <Eye className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Detaylar</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/messages?order=${order.id}`)
                        }
                      >
                        <MessageCircle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Mesaj</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Önceki
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Sayfa {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage === totalPages - 1}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
