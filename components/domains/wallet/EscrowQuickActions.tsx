'use client';

/**
 * ================================================
 * ESCROW QUICK ACTIONS PANEL
 * ================================================
 * Quick action shortcuts for escrow management
 *
 * Features:
 * - Release all eligible escrows (bulk action)
 * - Quick filter presets (Needs attention, Ready to release, etc.)
 * - Export transactions
 * - Keyboard shortcuts (accessible)
 * - Confirmation dialogs for bulk actions
 * - Loading states
 *
 * Sprint 1 - Day 2 - Escrow Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import {
  CheckCircle,
  Download,
  Filter,
  Zap,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { EscrowPaymentDetails } from '@/types/business/features/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export type FilterPreset =
  | 'all'
  | 'needs-attention'
  | 'ready-to-release'
  | 'disputed';

export interface EscrowQuickActionsProps {
  escrows: EscrowPaymentDetails[];
  onFilterChange?: (filter: FilterPreset) => void;
  onBulkRelease?: (escrowIds: string[]) => Promise<void>;
  onExport?: () => void;
  className?: string;
  isLoading?: boolean;
}

interface QuickActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant: 'success' | 'warning' | 'destructive' | 'secondary';
  disabled?: boolean;
  badge?: number;
  description?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEligibleForRelease(
  escrows: EscrowPaymentDetails[]
): EscrowPaymentDetails[] {
  return escrows.filter((e) => e.canRelease && e.status === 'PENDING_RELEASE');
}

function getNeedsAttention(
  escrows: EscrowPaymentDetails[]
): EscrowPaymentDetails[] {
  return escrows.filter(
    (e) =>
      e.status === 'PENDING_RELEASE' || (e.canDispute && e.status === 'HELD')
  );
}

function getDisputed(escrows: EscrowPaymentDetails[]): EscrowPaymentDetails[] {
  return escrows.filter((e) => e.status === 'FROZEN' || !!e.disputeId);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowQuickActions({
  escrows,
  onFilterChange,
  onBulkRelease,
  onExport,
  className,
  isLoading = false,
}: EscrowQuickActionsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('all');
  const [isBulkReleasing, setIsBulkReleasing] = useState(false);

  // Calculate counts for badges
  const eligibleCount = getEligibleForRelease(escrows).length;
  const needsAttentionCount = getNeedsAttention(escrows).length;
  const disputedCount = getDisputed(escrows).length;

  // Handle bulk release
  const handleBulkRelease = useCallback(async () => {
    if (!onBulkRelease || eligibleCount === 0) return;

    const confirmed = window.confirm(
      `${eligibleCount} emanet ödemeyi serbest bırakmak istediğinize emin misiniz?`
    );

    if (!confirmed) return;

    setIsBulkReleasing(true);
    try {
      const eligible = getEligibleForRelease(escrows);
      const escrowIds = eligible.map((e) => e.id);

      await onBulkRelease(escrowIds);

      toast.success('Toplu İşlem Başarılı', {
        description: `${eligibleCount} emanet ödeme serbest bırakıldı.`,
      });
    } catch (error) {
      logger.error(
        'Bulk release failed',
        error instanceof Error ? error : new Error(String(error)),
        { count: eligibleCount }
      );

      toast.error('Toplu İşlem Başarısız', {
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsBulkReleasing(false);
    }
  }, [escrows, eligibleCount, onBulkRelease]);

  // Handle filter change
  const handleFilterChange = useCallback(
    (filter: FilterPreset) => {
      setActiveFilter(filter);
      onFilterChange?.(filter);
    },
    [onFilterChange]
  );

  // Quick filter buttons
  const filterButtons: Array<{
    id: FilterPreset;
    label: string;
    icon: React.ReactNode;
    count: number;
    description: string;
  }> = [
    {
      id: 'all',
      label: 'Tümü',
      icon: <Filter className="h-4 w-4" />,
      count: escrows.length,
      description: 'Tüm emanetler',
    },
    {
      id: 'needs-attention',
      label: 'Dikkat Gerekiyor',
      icon: <AlertCircle className="h-4 w-4" />,
      count: needsAttentionCount,
      description: 'Serbest bırakılmayı veya işlem bekleyen',
    },
    {
      id: 'ready-to-release',
      label: 'Serbest Bırakılabilir',
      icon: <CheckCircle className="h-4 w-4" />,
      count: eligibleCount,
      description: 'Hemen serbest bırakılabilir',
    },
    {
      id: 'disputed',
      label: 'İtirazlı',
      icon: <Clock className="h-4 w-4" />,
      count: disputedCount,
      description: 'İtiraz sürecinde',
    },
  ];

  // Quick action buttons
  const actionButtons: QuickActionButton[] = [
    {
      id: 'bulk-release',
      label: 'Tümünü Serbest Bırak',
      icon: <Zap className="h-4 w-4" />,
      onClick: handleBulkRelease,
      variant: 'success',
      disabled: eligibleCount === 0 || isBulkReleasing || !onBulkRelease,
      badge: eligibleCount,
      description: `${eligibleCount} emanet serbest bırakılabilir`,
    },
    {
      id: 'export',
      label: 'Dışa Aktar',
      icon: <Download className="h-4 w-4" />,
      onClick:
        onExport ||
        (() => toast.info('Dışa aktarma özelliği yakında eklenecek')),
      variant: 'secondary',
      description: 'İşlemleri Excel/CSV olarak indir',
    },
  ];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Quick Filters */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Hızlı Filtreler
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {filterButtons.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterChange(filter.id)}
                  disabled={isLoading}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 text-left transition-all',
                    'hover:border-blue-500 hover:shadow-sm',
                    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
                    activeFilter === filter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white',
                    isLoading && 'cursor-not-allowed opacity-50'
                  )}
                  aria-label={filter.description}
                  aria-pressed={activeFilter === filter.id}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        activeFilter === filter.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {filter.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {filter.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {filter.description}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activeFilter === filter.id ? 'default' : 'secondary'
                    }
                  >
                    {filter.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Hızlı İşlemler
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {actionButtons.map((action) => (
                <Button
                  key={action.id}
                  onClick={action.onClick}
                  disabled={action.disabled || isLoading}
                  variant={action.variant}
                  className="justify-between"
                >
                  <span className="flex items-center gap-2">
                    {action.icon}
                    {action.label}
                  </span>
                  {action.badge !== undefined && action.badge > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {action.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          {needsAttentionCount > 0 && (
            <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-amber-900">
                    Dikkat Gerekiyor
                  </h4>
                  <p className="text-sm text-amber-700">
                    {needsAttentionCount} emanet ödeme işleminizi bekliyor.
                    Lütfen gözden geçirin.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
