/**
 * ================================================
 * UNIFIED STATUS BADGE COMPONENT
 * ================================================
 * Generic, reusable status badge for all entity types
 *
 * Replaces:
 * - AdminPayoutStatusBadge (2 duplicate copies)
 * - PayoutStatusBadge
 * - RefundStatusBadge
 * - EscrowStatusBadge
 * - ProposalStatusBadge
 *
 * Features:
 * - Config-driven design
 * - Type-safe status mapping
 * - Icon support with animations
 * - Multiple size variants
 * - Consistent color schemes
 * - Accessibility support
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 3 - StatusBadge Consolidation
 */

'use client';

import React from 'react';
import {
  Clock,
  Loader2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Ban,
  AlertCircle,
  Lock,
  Unlock,
  Snowflake,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

/**
 * Supported status types across the platform
 */
export type StatusType =
  | 'PAYOUT'
  | 'REFUND'
  | 'ESCROW'
  | 'PROPOSAL'
  | 'ORDER'
  | 'DISPUTE'
  | 'MODERATION'
  | 'BANK_ACCOUNT';

/**
 * All possible status values
 */
export type StatusValue =
  // Payout statuses
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  // Refund statuses
  | 'APPROVED'
  | 'REJECTED'
  // Escrow statuses
  | 'HELD'
  | 'FROZEN'
  | 'RELEASED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING_RELEASE'
  // Proposal statuses
  | 'ACCEPTED'
  | 'WITHDRAWN'
  // Bank Account statuses
  | 'VERIFIED';

/**
 * Color variants for status badges
 */
export type StatusColor =
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red'
  | 'gray'
  | 'purple'
  | 'cyan';

/**
 * Status configuration
 */
export interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: StatusColor;
  description?: string;
  animated?: boolean;
}

/**
 * Component props
 */
export interface StatusBadgeProps {
  /** Status type (for context) */
  type?: StatusType;

  /** Status value */
  status: StatusValue;

  /** Show icon */
  showIcon?: boolean;

  /** Badge size */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;

  /** Show tooltip with description */
  showTooltip?: boolean;
}

// ================================================
// STATUS CONFIGURATIONS
// ================================================

/**
 * Universal status configuration map
 * Covers all status types across the platform
 */
const STATUS_CONFIGS: Record<StatusValue, StatusConfig> = {
  // Payout & Refund: PENDING
  PENDING: {
    label: 'Beklemede',
    icon: Clock,
    color: 'yellow',
    description: 'Talep işlem bekliyor',
  },

  // Payout & Order: PROCESSING
  PROCESSING: {
    label: 'İşleniyor',
    icon: Loader2,
    color: 'blue',
    description: 'İşlem devam ediyor',
    animated: true,
  },

  // Payout & Refund: COMPLETED
  COMPLETED: {
    label: 'Tamamlandı',
    icon: CheckCircle,
    color: 'green',
    description: 'İşlem başarıyla tamamlandı',
  },

  // Refund: APPROVED
  APPROVED: {
    label: 'Onaylandı',
    icon: CheckCircle,
    color: 'blue',
    description: 'Talep onaylandı',
  },

  // Payout & Refund: FAILED
  FAILED: {
    label: 'Başarısız',
    icon: XCircle,
    color: 'red',
    description: 'İşlem başarısız oldu',
  },

  // Refund & Proposal: REJECTED
  REJECTED: {
    label: 'Reddedildi',
    icon: XCircle,
    color: 'red',
    description: 'Talep reddedildi',
  },

  // Payout & Refund: CANCELLED
  CANCELLED: {
    label: 'İptal Edildi',
    icon: Ban,
    color: 'gray',
    description: 'Talep iptal edildi',
  },

  // Escrow: HELD
  HELD: {
    label: 'Emanette',
    icon: Lock,
    color: 'yellow',
    description: 'Ödeme güvenli şekilde tutuluyor',
  },

  // Escrow: FROZEN
  FROZEN: {
    label: 'Donduruldu',
    icon: Snowflake,
    color: 'cyan',
    description: 'İhtilaf nedeniyle donduruldu',
  },

  // Escrow: PENDING_RELEASE
  PENDING_RELEASE: {
    label: 'Serbest Bırakılıyor',
    icon: Clock,
    color: 'blue',
    description: 'Ödeme serbest bırakılmak üzere',
  },

  // Escrow: RELEASED
  RELEASED: {
    label: 'Serbest Bırakıldı',
    icon: Unlock,
    color: 'green',
    description: 'Ödeme satıcıya aktarıldı',
  },

  // Escrow: REFUNDED
  REFUNDED: {
    label: 'İade Edildi',
    icon: CheckCircle,
    color: 'purple',
    description: 'Tam iade yapıldı',
  },

  // Escrow: PARTIALLY_REFUNDED
  PARTIALLY_REFUNDED: {
    label: 'Kısmi İade',
    icon: AlertCircle,
    color: 'gray',
    description: 'Kısmi iade yapıldı',
  },

  // Proposal: ACCEPTED
  ACCEPTED: {
    label: 'Kabul Edildi',
    icon: CheckCircle2,
    color: 'green',
    description: 'Teklif kabul edildi',
  },

  // Proposal: WITHDRAWN
  WITHDRAWN: {
    label: 'Geri Çekildi',
    icon: Ban,
    color: 'gray',
    description: 'Teklif geri çekildi',
  },

  // Bank Account: VERIFIED
  VERIFIED: {
    label: 'Onaylandı',
    icon: CheckCircle,
    color: 'green',
    description: 'Banka hesabı doğrulandı',
  },
};

