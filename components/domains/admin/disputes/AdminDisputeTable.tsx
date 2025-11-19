'use client';

/**
 * ================================================
 * ADMIN DISPUTE TABLE - UNIFIED DATA TABLE VERSION
 * ================================================
 * Sprint 2 - Story 4.1: Second Migration
 *
 * Migrated from 140 lines to ~60 lines using UnifiedDataTable.
 * Features: View action, status badges, date formatting.
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-11-19
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Eye } from 'lucide-react';
import { UnifiedDataTable } from '@/lib/components/unified/UnifiedDataTable';
import type {
  Column,
  RowAction,
} from '@/lib/components/unified/UnifiedDataTable';
import { Badge } from '@/components/ui/Badge';
import type { DisputeResponse } from '@/types/dispute';
import { disputeStatusLabels, disputeReasonLabels } from '@/types/dispute';

interface AdminDisputeTableProps {
  disputes: DisputeResponse[];
  isLoading: boolean;
  error: string | null;
}

const statusVariants: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  OPEN: 'destructive',
  UNDER_REVIEW: 'default',
  AWAITING_BUYER_RESPONSE: 'secondary',
  AWAITING_SELLER_RESPONSE: 'secondary',
  RESOLVED: 'outline',
  CLOSED: 'outline',
};

export function AdminDisputeTable({
  disputes,
  isLoading,
  error,
}: AdminDisputeTableProps) {
  // ============================================================================
  // COLUMN DEFINITIONS
  // ============================================================================

  const columns = useMemo<Column<DisputeResponse>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        accessor: 'id',
        render: (value) => (
          <span className="font-mono text-xs">
            {(value as string).slice(0, 8)}...
          </span>
        ),
        width: '120px',
      },
      {
        id: 'orderId',
        header: 'Sipariş',
        accessor: 'orderId',
        render: (value) => (
          <Link
            href={`/admin/orders/${value}`}
            className="text-primary font-mono text-xs hover:underline"
          >
            {(value as string).slice(0, 8)}...
          </Link>
        ),
        width: '120px',
      },
      {
        id: 'raisedBy',
        header: 'Açan',
        accessor: 'raisedByUserFullName',
        sortable: true,
      },
      {
        id: 'reason',
        header: 'Neden',
        accessor: 'reason',
        render: (value) => (
          <span className="text-sm">
            {disputeReasonLabels[value as keyof typeof disputeReasonLabels]}
          </span>
        ),
        sortable: true,
      },
      {
        id: 'status',
        header: 'Durum',
        accessor: 'status',
        render: (value) => (
          <Badge variant={statusVariants[value as string] || 'default'}>
            {disputeStatusLabels[value as keyof typeof disputeStatusLabels]}
          </Badge>
        ),
        sortable: true,
      },
      {
        id: 'createdAt',
        header: 'Oluşturulma',
        accessor: 'createdAt',
        render: (value) => (
          <span className="text-muted-foreground text-sm">
            {formatDistanceToNow(new Date(value as string), {
              addSuffix: true,
              locale: tr,
            })}
          </span>
        ),
        sortable: true,
        width: '150px',
      },
    ],
    []
  );

  // ============================================================================
  // ROW ACTIONS
  // ============================================================================

  const rowActions = useMemo<RowAction<DisputeResponse>[]>(
    () => [
      {
        id: 'view',
        label: 'Görüntüle',
        icon: Eye,
        onClick: (dispute) => {
          window.location.href = `/admin/disputes/${dispute.id}`;
        },
      },
    ],
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="overflow-hidden rounded-lg border">
      <UnifiedDataTable<DisputeResponse>
        data={disputes}
        columns={columns}
        isLoading={isLoading}
        error={error || undefined}
        emptyMessage="Filtrelerinize uygun itiraz bulunmuyor."
        rowActions={rowActions}
        sorting={{
          enabled: true,
          serverSide: false,
        }}
        hoverable={true}
        className="min-h-[300px]"
      />
    </div>
  );
}

export default AdminDisputeTable;
