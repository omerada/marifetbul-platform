/**
 * ================================================
 * ADMIN DISPUTE ORDERS PAGE
 * ================================================
 * Admin page for viewing and resolving disputed orders
 *
 * Features:
 * - List of disputed orders
 * - Filter & search
 * - DisputeResolutionPanel integration
 * - Resolution history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1.2: Dispute Resolution UI
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Scale, Search, Filter } from 'lucide-react';
import { DisputeResolutionPanel } from '@/components/domains/admin/orders';
import {
  orderApi,
  enrichOrder,
  unwrapOrderResponse,
  type OrderWithComputed,
} from '@/lib/api/orders';
import type {
  OrderSummaryResponse,
  PageResponse,
} from '@/types/backend-aligned';
import { toast } from 'sonner';

export default function AdminDisputeOrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithComputed | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResolutionPanel, setShowResolutionPanel] = useState(false);

  // Load disputed orders
  const loadDisputedOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await orderApi.getDisputedOrders();
      const data = unwrapOrderResponse(
        response
      ) as PageResponse<OrderSummaryResponse>;
      setOrders(data.content || []);
    } catch (err) {
      logger.error(
        'Failed to load disputed orders',
        err instanceof Error ? err : new Error(String(err)),
        { component: 'AdminDisputeOrdersPage', action: 'loadDisputedOrders' }
      );
      setError(
        err instanceof Error
          ? err.message
          : 'Anlaşmazlık siparişleri yüklenemedi'
      );
      toast.error('Hata', {
        description: 'Anlaşmazlık siparişleri yüklenemedi',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputedOrders();
  }, [loadDisputedOrders]);

  // Handle order selection
  const handleOrderSelect = async (orderId: string) => {
    try {
      setIsLoading(true);
      const response = await orderApi.getOrder(orderId);
      const data = unwrapOrderResponse(response);
      const enrichedOrder = enrichOrder(data);

      setSelectedOrder(enrichedOrder);
      setShowResolutionPanel(true);
    } catch (_err) {
      toast.error('Hata', {
        description: 'Sipariş detayları yüklenemedi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resolution success
  const handleResolutionSuccess = (updatedOrder: OrderWithComputed) => {
    // Remove from disputed list
    setOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
    setShowResolutionPanel(false);
    setSelectedOrder(null);

    toast.success('Başarılı', {
      description: 'Anlaşmazlık çözümlendi ve taraflar bilgilendirildi',
    });
  };

  // Render order list item
  const renderOrderItem = (order: OrderSummaryResponse) => (
    <div
      key={order.id}
      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors hover:border-amber-300 hover:bg-amber-50"
      onClick={() => handleOrderSelect(order.id)}
    >
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            #{order.orderNumber}
          </span>
          <Badge variant="destructive">Anlaşmazlık</Badge>
        </div>
        <div className="text-sm text-gray-600">
          <p>Alıcı: {order.buyerName}</p>
          <p>Satıcı: {order.sellerName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold text-gray-900">
          {order.totalAmount.toFixed(2)} {order.currency}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleDateString('tr-TR')}
        </p>
      </div>
    </div>
  );

  // Loading state
  if (isLoading && !selectedOrder) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  // Error state
  if (error && orders.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Hata Oluştu</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Button onClick={loadDisputedOrders}>Tekrar Dene</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 flex items-center text-3xl font-bold">
              <Scale className="mr-3 h-8 w-8 text-amber-600" />
              Anlaşmazlık Yönetimi
            </h1>
            <p className="text-gray-600">
              Sipariş anlaşmazlıklarını inceleyin ve çözüme kavuşturun
            </p>
          </div>
          <Button variant="outline" onClick={loadDisputedOrders}>
            <Search className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Bekleyen Anlaşmazlıklar
                </p>
                <p className="mt-2 text-3xl font-bold text-amber-600">
                  {orders.length}
                </p>
              </div>
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Tutar
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}{' '}
                  TL
                </p>
              </div>
              <Scale className="h-12 w-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ortalama Sipariş
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {orders.length > 0
                    ? (
                        orders.reduce((sum, o) => sum + o.totalAmount, 0) /
                        orders.length
                      ).toFixed(2)
                    : '0.00'}{' '}
                  TL
                </p>
              </div>
              <Filter className="h-12 w-12 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Anlaşmazlık Listesi</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Scale className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">
                    Bekleyen anlaşmazlık yok
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Tüm siparişler sorunsuz ilerliyor 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-3">{orders.map(renderOrderItem)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resolution Panel */}
        <div>
          {showResolutionPanel && selectedOrder ? (
            <DisputeResolutionPanel
              order={selectedOrder}
              onResolved={handleResolutionSuccess}
              variant="card"
            />
          ) : (
            <Card>
              <CardContent className="flex min-h-[400px] items-center justify-center p-12">
                <div className="text-center">
                  <Scale className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                  <p className="text-lg font-medium text-gray-600">
                    Sipariş Seçin
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Anlaşmazlığı çözmek için soldaki listeden bir sipariş seçin
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
