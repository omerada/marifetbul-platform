/**
 * ================================================
 * MILESTONE STATUS BADGE COMPONENT
 * ================================================
 * Milestone-specific status badge with extended statuses
 *
 * Features:
 * - Milestone-specific status types
 * - Extended StatusBadge component
 * - Custom icons and colors per milestone status
 * - Tooltips with business context
 * - Accessibility support
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 15, 2025
 * @sprint Sprint 1 - Milestone Payment Frontend
 */

'use client';

import React from 'react';
import {
  Clock,
  PlayCircle,
  Package,
  CheckCircle,
  AlertTriangle,
  Ban,
  type LucideIcon,
} from 'lucide-react';
import { StatusBadge, type StatusColor } from '@/components/shared/StatusBadge';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

/**
 * Milestone status types
 * (Matches backend enum: MilestoneStatus)
 */
export type MilestoneStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'ACCEPTED'
  | 'REVISION_REQUESTED'
  | 'CANCELED';

/**
 * Milestone status configuration
 */
export interface MilestoneStatusConfig {
  label: string;
  icon: LucideIcon;
  color: StatusColor;
  description: string;
  animated?: boolean;
}

/**
 * Component props
 */
export interface MilestoneStatusBadgeProps {
  /** Milestone status */
  status: MilestoneStatus;

  /** Show icon */
  showIcon?: boolean;

  /** Badge size */
  size?: 'sm' | 'md' | 'lg';

  /** Additional CSS classes */
  className?: string;

  /** Show tooltip with description */
  showTooltip?: boolean;

  /** Show sequence number (e.g., "Milestone 1") */
  sequenceNumber?: number;
}

// ================================================
// STATUS CONFIGURATIONS
// ================================================

/**
 * Milestone status configuration map
 */
const MILESTONE_STATUS_CONFIGS: Record<MilestoneStatus, MilestoneStatusConfig> =
  {
    PENDING: {
      label: 'Beklemede',
      icon: Clock,
      color: 'gray',
      description:
        'Milestone henüz başlatılmadı. Freelancer çalışmaya başlayana kadar bekliyor.',
    },

    IN_PROGRESS: {
      label: 'Devam Ediyor',
      icon: PlayCircle,
      color: 'blue',
      description:
        'Freelancer bu milestone üzerinde aktif olarak çalışıyor. Teslimat bekleniyor.',
      animated: false,
    },

    DELIVERED: {
      label: 'Teslim Edildi',
      icon: Package,
      color: 'yellow',
      description:
        'Freelancer çalışmayı teslim etti. Employer onayı bekleniyor.',
    },

    ACCEPTED: {
      label: 'Onaylandı',
      icon: CheckCircle,
      color: 'green',
      description:
        "Employer teslimi onayladı. Ödeme escrow'dan serbest bırakıldı.",
    },

    REVISION_REQUESTED: {
      label: 'Revizyon İstendi',
      icon: AlertTriangle,
      color: 'purple',
      description:
        'Employer revizyon talep etti. Freelancer düzeltme yapmalı ve yeniden teslim etmeli.',
    },

    CANCELED: {
      label: 'İptal Edildi',
      icon: Ban,
      color: 'red',
      description: "Milestone iptal edildi. Ödeme escrow'dan iade edilecek.",
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

// ================================================
// COMPONENT
// ================================================

/**
 * MilestoneStatusBadge Component
 *
 * Displays milestone status with appropriate styling and icon
 *
 * @example
 * ```tsx
 * <MilestoneStatusBadge status="IN_PROGRESS" showIcon size="md" />
 * <MilestoneStatusBadge status="DELIVERED" showIcon showTooltip />
 * <MilestoneStatusBadge status="ACCEPTED" sequenceNumber={1} />
 * ```
 */
export const MilestoneStatusBadge: React.FC<MilestoneStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = '',
  showTooltip = false,
  sequenceNumber,
}) => {
  const config = MILESTONE_STATUS_CONFIGS[status];
  const colorClasses = COLOR_CLASSES[config.color];
  const sizeConfig = SIZE_CONFIGS[size];
  const Icon = config.icon;

  // Fallback for unknown status
  if (!config) {
    return (
      <StatusBadge
        type="ORDER"
        status="PENDING"
        showIcon={showIcon}
        size={size}
        className={className}
        showTooltip={showTooltip}
      />
    );
  }

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
      title={showTooltip ? config.description : undefined}
      role="status"
      aria-label={`Milestone ${sequenceNumber ? `${sequenceNumber} ` : ''}status: ${config.label}`}
    >
      {showIcon && (
        <Icon
          className={cn(sizeConfig.icon, config.animated && 'animate-spin')}
          aria-hidden="true"
        />
      )}
      <span>
        {sequenceNumber && (
          <span className="font-semibold">#{sequenceNumber} </span>
        )}
        {config.label}
      </span>
    </span>
  );
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get milestone status configuration
 */
