'use client';

/**
 * ================================================
 * ADMIN ORDERS TABLE - UNIFIED VERSION
 * ================================================
 * Sprint 2 - Migration to UnifiedDataTable
 * 180+ lines → ~90 lines (-50%)
 */

import React, { useMemo } from 'react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type { Column, RowAction } from '@/lib/components/unified/UnifiedDataTable';
import type { Order } from '@/types/business/features/orders';
import { OrderStatus } from '@/types/business/features/order';
import { Badge } from '@/components/ui/Badge';
import { Eye, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
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
  const columns = useMemo<Column<Order>[]>(
    () => [
      {
        id: 'orderNumber',
        header: 'Sipariş No',
        render: (_, order) => (
          <span className="font-medium">#{order.orderNumber}</span>
        ),
      },
      {
        id: 'buyer',
        header: 'Alıcı',
        render: (_, order) => (
          <span>
            {order.buyer?.firstName} {order.buyer?.lastName}
          </span>
        ),
      },
      {
        id: 'seller',
        header: 'Satıcı',
        render: (_, order) => (
          <span>
            {order.seller?.firstName} {order.seller?.lastName}
          </span>
        ),
      },
      {
        id: 'totalAmount',
        header: 'Tutar',
        render: (_, order) => (
          <span className="font-semibold">
            {order.totalAmount} {order.currency}
          </span>
        ),
        sortable: true,
      },
      {
        id: 'status',
        header: 'Durum',
        accessor: 'status',
        render: (value) => (
          <Badge className={getOrderStatusColor(value as OrderStatus)}>
            {getOrderStatusLabel(value as OrderStatus)}
          </Badge>
        ),
        sortable: true,
      },
      {
        id: 'createdAt',
        header: 'Tarih',
        accessor: 'createdAt',
        formatter: 'date',
        sortable: true,
      },
    ],
    []
  );

  const rowActions = useMemo<RowAction<Order>[]>(
    () => [
      {
        id: 'view',
        label: 'Görüntüle',
        icon: Eye,
        onClick: (order) => onViewDetails?.(order.id),
      },
      {
        id: 'viewExternal',
        label: 'Detayları Görüntüle',
        icon: ExternalLink,
        onClick: (order) => {
          window.location.href = `/admin/orders/${order.id}`;
        },
      },
      {
        id: 'complete',
        label: 'Tamamla',
        icon: CheckCircle,
        variant: 'success',
        show: (order) => (order.status as OrderStatus) !== OrderStatus.COMPLETED,
        onClick: (order) => onForceComplete?.(order.id),
      },
      {
        id: 'cancel',
        label: 'İptal Et',
        icon: XCircle,
        variant: 'danger',
        show: (order) => (order.status as OrderStatus) !== OrderStatus.CANCELED,
        onClick: (order) => onForceCancel?.(order.id),
      },
    ],
    [onForceComplete, onForceCancel, onViewDetails]
  );

  return (
    <UnifiedDataTable<Order>
      data={orders}
      columns={columns}
      isLoading={isLoading}
      emptyMessage="Sipariş bulunamadı"
      rowActions={rowActions}
      sorting={{
        enabled: true,
        serverSide: false,
      }}
      hoverable
      className="overflow-hidden rounded-lg border"
    />
  );
}