/**
 * Color to Tailwind class mapping
 */
const COLOR_CLASSES: Record<
  StatusColor,
  {
    bg: string;
    text: string;
    border: string;
  }
> = {
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
  },
};

/**
 * Size configuration
 */
const SIZE_CONFIGS = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 'h-4 w-4',
    gap: 'gap-2',
  },
};

// ================================================
// COMPONENT
// ================================================

/**
 * StatusBadge Component
 *
 * Universal status badge component for all entity types
 *
 * @example
 * ```tsx
 * // Payout status
 * <StatusBadge type="PAYOUT" status="COMPLETED" showIcon size="md" />
 *
 * // Refund status
 * <StatusBadge type="REFUND" status="APPROVED" showIcon />
 *
 * // Escrow status
 * <StatusBadge type="ESCROW" status="HELD" showIcon showTooltip />
 *
 * // Proposal status
 * <StatusBadge type="PROPOSAL" status="ACCEPTED" />
 * ```
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  showIcon = true,
  size = 'md',
  className = '',
  showTooltip = false,
}) => {
  const config = STATUS_CONFIGS[status];

  // Fallback for unknown status
  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-full border font-medium',
          'border-gray-200 bg-gray-100 text-gray-800',
          SIZE_CONFIGS[size].padding,
          SIZE_CONFIGS[size].text,
          SIZE_CONFIGS[size].gap,
          className
        )}
      >
        <AlertCircle className={cn(SIZE_CONFIGS[size].icon)} />
        Bilinmeyen Durum
      </span>
    );
  }

  const colorClasses = COLOR_CLASSES[config.color];
  const sizeConfig = SIZE_CONFIGS[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        colorClasses.bg,
        colorClasses.text,
        colorClasses.border,
        sizeConfig.padding,
        sizeConfig.text,
        sizeConfig.gap,
        className
      )}
      title={showTooltip && config.description ? config.description : undefined}
      role="status"
      aria-label={`${type ? `${type} status: ` : ''}${config.label}`}
    >
      {showIcon && (
        <Icon
          className={cn(sizeConfig.icon, config.animated && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get status configuration
 */
export function getStatusConfig(status: StatusValue): StatusConfig | undefined {
  return STATUS_CONFIGS[status];
}

/**
 * Get status label
 */
export function getStatusLabel(status: StatusValue): string {
  return STATUS_CONFIGS[status]?.label || 'Bilinmeyen';
}

/**
 * Get status color
 */
export function getStatusColor(status: StatusValue): StatusColor {
  return STATUS_CONFIGS[status]?.color || 'gray';
}

/**
 * Get status description
 */
export function getStatusDescription(status: StatusValue): string | undefined {
  return STATUS_CONFIGS[status]?.description;
}

/**
 * Check if status is final (completed/failed/cancelled)
 */
export function isStatusFinal(status: StatusValue): boolean {
  return [
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REJECTED',
    'WITHDRAWN',
    'RELEASED',
    'REFUNDED',
  ].includes(status);
}

/**
 * Check if status is in progress
 */
export function isStatusInProgress(status: StatusValue): boolean {
  return [
    'PENDING',
    'PROCESSING',
    'APPROVED',
    'HELD',
    'PENDING_RELEASE',
  ].includes(status);
}

/**
 * Check if status is positive (success state)
 */
export function isStatusPositive(status: StatusValue): boolean {
  return ['COMPLETED', 'APPROVED', 'ACCEPTED', 'RELEASED', 'REFUNDED'].includes(
    status
  );
}

/**
 * Check if status is negative (failure state)
 */
export function isStatusNegative(status: StatusValue): boolean {
  return ['FAILED', 'REJECTED', 'CANCELLED', 'WITHDRAWN'].includes(status);
}

// ================================================
// TYPE GUARDS
// ================================================

/**
 * Check if status is a payout status
 */
export function isPayoutStatus(status: string): status is StatusValue {
  return ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(
    status
  );
}

/**
 * Check if status is a refund status
 */
export function isRefundStatus(status: string): status is StatusValue {
  return [
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PROCESSING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
  ].includes(status);
}

/**
 * Check if status is an escrow status
 */
export function isEscrowStatus(status: string): status is StatusValue {
  return [
    'HELD',
    'FROZEN',
    'RELEASED',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'PENDING_RELEASE',
  ].includes(status);
}

/**
 * Check if status is a proposal status
 */
export function isProposalStatus(status: string): status is StatusValue {
  return ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(status);
}

// ================================================
// EXPORTS
// ================================================

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
