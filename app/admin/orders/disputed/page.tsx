/**
 * Admin Disputed Orders Page
 * ---------------------------
 * Shows all orders with disputes that need admin attention
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { AlertCircle, Eye } from 'lucide-react';
import { useAdminOrders } from '@/hooks/business/admin/useAdminOrders';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
} from '@/types/order-helpers';

export default function AdminDisputedOrdersPage() {
  const router = useRouter();

  const { orders, isLoading } = useAdminOrders({
    autoLoad: true,
    status: 'DISPUTED',
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Anlaşmazlıklar</h1>
          <p className="text-muted-foreground">
            Müdahale gerektiren anlaşmazlıkları görüntüleyin
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-24 bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Anlaşmazlıklar</h1>
          <p className="text-muted-foreground">
            Müdahale gerektiren anlaşmazlıkları görüntüleyin
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="font-semibold text-red-600">
            {orders.length} Anlaşmazlık
          </span>
        </div>
      </div>

      {/* Disputed Orders List */}
      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">Anlaşmazlık yok</h3>
          <p className="text-muted-foreground">
            Şu anda müdahale gerektiren anlaşmazlık bulunmamaktadır
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Order Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sipariş #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.customOrderDetails?.title || 'Özel Sipariş'}
                      </p>
                    </div>
                    <Badge className={getOrderStatusColor(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Alıcı</p>
                      <p className="font-medium">
                        {order.buyer?.firstName} {order.buyer?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Satıcı</p>
                      <p className="font-medium">
                        {order.seller?.firstName} {order.seller?.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tutar</p>
                      <p className="font-semibold">
                        {order.totalAmount} {order.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Oluşturulma</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>

                  {order.customOrderDetails?.description && (
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm text-gray-700">
                        {order.customOrderDetails.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  <Button
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Detayları Görüntüle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/disputes/${order.id}`)}
                  >
                    Anlaşmazlığı Çöz
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
