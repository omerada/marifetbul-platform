'use client';

/**
 * Email Verification Badge Component
 * Sprint 1 - Story 1.2: Email Verification Flow
 *
 * Displays user's email verification status with visual indicator
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { CheckCircle2, Mail, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type VerificationStatus =
  | 'verified'
  | 'pending'
  | 'unverified'
  | 'expired';

export interface EmailVerificationBadgeProps {
  /** Verification status */
  status: VerificationStatus;

  /** Show icon */
  showIcon?: boolean;

  /** Badge size */
  size?: 'sm' | 'md' | 'lg';

  /** Custom className */
  className?: string;

  /** Compact mode (icon only) */
  compact?: boolean;
}

/**
 * Get badge configuration based on verification status
 */
function getBadgeConfig(status: VerificationStatus) {
  switch (status) {
    case 'verified':
      return {
        label: 'Doğrulandı',
        icon: CheckCircle2,
        variant: 'success' as const,
        className: 'bg-green-50 text-green-700 border-green-200',
      };
    case 'pending':
      return {
        label: 'Beklemede',
        icon: Clock,
        variant: 'warning' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      };
    case 'expired':
      return {
        label: 'Süresi Doldu',
        icon: AlertCircle,
        variant: 'destructive' as const,
        className: 'bg-red-50 text-red-700 border-red-200',
      };
    case 'unverified':
    default:
      return {
        label: 'Doğrulanmadı',
        icon: Mail,
        variant: 'secondary' as const,
        className: 'bg-gray-50 text-gray-700 border-gray-200',
      };
  }
}

/**
 * Get size classes
 */
function getSizeClasses(size: 'sm' | 'md' | 'lg') {
  switch (size) {
    case 'sm':
      return {
        badge: 'text-xs px-2 py-0.5',
        icon: 'h-3 w-3',
      };
    case 'lg':
      return {
        badge: 'text-sm px-3 py-1.5',
        icon: 'h-5 w-5',
      };
    case 'md':
    default:
      return {
        badge: 'text-xs px-2.5 py-1',
        icon: 'h-4 w-4',
      };
  }
}

/**
 * Email Verification Badge Component
 */
export function EmailVerificationBadge({
  status,
  showIcon = true,
  size = 'md',
  className = '',
  compact = false,
}: EmailVerificationBadgeProps) {
  const config = getBadgeConfig(status);
  const sizeClasses = getSizeClasses(size);
  const Icon = config.icon;

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center justify-center rounded-full border',
          config.className,
          sizeClasses.icon === 'h-3 w-3'
            ? 'h-6 w-6'
            : sizeClasses.icon === 'h-5 w-5'
              ? 'h-10 w-10'
              : 'h-8 w-8',
          className
        )}
        title={config.label}
        aria-label={config.label}
      >
        <Icon className={sizeClasses.icon} />
      </div>
    );
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        config.className,
        sizeClasses.badge,
        className
      )}
    >
      {showIcon && <Icon className={sizeClasses.icon} />}
      <span>{config.label}</span>
    </Badge>
  );
}

/**
 * Inline verification status (for cards/lists)
 */
export interface InlineVerificationStatusProps {
  status: VerificationStatus;
  email?: string;
  className?: string;
}

export function InlineVerificationStatus({
  status,
  email,
  className = '',
}: InlineVerificationStatusProps) {
  const config = getBadgeConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <Icon className={cn('h-4 w-4', config.className.split(' ')[1])} />
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">{email}</span>
        <span className={cn('text-xs', config.className.split(' ')[1])}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

export default EmailVerificationBadge;
