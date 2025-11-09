'use client';

/**
 * ================================================
 * ESCROW LIST COMPONENT
 * ================================================
 * Display and manage escrow transactions
 *
 * Features:
 * - Filter by status (HELD, PENDING_RELEASE, RELEASED, DISPUTED)
 * - Sort by date, amount, days in escrow
 * - Status badges with color coding
 * - Quick actions (release, dispute)
 * - Auto-release countdown
 * - Order link navigation
 *
 * Sprint 1 - Epic 1.2 - Days 4-5
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Clock,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import type { Transaction } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export type EscrowStatus =
  | 'HELD'
  | 'PENDING_RELEASE'
  | 'RELEASED'
  | 'DISPUTED'
  | 'ALL';

export type SortField = 'createdAt' | 'amount' | 'daysInEscrow';
export type SortDirection = 'asc' | 'desc';

export interface EscrowItem {
  id: string;
  transactionId: string;
  amount: number;
  description: string;
  createdAt: string;
  orderId?: string;
  paymentId?: string;
  daysInEscrow: number;
  status: Exclude<EscrowStatus, 'ALL'>;
  releaseDate?: string;
  autoReleaseIn?: number; // Days until auto-release
  isDisputed?: boolean;
}

export interface EscrowListProps {
  /** All transactions (will filter ESCROW_HOLD and ESCROW_RELEASE) */
  transactions: Transaction[];

  /** Loading state */
  isLoading?: boolean;

  /** Callback when release is requested */
  onReleaseRequest?: (escrowItem: EscrowItem) => void;

  /** Callback when dispute is requested */
  onDisputeRequest?: (escrowItem: EscrowItem) => void;

  /** Callback when escrow item is clicked */
  onItemClick?: (escrowItem: EscrowItem) => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTO_RELEASE_DAYS = 30; // Platform policy: auto-release after 30 days
const PENDING_RELEASE_THRESHOLD = 28; // Show warning 2 days before auto-release

const STATUS_CONFIG: Record<
  Exclude<EscrowStatus, 'ALL'>,
  {
    label: string;
    color: 'yellow' | 'orange' | 'green' | 'red';
    icon: React.ReactNode;
    description: string;
  }
> = {
  HELD: {
    label: 'Emanette',
    color: 'yellow',
    icon: <Lock className="h-4 w-4" />,
    description: 'Ödeme güvenli bir şekilde emanette tutuluyor',
  },
  PENDING_RELEASE: {
    label: 'Serbest Bırakılacak',
    color: 'orange',
    icon: <Clock className="h-4 w-4" />,
    description: 'Otomatik serbest bırakılma yaklaşıyor',
  },
  RELEASED: {
    label: 'Serbest Bırakıldı',
    color: 'green',
    icon: <Unlock className="h-4 w-4" />,
    description: 'Ödeme başarıyla serbest bırakıldı',
  },
  DISPUTED: {
    label: 'İhtilaflı',
    color: 'red',
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'İhtilaf süreci devam ediyor',
  },
};

