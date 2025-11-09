'use client';

/**
 * AdminOrdersTable Component
 * --------------------------
 * Table showing all orders with admin actions
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  Eye,
  CheckCircle,
  XCircle,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import type { Order } from '@/types/business/features/orders';
import { OrderStatus } from '@/types/business/features/order';
import {
  getOrderStatusLabel,
  getOrderStatusColor,
} from '@/types/order-helpers';

interface AdminOrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onForceComplete?: (orderId: string) => void;
  onForceCancel?: (orderId: string) => void;
  onViewDetails?: (orderId: string) => void;
}

export function AdminOrdersTable({
  orders,
  isLoading = false,
  onForceComplete,
  onForceCancel,
  onViewDetails,
}: AdminOrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded bg-gray-200" />
          ))}
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Sipariş bulunamadı</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Sipariş No
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Alıcı
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Satıcı
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Tutar
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Durum
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Tarih
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">
                  #{order.orderNumber}
                </td>
                <td className="px-4 py-3 text-sm">
                  {order.buyer?.firstName} {order.buyer?.lastName}
                </td>
                <td className="px-4 py-3 text-sm">
                  {order.seller?.firstName} {order.seller?.lastName}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {order.totalAmount} {order.currency}
                </td>
                <td className="px-4 py-3">
                  <Badge className={getOrderStatusColor(order.status)}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(order.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedOrder(
                            selectedOrder === order.id ? null : order.id
                          )
                        }
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      {selectedOrder === order.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 rounded-md border bg-white shadow-lg">
                          <div className="py-1">
                            <button
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                onViewDetails?.(order.id);
                                setSelectedOrder(null);
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                              Detayları Görüntüle
                            </button>
                            {(order.status as OrderStatus) !==
                              OrderStatus.COMPLETED && (
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-gray-100"
                                onClick={() => {
                                  onForceComplete?.(order.id);
                                  setSelectedOrder(null);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Tamamla
                              </button>
                            )}
                            {(order.status as OrderStatus) !==
                              OrderStatus.CANCELED && (
                              <button
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                                onClick={() => {
                                  onForceCancel?.(order.id);
                                  setSelectedOrder(null);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                                İptal Et
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
