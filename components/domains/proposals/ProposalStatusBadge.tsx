import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
  showIcon?: boolean;
}

/**
 * Proposal Status Badge Component
 *
 * Displays proposal status with color coding and optional icon
 *
 * Status colors:
 * - PENDING: Yellow/Amber (waiting for response)
 * - ACCEPTED: Green (success)
 * - REJECTED: Red (negative)
 * - WITHDRAWN: Gray (neutral)
 *
 * @param status - Proposal status
 * @param className - Additional CSS classes
 * @param showIcon - Whether to show status icon
 */
export function ProposalStatusBadge({
  status,
  className = '',
  showIcon = true,
}: ProposalStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: 'Beklemede',
          variant: 'secondary' as const,
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: Clock,
          iconColor: 'text-yellow-600',
        };
      case 'ACCEPTED':
        return {
          label: 'Kabul Edildi',
          variant: 'default' as const,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
        };
      case 'REJECTED':
        return {
          label: 'Reddedildi',
          variant: 'destructive' as const,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          icon: XCircle,
          iconColor: 'text-red-600',
        };
      case 'WITHDRAWN':
        return {
          label: 'Geri Çekildi',
          variant: 'outline' as const,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Ban,
          iconColor: 'text-gray-600',
        };
      default:
        return {
          label: 'Bilinmiyor',
          variant: 'outline' as const,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          icon: Clock,
          iconColor: 'text-gray-600',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`${config.bgColor} ${config.textColor} ${className}`}
    >
      {showIcon && <Icon className={`mr-1 h-3 w-3 ${config.iconColor}`} />}
      {config.label}
    </Badge>
  );
}

/**
 * Get status color for use in other components
 */
export function getStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'ACCEPTED':
      return 'green';
    case 'REJECTED':
      return 'red';
    case 'WITHDRAWN':
      return 'gray';
    default:
      return 'gray';
  }
}

/**
 * Get status label in Turkish
 */
export function getStatusLabel(status: ProposalStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Beklemede';
    case 'ACCEPTED':
      return 'Kabul Edildi';
    case 'REJECTED':
      return 'Reddedildi';
    case 'WITHDRAWN':
      return 'Geri Çekildi';
    default:
      return 'Bilinmiyor';
  }
}
