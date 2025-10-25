/**
 * ================================================
 * ADMIN PAYOUT STATUS BADGE
 * ================================================
 * Display payout status with color coding and icons
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 26, 2025
 */

'use client';

import { PayoutStatus } from '@/types/business/features/wallet';
import {
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  Ban,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface AdminPayoutStatusBadgeProps {
  status: PayoutStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// ================================================
// CONSTANTS
// ================================================

const STATUS_CONFIG: Record<
  PayoutStatus,
  {
    label: string;
    icon: LucideIcon;
    colors: {
      bg: string;
      text: string;
      border: string;
    };
  }
> = {
  PENDING: {
    label: 'Beklemede',
    icon: Clock,
    colors: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
    },
  },
  PROCESSING: {
    label: 'İşleniyor',
    icon: Loader,
    colors: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
  },
  COMPLETED: {
    label: 'Tamamlandı',
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
  },
  FAILED: {
    label: 'Başarısız',
    icon: XCircle,
    colors: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
    },
  },
  CANCELLED: {
    label: 'İptal Edildi',
    icon: Ban,
    colors: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
    },
  },
};

const SIZE_CONFIG = {
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

export const AdminPayoutStatusBadge: React.FC<AdminPayoutStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border font-medium',
        config.colors.bg,
        config.colors.text,
        config.colors.border,
        sizeConfig.padding,
        sizeConfig.text,
        sizeConfig.gap,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            sizeConfig.icon,
            status === 'PROCESSING' && 'animate-spin'
          )}
        />
      )}
      {config.label}
    </span>
  );
};

AdminPayoutStatusBadge.displayName = 'AdminPayoutStatusBadge';
