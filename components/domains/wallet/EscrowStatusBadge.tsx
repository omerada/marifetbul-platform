/**
 * ================================================
 * ESCROW STATUS BADGE COMPONENT
 * ================================================
 * Reusable badge component for displaying escrow payment status
 *
 * Features:
 * - Color-coded status indicators
 * - Icon support
 * - Compact and inline-friendly
 * - Accessibility support
 * - FROZEN status support for disputes
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Escrow System Enhancement
 */

'use client';

import React from 'react';
import {
  Lock,
  Unlock,
  Clock,
  AlertCircle,
  CheckCircle,
  Snowflake,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// ============================================================================
// TYPES
// ============================================================================

export type EscrowPaymentStatus =
  | 'HELD'
  | 'FROZEN'
  | 'RELEASED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING_RELEASE';

export interface EscrowStatusBadgeProps {
  /** Payment/Escrow status */
  status: EscrowPaymentStatus;

  /** Show icon alongside text */
  showIcon?: boolean;

  /** Compact size */
  compact?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG: Record<
  EscrowPaymentStatus,
  {
    label: string;
    color: 'yellow' | 'blue' | 'green' | 'red' | 'gray' | 'purple' | 'cyan';
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }
> = {
  HELD: {
    label: 'Emanette',
    color: 'yellow',
    icon: Lock,
    description: 'Ödeme güvenli şekilde tutuluyor',
  },
  FROZEN: {
    label: 'Donduruldu',
    color: 'cyan',
    icon: Snowflake,
    description: 'İhtilaf nedeniyle donduruldu',
  },
  PENDING_RELEASE: {
    label: 'Serbest Bırakılıyor',
    color: 'blue',
    icon: Clock,
    description: 'Ödeme serbest bırakılmak üzere',
  },
  RELEASED: {
    label: 'Serbest Bırakıldı',
    color: 'green',
    icon: Unlock,
    description: 'Ödeme satıcıya aktarıldı',
  },
  REFUNDED: {
    label: 'İade Edildi',
    color: 'purple',
    icon: CheckCircle,
    description: 'Tam iade yapıldı',
  },
  PARTIALLY_REFUNDED: {
    label: 'Kısmi İade',
    color: 'gray',
    icon: AlertCircle,
    description: 'Kısmi iade yapıldı',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export function EscrowStatusBadge({
  status,
  showIcon = true,
  compact = false,
  className = '',
}: EscrowStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Color mapping for Badge component
  const colorMap = {
    yellow: 'warning',
    blue: 'default',
    green: 'success',
    red: 'destructive',
    gray: 'secondary',
    purple: 'default',
    cyan: 'default',
  } as const;

  const badgeVariant = colorMap[config.color];

  return (
    <Badge
      variant={badgeVariant}
      className={`flex items-center gap-1.5 ${compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1'} ${className}`}
      title={config.description}
    >
      {showIcon && <Icon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />}
      <span className="font-medium">{config.label}</span>
    </Badge>
  );
}

/**
 * Get status configuration for external use
 */
export function getEscrowStatusConfig(status: EscrowPaymentStatus) {
  return STATUS_CONFIG[status];
}

/**
 * Get status color class for Tailwind CSS
 */
export function getEscrowStatusColorClass(status: EscrowPaymentStatus): string {
  const config = STATUS_CONFIG[status];
  return `bg-${config.color}-100 text-${config.color}-800 border-${config.color}-200`;
}

export default EscrowStatusBadge;
