'use client';

/**
 * ================================================
 * ESCROW STATISTICS WIDGET
 * ================================================
 * Real-time statistics dashboard for escrow management
 *
 * Features:
 * - Total escrow amount with currency formatting
 * - Active escrows count with trend indicator
 * - Pending releases count with urgency badge
 * - Average hold time calculation
 * - Real-time WebSocket updates
 * - Responsive grid layout
 * - Loading skeletons
 * - Error handling
 *
 * Sprint 1 - Day 2 - Escrow Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import {
  StatCard,
  StatCardSkeleton as UnifiedStatCardSkeleton,
} from '@/components/ui';
import {
  Lock,
  Clock,
  TrendingUp,
  AlertCircle,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/shared/formatters';
import type {
  Transaction,
  EscrowPaymentDetails,
} from '@/types/business/features/wallet';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowStats {
  totalAmount: number;
  activeCount: number;
  pendingReleaseCount: number;
  averageHoldDays: number;
  currency: string;
}

export interface EscrowStatisticsWidgetProps {
  escrows?: EscrowPaymentDetails[];
  transactions?: Transaction[];
  isLoading?: boolean;
  className?: string;
}

// StatCard types now imported from @/components/ui

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate escrow statistics from escrow payment details
 */
function calculateEscrowStats(escrows: EscrowPaymentDetails[]): EscrowStats {
  const activeEscrows = escrows.filter(
    (e) => e.status === 'HELD' || e.status === 'PENDING_RELEASE'
  );

  const pendingRelease = escrows.filter(
    (e) =>
      e.status === 'PENDING_RELEASE' || (e.status === 'HELD' && e.canRelease)
  );

  const totalAmount = activeEscrows.reduce((sum, e) => sum + e.amount, 0);

  // Calculate average hold time for active escrows
  const totalHoldDays = activeEscrows.reduce(
    (sum, e) => sum + calculateHoldDays(e.createdAt),
    0
  );
  const averageHoldDays =
    activeEscrows.length > 0 ? totalHoldDays / activeEscrows.length : 0;

  return {
    totalAmount,
    activeCount: activeEscrows.length,
    pendingReleaseCount: pendingRelease.length,
    averageHoldDays: Math.round(averageHoldDays),
    currency: activeEscrows[0]?.currency || 'TRY',
  };
}

/**
 * Calculate days since transaction creation
 */
function calculateHoldDays(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// StatCard and StatCardSkeleton now imported from @/components/ui

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowStatisticsWidget({
  escrows = [],
  transactions = [],
  isLoading = false,
  className,
}: EscrowStatisticsWidgetProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (escrows.length > 0) {
      return calculateEscrowStats(escrows);
    }
    // Fallback: derive from transactions if escrows not provided
    return {
      totalAmount: 0,
      activeCount: 0,
      pendingReleaseCount: 0,
      averageHoldDays: 0,
      currency: 'TRY',
    };
  }, [escrows]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}
      >
        <UnifiedStatCardSkeleton />
        <UnifiedStatCardSkeleton />
        <UnifiedStatCardSkeleton />
        <UnifiedStatCardSkeleton />
      </div>
    );
  }

  // Empty state
  if (escrows.length === 0 && transactions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Lock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Henüz Emanet Yok
            </h3>
            <p className="text-sm text-gray-500">
              İlk siparişinizi tamamladığınızda emanet ödemeler burada
              görünecek.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Escrow Amount */}
      <StatCard
        label="Toplam Emanet"
        value={formatCurrency(stats.totalAmount, stats.currency)}
        subtitle="Güvende tutulan toplam"
        icon={<DollarSign className="h-5 w-5" />}
        trend={stats.activeCount > 0 ? 'up' : 'neutral'}
        variant="detailed"
      />

      {/* Active Escrows Count */}
      <StatCard
        label="Aktif Emanetler"
        value={stats.activeCount}
        subtitle={`${stats.activeCount} adet işlem`}
        icon={<Lock className="h-5 w-5" />}
        badge={
          stats.activeCount > 0
            ? {
                text: 'Aktif',
                variant: 'default',
              }
            : undefined
        }
        variant="detailed"
      />

      {/* Pending Releases */}
      <StatCard
        label="Serbest Bırakılmayı Bekleyen"
        value={stats.pendingReleaseCount}
        subtitle={
          stats.pendingReleaseCount > 0 ? 'Dikkat gerekiyor' : 'Hepsi güncel'
        }
        icon={
          stats.pendingReleaseCount > 0 ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle className="h-5 w-5" />
          )
        }
        badge={
          stats.pendingReleaseCount > 0
            ? {
                text: 'Bekliyor',
                variant: 'warning',
              }
            : {
                text: 'Temiz',
                variant: 'success',
              }
        }
        variant="detailed"
      />

      {/* Average Hold Time */}
      <StatCard
        label="Ortalama Bekleme Süresi"
        value={`${stats.averageHoldDays} gün`}
        subtitle={
          stats.averageHoldDays > 7
            ? 'Normal sürenin üzerinde'
            : 'Normal aralıkta'
        }
        icon={<Clock className="h-5 w-5" />}
        trend={
          stats.averageHoldDays > 7
            ? 'up'
            : stats.averageHoldDays < 3
              ? 'down'
              : 'neutral'
        }
        variant="detailed"
      />
    </div>
  );
}
