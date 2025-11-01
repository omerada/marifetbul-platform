/**
 * ================================================
 * ESCROW VIEWER COMPONENT - ENHANCED
 * ================================================
 * Sprint DAY 2 - Task 7: Escrow Viewer Enhancement
 *
 * Enhanced with:
 * - Transaction timeline visualization (HELD → RELEASED)
 * - Auto-completion countdown
 * - Status flow diagram
 * - Enhanced UI with progress tracking
 * - Transaction history integration
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Enhanced
 */

'use client';

import { useMemo } from 'react';
import {
  Clock,
  Package,
  Info,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { Progress } from '@/components/ui/Progress';
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
   * All transactions (will filter ESCROW_HOLD and ESCROW_RELEASE)
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
   * Show timeline visualization
   * @default true
   */
  showTimeline?: boolean;

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
  status: 'HELD' | 'PENDING_RELEASE' | 'RELEASED';
  releaseDate?: string;
  autoReleaseIn?: number; // Days until auto-release
}

type TimelinePhase = 'payment' | 'escrow' | 'release';

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

/**
 * Determine escrow status based on transaction data
 * AUTO_RELEASE_DAYS = 30 days (platform policy)
 */
function determineEscrowStatus(
  daysInEscrow: number,
  hasRelease: boolean
): EscrowItem['status'] {
  if (hasRelease) return 'RELEASED';
  if (daysInEscrow >= 28) return 'PENDING_RELEASE'; // 2 days before auto-release
  return 'HELD';
}

/**
 * Calculate days until auto-release
 */
function calculateAutoReleaseIn(daysInEscrow: number): number {
  const AUTO_RELEASE_DAYS = 30;
  return Math.max(0, AUTO_RELEASE_DAYS - daysInEscrow);
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

function TimelineVisualization({ item }: { item: EscrowItem }) {
  const getPhaseStatus = (
    phase: TimelinePhase
  ): 'completed' | 'current' | 'upcoming' => {
    if (item.status === 'RELEASED') return 'completed';
    if (item.status === 'PENDING_RELEASE' && phase === 'release')
      return 'current';
    if (item.status === 'HELD' && phase === 'escrow') return 'current';
    if (phase === 'payment') return 'completed';
    return 'upcoming';
  };

  const phases = [
    {
      id: 'payment' as TimelinePhase,
      label: 'Ödeme Alındı',
      icon: CheckCircle2,
    },
    { id: 'escrow' as TimelinePhase, label: 'Emanette', icon: Clock },
    {
      id: 'release' as TimelinePhase,
      label: 'Serbest Bırakıldı',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {phases.map((phase, index) => {
        const status = getPhaseStatus(phase.id);
        const Icon = phase.icon;

        return (
          <div key={phase.id} className="flex items-center">
            <div
              className={`flex items-center gap-1 rounded px-2 py-1 ${
                status === 'completed'
                  ? 'bg-green-50 text-green-700'
                  : status === 'current'
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-gray-50 text-gray-400'
              }`}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs font-medium">{phase.label}</span>
            </div>
            {index < phases.length - 1 && (
              <ArrowRight
                className={`mx-1 h-3 w-3 ${
                  status === 'completed' ? 'text-green-500' : 'text-gray-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function EscrowItemCard({ item }: { item: EscrowItem }) {
  const getStatusConfig = () => {
    switch (item.status) {
      case 'RELEASED':
        return {
          color: 'green',
          icon: CheckCircle2,
          label: 'Serbest Bırakıldı',
        };
      case 'PENDING_RELEASE':
        return {
          color: 'yellow',
          icon: AlertCircle,
          label: 'Yakında Serbest Bırakılacak',
        };
      default:
        return { color: 'blue', icon: Clock, label: 'Emanette' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const progressPercentage = Math.min((item.daysInEscrow / 30) * 100, 100);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <p className="font-medium text-gray-900">{item.description}</p>
            <Badge
              variant="outline"
              className={`text-xs text-${statusConfig.color}-700 border-${statusConfig.color}-300`}
            >
              <StatusIcon className="mr-1 h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {item.daysInEscrow} / 30 gün
            </Badge>
            {item.autoReleaseIn !== undefined && item.autoReleaseIn > 0 && (
              <Badge
                variant="outline"
                className="border-yellow-300 text-xs text-yellow-700"
              >
                <Calendar className="mr-1 h-3 w-3" />
                {item.autoReleaseIn} gün sonra otomatik
              </Badge>
            )}
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
          <p className={`text-lg font-semibold text-${statusConfig.color}-600`}>
            {formatCurrency(item.amount, 'TRY')}
          </p>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>
      </div>

      {/* Progress Bar - 30 Day Auto-Release */}
      {item.status !== 'RELEASED' && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
            <span>Otomatik Serbest Bırakma İlerlemesi</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* Timeline Visualization */}
      <div className="mb-3">
        <TimelineVisualization item={item} />
      </div>

      {/* Status Alerts */}
      {item.status === 'PENDING_RELEASE' && (
        <div className="mt-2 rounded bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
          <AlertCircle className="mr-1 inline h-3 w-3" />
          Bu ödeme {item.autoReleaseIn} gün içinde otomatik olarak serbest
          bırakılacak.
        </div>
      )}

      {item.status === 'RELEASED' && item.releaseDate && (
        <div className="mt-2 rounded bg-green-50 px-3 py-2 text-xs text-green-800">
          <CheckCircle2 className="mr-1 inline h-3 w-3" />
          {formatRelativeTime(item.releaseDate)} tarihinde serbest bırakıldı
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
    // Get all ESCROW_RELEASE transactions for lookup
    const releaseTransactions = transactions.filter(
      (t) => t.type === 'ESCROW_RELEASE'
    );

    const escrowTransactions = transactions
      .filter((t) => t.type === 'ESCROW_HOLD')
      .map((t) => {
        const daysInEscrow = calculateDaysInEscrow(t.createdAt);

        // Check if this escrow has been released
        const releaseTransaction = releaseTransactions.find(
          (r) => r.paymentId === t.paymentId || r.description.includes(t.id)
        );

        const hasRelease = !!releaseTransaction;
        const status = determineEscrowStatus(daysInEscrow, hasRelease);
        const autoReleaseIn = calculateAutoReleaseIn(daysInEscrow);

        return {
          id: t.id,
          amount: t.amount,
          description: t.description,
          createdAt: t.createdAt,
          orderId: extractOrderId(t.description),
          paymentId: t.paymentId,
          daysInEscrow,
          status,
          autoReleaseIn: status === 'RELEASED' ? undefined : autoReleaseIn,
          releaseDate: releaseTransaction?.createdAt,
        };
      })
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
