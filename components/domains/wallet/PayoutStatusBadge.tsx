/**
 * ================================================
 * PAYOUT STATUS BADGE COMPONENT
 * ================================================
 * Visual status indicator for payout requests
 *
 * Features:
 * - Color-coded status badges
 * - Icon indicators
 * - Hover tooltips
 * - Accessible design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Wallet Withdraw System
 */

'use client';

import React from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Ban,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PayoutStatus } from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface PayoutStatusBadgeProps {
  /** Payout status */
  status: PayoutStatus;

  /** Show icon */
  showIcon?: boolean;

  /** Badge size */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<
  PayoutStatus,
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'destructive' | 'secondary';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  PENDING: {
    label: 'Beklemede',
    variant: 'warning',
    icon: Clock,
    description: 'Talep admin onayı bekliyor',
  },
  PROCESSING: {
    label: 'İşleniyor',
    variant: 'default',
    icon: Loader2,
    description: 'Banka transferi işleniyor',
  },
  COMPLETED: {
    label: 'Tamamlandı',
    variant: 'success',
    icon: CheckCircle,
    description: 'Para hesabınıza ulaştı',
  },
  FAILED: {
    label: 'Başarısız',
    variant: 'destructive',
    icon: XCircle,
    description: 'Transfer başarısız oldu',
  },
  CANCELLED: {
    label: 'İptal Edildi',
    variant: 'secondary',
    icon: Ban,
    description: 'Talep iptal edildi',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PayoutStatusBadge Component
 *
 * Displays a color-coded status badge for payout requests
 *
 * @example
 * ```tsx
 * <PayoutStatusBadge
 *   status="COMPLETED"
 *   showIcon
 *   size="md"
 * />
 * ```
 */
export function PayoutStatusBadge({
  status,
  showIcon = true,
  size = 'md',
  className = '',
}: PayoutStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  if (!config) {
    return (
      <Badge variant="secondary" className={className}>
        <AlertCircle className="mr-1 h-3 w-3" />
        Bilinmeyen Durum
      </Badge>
    );
  }

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1.5 font-medium ${sizeClasses[size]} ${className}`}
      title={config.description}
    >
      {showIcon && (
        <Icon
          className={`${iconSizeClasses[size]} ${status === 'PROCESSING' ? 'animate-spin' : ''}`}
        />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}

/**
 * Get status color for custom styling
 */
export function getPayoutStatusColor(status: PayoutStatus): string {
  const config = STATUS_CONFIG[status];
  if (!config) return 'gray';

  const colorMap = {
    success: 'green',
    warning: 'yellow',
    destructive: 'red',
    default: 'blue',
    secondary: 'gray',
  };

  return colorMap[config.variant];
}

/**
 * Get status description
 */
export function getPayoutStatusDescription(status: PayoutStatus): string {
  return STATUS_CONFIG[status]?.description || 'Bilinmeyen durum';
}

/**
 * Check if status is final (completed/failed/cancelled)
 */
export function isPayoutStatusFinal(status: PayoutStatus): boolean {
  return ['COMPLETED', 'FAILED', 'CANCELED', 'CANCELLED'].includes(status);
}

/**
 * Check if status is in progress
 */
export function isPayoutStatusInProgress(status: PayoutStatus): boolean {
  return ['PENDING', 'APPROVED', 'PROCESSING'].includes(status);
}

export default PayoutStatusBadge;
