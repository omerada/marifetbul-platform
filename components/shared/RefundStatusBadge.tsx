/**
 * ================================================
 * REFUND STATUS BADGE COMPONENT
 * ================================================
 * Reusable badge component for displaying refund status
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Ban,
} from 'lucide-react';
import { RefundStatus } from '@/lib/api/refunds';

// ================================================
// TYPES
// ================================================

interface RefundStatusBadgeProps {
  status: RefundStatus | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// ================================================
// COMPONENT
// ================================================

export function RefundStatusBadge({
  status,
  showIcon = true,
  size = 'md',
}: RefundStatusBadgeProps) {
  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge
      className={`inline-flex items-center gap-1.5 ${config.className} ${sizeClasses[size]}`}
      variant="secondary"
    >
      {showIcon && <config.icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function getStatusConfig(status: RefundStatus | string) {
  const configs: Record<
    string,
    {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      className: string;
    }
  > = {
    [RefundStatus.PENDING]: {
      label: 'Beklemede',
      icon: Clock,
      className: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
    },
    [RefundStatus.APPROVED]: {
      label: 'Onaylandı',
      icon: CheckCircle,
      className: 'bg-blue-500/10 text-blue-700 border-blue-200',
    },
    [RefundStatus.REJECTED]: {
      label: 'Reddedildi',
      icon: XCircle,
      className: 'bg-red-500/10 text-red-700 border-red-200',
    },
    [RefundStatus.PROCESSING]: {
      label: 'İşleniyor',
      icon: Loader2,
      className: 'bg-purple-500/10 text-purple-700 border-purple-200',
    },
    [RefundStatus.COMPLETED]: {
      label: 'Tamamlandı',
      icon: CheckCircle,
      className: 'bg-green-500/10 text-green-700 border-green-200',
    },
    [RefundStatus.FAILED]: {
      label: 'Başarısız',
      icon: AlertCircle,
      className: 'bg-red-500/10 text-red-700 border-red-200',
    },
    [RefundStatus.CANCELLED]: {
      label: 'İptal Edildi',
      icon: Ban,
      className: 'bg-gray-500/10 text-gray-700 border-gray-200',
    },
  };

  return (
    configs[status] || {
      label: status,
      icon: Clock,
      className: 'bg-gray-500/10 text-gray-700 border-gray-200',
    }
  );
}

// ================================================
// EXPORT
// ================================================

export default RefundStatusBadge;
