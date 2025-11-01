/**
 * ================================================
 * TRANSACTION HELPERS
 * ================================================
 * Shared utilities for transaction display components
 */

import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  AlertCircle,
  CreditCard,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

// ================================================
// TYPE LABELS
// ================================================

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  CREDIT: 'Gelen Para',
  DEBIT: 'Giden Para',
  ESCROW_HOLD: 'Emanet Tutuldu',
  ESCROW_RELEASE: 'Emanet Serbest',
  PAYOUT: 'Para Çekme',
  PAYOUT_REQUESTED: 'Çekim Talep',
  PAYOUT_COMPLETED: 'Çekim Tamamlandı',
  REFUND: 'İade',
  REFUND_ISSUED: 'İade Yapıldı',
  FEE: 'Komisyon',
  PAYMENT_RECEIVED: 'Ödeme Alındı',
  PAYMENT_RELEASED: 'Ödeme Serbest',
  COMMISSION_RECEIVED: 'Komisyon Alındı',
};

export function getTransactionTypeLabel(type: string): string {
  return TRANSACTION_TYPE_LABELS[type] || type;
}

// ================================================
// BADGE VARIANTS
// ================================================

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'secondary'
  | 'destructive';

export function getTransactionTypeBadgeVariant(type: string): BadgeVariant {
  if (
    type.includes('CREDIT') ||
    type.includes('RECEIVED') ||
    type.includes('RELEASE')
  ) {
    return 'success';
  }
  if (type.includes('DEBIT') || type.includes('PAYOUT')) {
    return 'warning';
  }
  if (type.includes('ESCROW') || type.includes('HOLD')) {
    return 'secondary';
  }
  if (type.includes('REFUND')) {
    return 'default';
  }
  return 'default';
}

// ================================================
// ICONS
// ================================================

interface TransactionIconConfig {
  icon: React.ReactElement;
  colorClass: string;
}

export function getTransactionIcon(type: string): TransactionIconConfig {
  const iconSize = 'h-4 w-4';

  if (
    type.includes('CREDIT') ||
    type.includes('RECEIVED') ||
    type.includes('RELEASE')
  ) {
    return {
      icon: <ArrowDownCircle className={iconSize} />,
      colorClass: 'bg-green-100 text-green-600',
    };
  }

  if (type.includes('PAYOUT')) {
    return {
      icon: <ArrowUpCircle className={iconSize} />,
      colorClass: 'bg-blue-100 text-blue-600',
    };
  }

  if (type.includes('ESCROW') || type.includes('HOLD')) {
    return {
      icon: <Clock className={iconSize} />,
      colorClass: 'bg-amber-100 text-amber-600',
    };
  }

  if (type.includes('DEBIT')) {
    return {
      icon: <AlertCircle className={iconSize} />,
      colorClass: 'bg-red-100 text-red-600',
    };
  }

  if (type.includes('FEE') || type.includes('COMMISSION')) {
    return {
      icon: <CreditCard className={iconSize} />,
      colorClass: 'bg-gray-100 text-gray-600',
    };
  }

  if (type.includes('REFUND')) {
    return {
      icon: <RefreshCw className={iconSize} />,
      colorClass: 'bg-orange-100 text-orange-600',
    };
  }

  return {
    icon: <DollarSign className={iconSize} />,
    colorClass: 'bg-gray-100 text-gray-600',
  };
}

// ================================================
// COLOR HELPERS
// ================================================

export function getAmountColorClass(amount: number): string {
  return amount >= 0 ? 'text-green-600' : 'text-red-600';
}

export function formatAmountWithSign(amount: number): string {
  return amount >= 0 ? `+${amount}` : `${amount}`;
}
