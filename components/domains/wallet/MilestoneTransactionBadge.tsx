/**
 * ================================================
 * MILESTONE TRANSACTION BADGE - Sprint 1 Story 1.6
 * ================================================
 * Special badge for milestone payment transactions
 * Displays milestone info in wallet transaction history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import { CheckCircle2, Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// ================================================
// TYPES
// ================================================

export interface MilestoneTransactionBadgeProps {
  /** Milestone sequence number (e.g., 2 for "2/5") */
  sequence: number;

  /** Total milestone count in order */
  totalCount: number;

  /** Milestone title */
  title: string;

  /** Order ID for linking */
  orderId?: string;

  /** Compact mode (smaller badge) */
  compact?: boolean;

  /** Show link to order */
  showLink?: boolean;
}

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * MilestoneTransactionBadge Component
 *
 * Displays milestone info in transaction descriptions
 * Format: "Milestone 2/5: Logo Tasarımı"
 *
 * @example
 * ```tsx
 * <MilestoneTransactionBadge
 *   sequence={2}
 *   totalCount={5}
 *   title="Logo Tasarımı"
 *   orderId="550e8400-e29b-41d4-a716-446655440000"
 *   showLink
 * />
 * ```
 */
export function MilestoneTransactionBadge({
  sequence,
  totalCount,
  title,
  orderId,
  compact = false,
  showLink = true,
}: MilestoneTransactionBadgeProps) {
  const badgeContent = (
    <div
      className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}
    >
      <Package className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
      <div className="flex items-center gap-1">
        <span className="font-semibold">
          Milestone {sequence}/{totalCount}:
        </span>
        <span className="truncate">{title}</span>
      </div>
      <CheckCircle2
        className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} text-green-600`}
      />
    </div>
  );

  if (showLink && orderId) {
    return (
      <Link href={`/dashboard/orders/${orderId}`} passHref>
        <Badge
          variant="outline"
          className="group inline-flex cursor-pointer items-center gap-2 border-purple-300 bg-purple-50 text-purple-700 transition-all hover:border-purple-400 hover:bg-purple-100"
        >
          {badgeContent}
          <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </Badge>
      </Link>
    );
  }

  return (
    <Badge
      variant="outline"
      className="border-purple-300 bg-purple-50 text-purple-700"
    >
      {badgeContent}
    </Badge>
  );
}

export default MilestoneTransactionBadge;
