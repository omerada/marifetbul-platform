/**
 * ================================================
 * USE UPCOMING ESCROW RELEASES HOOK
 * ================================================
 * Hook for fetching escrow items approaching auto-release (within 24 hours)
 *
 * Features:
 * - Fetch escrows scheduled for auto-release within 24h
 * - Real-time countdown timers
 * - Auto-refresh support
 * - Error handling
 *
 * Sprint 1 - Story 1.4: Escrow Auto-Release Dashboard Widget (5 SP)
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useMemo } from 'react';
import { useWalletData } from './useWalletData';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface UpcomingReleaseItem {
  id: string;
  orderId: string;
  orderTitle: string;
  amount: number;
  currency: string;
  createdAt: string;
  autoReleaseAt: string;
  hoursRemaining: number;
  canObjectRelease: boolean; // Buyer can object if < 24h remaining
}

export interface UseUpcomingEscrowReleasesReturn {
  items: UpcomingReleaseItem[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTO_RELEASE_DAYS = 30; // Escrow auto-releases after 30 days
const WARNING_THRESHOLD_HOURS = 24; // Show warning when < 24 hours remaining

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract order ID from transaction description
 */
function extractOrderId(description: string): string {
  const match = description.match(/Order[:#\s]+([A-Z0-9-]+)/i);
  return match ? match[1] : '';
}

/**
 * Extract order title from transaction description
 */
function extractOrderTitle(description: string): string {
  // Try to extract title after order ID
  const parts = description.split('-');
  return parts.length > 1 ? parts.slice(1).join('-').trim() : description;
}

/**
 * Calculate auto-release date (30 days after creation)
 */
function calculateAutoReleaseDate(createdAt: string): Date {
  const created = new Date(createdAt);
  const autoRelease = new Date(created);
  autoRelease.setDate(autoRelease.getDate() + AUTO_RELEASE_DAYS);
  return autoRelease;
}

/**
 * Calculate hours remaining until auto-release
 */
function calculateHoursRemaining(autoReleaseAt: Date): number {
  const now = new Date();
  const diff = autoReleaseAt.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60))); // Convert ms to hours
}

/**
 * Filter and transform escrow transactions to upcoming releases
 */
function processUpcomingReleases(
  transactions: ReturnType<typeof useWalletData>['transactions']
): UpcomingReleaseItem[] {
  // Get ESCROW_HOLD transactions (active escrow)
  const escrowTransactions = transactions.filter(
    (t) => t.type === 'ESCROW_HOLD'
  );

  // Get ESCROW_RELEASE transaction IDs to exclude released items
  const releasedIds = new Set(
    transactions
      .filter((t) => t.type === 'ESCROW_RELEASE')
      .map((t) => t.referenceId) // Use referenceId instead of relatedEntityId
      .filter(Boolean)
  );

  // Process active escrow items
  const upcomingItems: UpcomingReleaseItem[] = escrowTransactions
    .filter((t) => {
      // Exclude if already released
      if (releasedIds.has(t.id)) return false;

      const autoReleaseDate = calculateAutoReleaseDate(t.createdAt);
      const hoursRemaining = calculateHoursRemaining(autoReleaseDate);

      // Only include if within warning threshold (24 hours)
      return hoursRemaining <= WARNING_THRESHOLD_HOURS && hoursRemaining > 0;
    })
    .map((t) => {
      const autoReleaseDate = calculateAutoReleaseDate(t.createdAt);
      const hoursRemaining = calculateHoursRemaining(autoReleaseDate);

      return {
        id: t.id,
        orderId: extractOrderId(t.description),
        orderTitle: extractOrderTitle(t.description),
        amount: t.amount,
        currency: t.currency,
        createdAt: t.createdAt,
        autoReleaseAt: autoReleaseDate.toISOString(),
        hoursRemaining,
        canObjectRelease: hoursRemaining <= WARNING_THRESHOLD_HOURS,
      };
    })
    // Sort by hours remaining (most urgent first)
    .sort((a, b) => a.hoursRemaining - b.hoursRemaining);

  return upcomingItems;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for fetching upcoming escrow auto-releases (within 24 hours)
 *
 * @param autoRefresh - Enable auto-refresh (default: true, every 60s)
 * @returns Upcoming release items with countdown and actions
 *
 * @example
 * ```tsx
 * const { items, isLoading, refresh } = useUpcomingEscrowReleases(true);
 *
 * <UpcomingAutoReleaseWidget
 *   items={items}
 *   isLoading={isLoading}
 *   onRefresh={refresh}
 * />
 * ```
 */
export function useUpcomingEscrowReleases(
  autoRefresh = true
): UseUpcomingEscrowReleasesReturn {
  // Fetch wallet data with auto-refresh
  const { transactions, isLoading, error, refresh } = useWalletData(
    autoRefresh,
    autoRefresh ? 60000 : undefined
  );

  // Process transactions to extract upcoming releases
  const items = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    try {
      const upcomingItems = processUpcomingReleases(transactions);

      logger.debug('[useUpcomingEscrowReleases] Processed upcoming releases', {
        total: upcomingItems.length,
        mostUrgent: upcomingItems[0]
          ? {
              orderId: upcomingItems[0].orderId,
              hoursRemaining: upcomingItems[0].hoursRemaining,
            }
          : null,
      });

      return upcomingItems;
    } catch (err) {
      logger.error(
        '[useUpcomingEscrowReleases] Failed to process releases',
        err instanceof Error ? err : new Error(String(err))
      );
      return [];
    }
  }, [transactions]);

  return {
    items,
    isLoading,
    error,
    refresh,
  };
}

export default useUpcomingEscrowReleases;
