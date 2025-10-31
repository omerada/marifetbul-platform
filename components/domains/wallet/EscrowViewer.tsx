/**
 * ================================================
 * ESCROW VIEWER COMPONENT
 * ================================================
 * Sprint 1 - Task 1.1.4
 *
 * Displays escrow funds with transaction details
 * Shows funds held in escrow from active orders
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import { Clock, Package, Info, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/Tooltip';
import { formatCurrency, formatRelativeTime } from '@/lib/shared/formatters';
import Link from 'next/link';
import type { Transaction } from '@/lib/api/validators';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowViewerProps {
  /**
   * All transactions (will filter ESCROW_HOLD)
   */
  transactions: Transaction[];

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show detailed transaction list
   * @default true
   */
  showDetails?: boolean;

  /**
   * Custom className
   */
  className?: string;
}

interface EscrowItem {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
  paymentId?: string;
  daysInEscrow: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateDaysInEscrow(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function extractOrderId(description: string): string | undefined {
  // Try to extract order ID from description
  // e.g., "Payment held in escrow for order ORD-123"
  const match = description.match(/ORD-[\w-]+/i);
  return match ? match[0] : undefined;
}

// ============================================================================
// COMPONENTS
// ============================================================================

function EscrowSummaryCard({
  totalEscrow,
  itemCount,
}: {
  totalEscrow: number;
  itemCount: number;
}) {
  return (
    <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-yellow-900">
              Emanette Tutulan
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 cursor-help text-yellow-600" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-sm">
                    Sipariş tamamlanana kadar güvenlik amaçlı tutulan ödeme
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <p className="mb-1 text-3xl font-bold text-yellow-900">
            {formatCurrency(totalEscrow, 'TRY')}
          </p>

          <p className="text-sm text-yellow-700">
            {itemCount} {itemCount === 1 ? 'sipariş' : 'sipariş'} beklemede
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Package className="h-6 w-6 text-yellow-600" />
        </div>
      </div>
    </div>
  );
}

function EscrowItemCard({ item }: { item: EscrowItem }) {
  const statusColor = item.daysInEscrow > 14 ? 'yellow' : 'blue';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 font-medium text-gray-900">{item.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {item.daysInEscrow} gün emanette
            </Badge>
            {item.orderId && (
              <Link
                href={`/dashboard/orders/${item.orderId}`}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                {item.orderId}
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="ml-4 text-right">
          <p className={`text-lg font-semibold text-${statusColor}-600`}>
            {formatCurrency(item.amount, 'TRY')}
          </p>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>
      </div>

      {item.daysInEscrow > 14 && (
        <div className="mt-2 rounded bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
          ⚠️ Bu sipariş 2 haftadan uzun süredir emanette. Sipariş durumunu
          kontrol edin.
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Package className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        Emanette Tutulan Ödeme Yok
      </h3>
      <p className="mx-auto max-w-md text-sm text-gray-600">
        Aktif siparişlerinizden gelen ödemeler tamamlanana kadar burada
        görünecektir.
      </p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowViewer({
  transactions,
  isLoading = false,
  showDetails = true,
  className = '',
}: EscrowViewerProps) {
  // Process escrow transactions
  const escrowData = useMemo(() => {
    const escrowTransactions = transactions
      .filter((t) => t.type === 'ESCROW_HOLD')
      .map((t) => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        createdAt: t.createdAt,
        orderId: extractOrderId(t.description),
        paymentId: t.paymentId,
        daysInEscrow: calculateDaysInEscrow(t.createdAt),
      }))
      .sort((a, b) => b.daysInEscrow - a.daysInEscrow); // Sort by longest first

    const totalEscrow = escrowTransactions.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    return {
      items: escrowTransactions,
      total: totalEscrow,
      count: escrowTransactions.length,
    };
  }, [transactions]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-4 h-24 w-full" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          Emanet Fonlar
        </CardTitle>
        <p className="mt-1 text-sm text-gray-600">
          Tamamlanmayı bekleyen siparişlerden tutulan ödemeler
        </p>
      </CardHeader>

      <CardContent>
        {/* Summary */}
        <EscrowSummaryCard
          totalEscrow={escrowData.total}
          itemCount={escrowData.count}
        />

        {/* Details */}
        {showDetails && (
          <div className="mt-6">
            {escrowData.items.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Emanet Detayları
                  </h4>
                  <Badge variant="secondary">{escrowData.count} Sipariş</Badge>
                </div>

                <div className="space-y-3">
                  {escrowData.items.map((item) => (
                    <EscrowItemCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-900">
              <p className="mb-1 font-medium">Emanet Sistemi Nasıl Çalışır?</p>
              <p className="text-blue-700">
                Alıcı ödeme yaptığında, tutar sipariş tamamlanana kadar emanette
                tutulur. Sipariş tamamlandığında ödemeler otomatik olarak
                hesabınıza aktarılır.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EscrowViewer;