export function getMilestoneStatusConfig(
  status: MilestoneStatus
): MilestoneStatusConfig | undefined {
  return MILESTONE_STATUS_CONFIGS[status];
}

/**
 * Get milestone status label
 */
export function getMilestoneStatusLabel(status: MilestoneStatus): string {
  return MILESTONE_STATUS_CONFIGS[status]?.label || 'Bilinmeyen';
}

/**
 * Get milestone status color
 */
export function getMilestoneStatusColor(status: MilestoneStatus): StatusColor {
  return MILESTONE_STATUS_CONFIGS[status]?.color || 'gray';
}

/**
 * Get milestone status description
 */
export function getMilestoneStatusDescription(status: MilestoneStatus): string {
  return MILESTONE_STATUS_CONFIGS[status]?.description || 'Durum bilgisi yok';
}

/**
 * Check if milestone is completed (final state)
 */
export function isMilestoneCompleted(status: MilestoneStatus): boolean {
  return status === 'ACCEPTED';
}

/**
 * Check if milestone is in active work state
 */
export function isMilestoneActive(status: MilestoneStatus): boolean {
  return ['IN_PROGRESS', 'DELIVERED', 'REVISION_REQUESTED'].includes(status);
}

/**
 * Check if milestone is pending work
 */
export function isMilestonePending(status: MilestoneStatus): boolean {
  return status === 'PENDING';
}

/**
 * Check if milestone is canceled
 */
export function isMilestoneCanceled(status: MilestoneStatus): boolean {
  return status === 'CANCELED';
}

/**
 * Check if employer action is required
 */
export function requiresEmployerAction(status: MilestoneStatus): boolean {
  return status === 'DELIVERED';
}

/**
 * Check if freelancer action is required
 */
export function requiresFreelancerAction(status: MilestoneStatus): boolean {
  return ['PENDING', 'REVISION_REQUESTED'].includes(status);
}

/**
 * Get next possible status transitions
 */
export function getNextStatusTransitions(
  status: MilestoneStatus,
  userRole: 'FREELANCER' | 'EMPLOYER'
): MilestoneStatus[] {
  // Freelancer transitions
  if (userRole === 'FREELANCER') {
    switch (status) {
      case 'PENDING':
        return ['IN_PROGRESS'];
      case 'IN_PROGRESS':
        return ['DELIVERED'];
      case 'REVISION_REQUESTED':
        return ['DELIVERED'];
      default:
        return [];
    }
  }

  // Employer transitions
  switch (status) {
    case 'DELIVERED':
      return ['ACCEPTED', 'REVISION_REQUESTED'];
    default:
      return [];
  }
}

/**
 * Check if user can transition milestone status
 */
export function canTransitionStatus(
  currentStatus: MilestoneStatus,
  targetStatus: MilestoneStatus,
  userRole: 'FREELANCER' | 'EMPLOYER'
): boolean {
  const validTransitions = getNextStatusTransitions(currentStatus, userRole);
  return validTransitions.includes(targetStatus);
}

// ================================================
// EXPORTS
// ================================================

MilestoneStatusBadge.displayName = 'MilestoneStatusBadge';

export default MilestoneStatusBadge;
