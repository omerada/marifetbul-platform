/**
 * ================================================
 * TRANSACTION HELPERS
 * ================================================
 * Utility functions for transaction display
 * Centralizes transaction type logic and UI configurations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1
 */

import { type ReactElement } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  Lock,
  Unlock,
  DollarSign,
  RefreshCw,
  Receipt,
  Target, // Sprint 1 - Story 2.3: Milestone icon
} from 'lucide-react';
import { TransactionType } from '@/types/business/features/wallet';

// ============================================================================
// TYPE LABELS
// ============================================================================

// Sprint 1 - Story 2.3: Added MILESTONE_PAYMENT label
const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  [TransactionType.CREDIT]: 'Gelen Para',
  [TransactionType.DEBIT]: 'Giden Para',
  [TransactionType.ESCROW_HOLD]: 'Emanet Tutuldu',
  [TransactionType.ESCROW_RELEASE]: 'Emanet Serbest',
  [TransactionType.MILESTONE_PAYMENT]: 'Milestone Ödemesi', // Sprint 1 - Story 2.3
  [TransactionType.PAYOUT]: 'Para Çekme',
  [TransactionType.REFUND]: 'İade',
  [TransactionType.FEE]: 'Komisyon',
};

/**
 * Get human-readable label for transaction type
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type] || type;
}

// ============================================================================
// BADGE VARIANTS
// ============================================================================

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'destructive';

// Sprint 1 - Story 2.3: Added MILESTONE_PAYMENT badge variant
const TRANSACTION_TYPE_BADGE_VARIANTS: Record<TransactionType, BadgeVariant> = {
  [TransactionType.CREDIT]: 'success',
  [TransactionType.DEBIT]: 'warning',
  [TransactionType.ESCROW_HOLD]: 'secondary',
  [TransactionType.ESCROW_RELEASE]: 'default',
  [TransactionType.MILESTONE_PAYMENT]: 'success', // Sprint 1 - Story 2.3 (purple variant)
  [TransactionType.PAYOUT]: 'warning',
  [TransactionType.REFUND]: 'default',
  [TransactionType.FEE]: 'destructive',
};

/**
 * Get badge variant for transaction type
 */
export function getTransactionTypeBadgeVariant(
  type: TransactionType
): BadgeVariant {
  return TRANSACTION_TYPE_BADGE_VARIANTS[type] || 'default';
}

// ============================================================================
// ICON CONFIGURATION
// ============================================================================

interface IconConfig {
  icon: ReactElement;
  colorClass: string;
}

// Sprint 1 - Story 2.3: Added MILESTONE_PAYMENT icon config
const TRANSACTION_TYPE_ICONS: Record<TransactionType, IconConfig> = {
  [TransactionType.CREDIT]: {
    icon: <ArrowDownCircle className="h-5 w-5" />,
    colorClass: 'bg-green-100 text-green-600',
  },
  [TransactionType.DEBIT]: {
    icon: <ArrowUpCircle className="h-5 w-5" />,
    colorClass: 'bg-red-100 text-red-600',
  },
  [TransactionType.ESCROW_HOLD]: {
    icon: <Lock className="h-5 w-5" />,
    colorClass: 'bg-yellow-100 text-yellow-600',
  },
  [TransactionType.ESCROW_RELEASE]: {
    icon: <Unlock className="h-5 w-5" />,
    colorClass: 'bg-blue-100 text-blue-600',
  },
  [TransactionType.MILESTONE_PAYMENT]: {
    icon: <Target className="h-5 w-5" />, // Sprint 1 - Story 2.3: Milestone icon
    colorClass: 'bg-purple-100 text-purple-600',
  },
  [TransactionType.PAYOUT]: {
    icon: <DollarSign className="h-5 w-5" />,
    colorClass: 'bg-indigo-100 text-indigo-600', // Changed from purple to indigo
  },
  [TransactionType.REFUND]: {
    icon: <RefreshCw className="h-5 w-5" />,
    colorClass: 'bg-orange-100 text-orange-600',
  },
  [TransactionType.FEE]: {
    icon: <Receipt className="h-5 w-5" />,
    colorClass: 'bg-gray-100 text-gray-600',
  },
};

/**
 * Get icon configuration for transaction type
 */
export function getTransactionIcon(type: TransactionType): IconConfig {
  return (
    TRANSACTION_TYPE_ICONS[type] || {
      icon: <Clock className="h-5 w-5" />,
      colorClass: 'bg-gray-100 text-gray-600',
    }
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if transaction is incoming (positive amount)
 */
export function isIncomingTransaction(amount: number): boolean {
  return amount > 0;
}

/**
 * Check if transaction is outgoing (negative amount)
 */
export function isOutgoingTransaction(amount: number): boolean {
  return amount < 0;
}

/**
 * Get amount color class based on value
 */
export function getAmountColorClass(amount: number): string {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
}

/**
 * Format amount with sign
 */
export function formatAmountWithSign(amount: number): string {
  return amount >= 0 ? `+${amount}` : `${amount}`;
}

/**
 * Check if transaction is pending/processing
 */
export function isTransactionPending(type: TransactionType): boolean {
  return [TransactionType.ESCROW_HOLD].includes(type);
}

/**
 * Check if transaction is completed/success
 * Sprint 1 - Story 2.3: Added MILESTONE_PAYMENT to completed types
 */
export function isTransactionCompleted(type: TransactionType): boolean {
  return [
    TransactionType.CREDIT,
    TransactionType.ESCROW_RELEASE,
    TransactionType.MILESTONE_PAYMENT, // Sprint 1 - Story 2.3
  ].includes(type);
}

/**
 * Check if transaction is failed/rejected
 */
export function isTransactionFailed(_type: TransactionType): boolean {
  // Currently no failed transaction types in enum
  return false;
}