const FILTER_BUTTONS: { value: EscrowStatus; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: 'HELD', label: 'Emanette' },
  { value: 'PENDING_RELEASE', label: 'Yakında Serbest' },
  { value: 'RELEASED', label: 'Serbest Bırakıldı' },
  { value: 'DISPUTED', label: 'İhtilaflı' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate days in escrow
 */
function calculateDaysInEscrow(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const diffTime = Math.abs(now.getTime() - created.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Extract order ID from transaction description
 */
function extractOrderId(description: string): string | undefined {
  // Try multiple patterns
  const patterns = [
    /ORD-[\w-]+/i,
    /order[:\s#]+([a-f0-9-]{36})/i,
    /sipariş[:\s#]+([a-f0-9-]{36})/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) return match[0];
  }

  return undefined;
}

/**
 * Determine escrow status based on transaction data
 */
function determineEscrowStatus(
  daysInEscrow: number,
  hasRelease: boolean,
  isDisputed: boolean
): EscrowItem['status'] {
  if (isDisputed) return 'DISPUTED';
  if (hasRelease) return 'RELEASED';
  if (daysInEscrow >= PENDING_RELEASE_THRESHOLD) return 'PENDING_RELEASE';
  return 'HELD';
}

/**
 * Calculate days until auto-release
 */
function calculateAutoReleaseIn(daysInEscrow: number): number {
  const remaining = AUTO_RELEASE_DAYS - daysInEscrow;
  return remaining > 0 ? remaining : 0;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowList({
  transactions,
  isLoading = false,
  onReleaseRequest,
  onDisputeRequest,
  onItemClick,
  className = '',
}: EscrowListProps) {
  // State
  const [statusFilter, setStatusFilter] = useState<EscrowStatus>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Process escrow items
  const escrowItems = useMemo(() => {
    // Get all ESCROW_RELEASE transactions for lookup
    const releaseTransactions = transactions.filter(
      (t) => t.type === 'ESCROW_RELEASE'
    );

    // Get all disputed order IDs (you might need to fetch this from dispute API)
    // For now, we'll check if description contains "dispute" or "ihtilaf"
    const disputedEntityIds = new Set(
      transactions
        .filter(
          (t) =>
            t.description?.toLowerCase().includes('dispute') ||
            t.description?.toLowerCase().includes('ihtilaf')
        )
        .map((t) => t.relatedEntityId)
        .filter((id): id is string => !!id)
    );

    // Process ESCROW_HOLD transactions
    const items: EscrowItem[] = transactions
      .filter((t) => t.type === 'ESCROW_HOLD')
      .map((t) => {
        const daysInEscrow = calculateDaysInEscrow(t.createdAt);

        // Check if this escrow has been released
        const releaseTransaction = releaseTransactions.find(
          (r) =>
            r.relatedEntityId === t.relatedEntityId ||
            r.description.includes(t.id)
        );

        const hasRelease = !!releaseTransaction;
        const isDisputed = t.relatedEntityId
          ? disputedEntityIds.has(t.relatedEntityId)
          : false;
        const status = determineEscrowStatus(
          daysInEscrow,
          hasRelease,
          isDisputed
        );
        const autoReleaseIn =
          status === 'RELEASED'
            ? undefined
            : calculateAutoReleaseIn(daysInEscrow);

        return {
          id: t.id,
          transactionId: t.id,
          amount: t.amount,
          description: t.description,
          createdAt: t.createdAt,
          orderId: extractOrderId(t.description),
          paymentId: t.relatedEntityId,
          daysInEscrow,
          status,
          releaseDate: releaseTransaction?.createdAt,
          autoReleaseIn,
          isDisputed,
        };
      });

    return items;
  }, [transactions]);

  // Filter escrow items
  const filteredItems = useMemo(() => {
    if (statusFilter === 'ALL') return escrowItems;
    return escrowItems.filter((item) => item.status === statusFilter);
  }, [escrowItems, statusFilter]);

  // Sort escrow items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'daysInEscrow':
          comparison = a.daysInEscrow - b.daysInEscrow;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredItems, sortField, sortDirection]);

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalHeld = escrowItems
      .filter(
        (item) => item.status === 'HELD' || item.status === 'PENDING_RELEASE'
      )
      .reduce((sum, item) => sum + item.amount, 0);

    const totalReleased = escrowItems
      .filter((item) => item.status === 'RELEASED')
      .reduce((sum, item) => sum + item.amount, 0);

    const totalDisputed = escrowItems
      .filter((item) => item.status === 'DISPUTED')
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      totalHeld,
      totalReleased,
      totalDisputed,
      heldCount: escrowItems.filter(
        (item) => item.status === 'HELD' || item.status === 'PENDING_RELEASE'
      ).length,
      releasedCount: escrowItems.filter((item) => item.status === 'RELEASED')
        .length,
      disputedCount: escrowItems.filter((item) => item.status === 'DISPUTED')
        .length,
    };
  }, [escrowItems]);

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Emanet İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (escrowItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Emanet İşlemleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="text-muted-foreground/50 mb-4 h-12 w-12" />
            <p className="text-muted-foreground mb-2">
              Emanet işlemi bulunamadı
            </p>
            <p className="text-muted-foreground text-sm">
              Güvenli ödemeleriniz burada görünecektir
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Emanet İşlemleri</CardTitle>
          <div className="flex gap-2 text-sm">
            <div className="text-muted-foreground">
              Toplam: {formatCurrency(stats.totalHeld + stats.totalReleased)}
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
            <div className="mb-1 flex items-center gap-2">
              <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Emanette
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
              {formatCurrency(stats.totalHeld)}
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              {stats.heldCount} işlem
            </div>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
            <div className="mb-1 flex items-center gap-2">
              <Unlock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Serbest Bırakıldı
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(stats.totalReleased)}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300">
              {stats.releasedCount} işlem
            </div>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
            <div className="mb-1 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-900 dark:text-red-100">
                İhtilaflı
              </span>
            </div>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(stats.totalDisputed)}
            </div>
            <div className="text-xs text-red-700 dark:text-red-300">
              {stats.disputedCount} işlem
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filter Buttons */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground mr-2 text-sm">Filtre:</span>
          {FILTER_BUTTONS.map((filter) => (
            <Button
              key={filter.value}
              variant={statusFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
              {filter.value !== 'ALL' && (
                <Badge variant="secondary" className="ml-2">
                  {
                    escrowItems.filter(
                      (item) =>
                        filter.value === 'ALL' || item.status === filter.value
                    ).length
                  }
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Sırala:</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort('createdAt')}
            className="gap-2"
          >
            Tarih
            {getSortIcon('createdAt')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort('amount')}
            className="gap-2"
          >
            Tutar
            {getSortIcon('amount')}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSort('daysInEscrow')}
            className="gap-2"
          >
            Süre
            {getSortIcon('daysInEscrow')}
          </Button>
        </div>

        {/* Escrow Items List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-muted-foreground py-8 text-center"
              >
                Bu filtreye uygun emanet işlemi bulunamadı
              </motion.div>
            ) : (
              sortedItems.map((item) => {
                const statusConfig = STATUS_CONFIG[item.status];

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="border-border hover:bg-accent/50 cursor-pointer rounded-lg border p-4 transition-colors"
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Section */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`border-${statusConfig.color}-500 text-${statusConfig.color}-700 dark:text-${statusConfig.color}-300 bg-${statusConfig.color}-50 dark:bg-${statusConfig.color}-950/20`}
                          >
                            <span className="flex items-center gap-1">
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </Badge>

                          {item.autoReleaseIn !== undefined &&
                            item.autoReleaseIn <= 7 && (
                              <Badge variant="outline" className="gap-1">
                                <Clock className="h-3 w-3" />
                                {item.autoReleaseIn} gün kaldı
                              </Badge>
                            )}
                        </div>

                        <p className="text-muted-foreground mb-1 truncate text-sm">
                          {item.description}
                        </p>

                        <div className="text-muted-foreground flex items-center gap-4 text-xs">
                          <span>{formatDate(item.createdAt)}</span>
                          <span>•</span>
                          <span>{item.daysInEscrow} gün emanette</span>
                          {item.orderId && (
                            <>
                              <span>•</span>
                              <a
                                href={`/dashboard/orders/${item.orderId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="hover:text-primary flex items-center gap-1 transition-colors"
                              >
                                {item.orderId}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-lg font-bold">
                          {formatCurrency(item.amount)}
                        </div>

                        {/* Quick Actions */}
                        {item.status === 'HELD' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReleaseRequest?.(item);
                              }}
                              className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                            >
                              <Unlock className="mr-1 h-3 w-3" />
                              Serbest Bırak
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDisputeRequest?.(item);
                              }}
                              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <AlertCircle className="mr-1 h-3 w-3" />
                              İtiraz Et
                            </Button>
                          </div>
                        )}

                        {item.status === 'PENDING_RELEASE' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onReleaseRequest?.(item);
                              }}
                              className="text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Şimdi Serbest Bırak
                            </Button>
                          </div>
                        )}

                        {item.status === 'RELEASED' && item.releaseDate && (
                          <div className="text-xs text-green-600 dark:text-green-400">
                            {formatDate(item.releaseDate)} tarihinde serbest
                            bırakıldı
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        {sortedItems.length > 0 && (
          <div className="text-muted-foreground mt-6 text-center text-sm">
            {sortedItems.length} emanet işlemi gösteriliyor
            {statusFilter !== 'ALL' &&
              ` (${FILTER_BUTTONS.find((f) => f.value === statusFilter)?.label})`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EscrowList;
