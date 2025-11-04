/**
 * ================================================
 * WALLET CARD - Generic Metric Display Card
 * ================================================
 * Reusable card component for displaying financial metrics
 *
 * Features:
 * - Icon with customizable color
 * - Value display with formatting
 * - Optional subtitle
 * - Trend indicator
 * - Click handler support
 * - Loading state
 * - Responsive design
 *
 * Sprint 1 - Story 1.2 - Card Standardization
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import { Card } from '@/components/ui';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import { TrendingUp, TrendingDown } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface WalletCardProps {
  /** Card title */
  title: string;

  /** Main value to display */
  value: string | number;

  /** Optional subtitle */
  subtitle?: string;

  /** Icon component */
  icon: LucideIcon;

  /** Custom icon container className */
  iconClassName?: string;

  /** Trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };

  /** Click handler */
  onClick?: () => void;

  /** Loading state */
  isLoading?: boolean;

  /** Custom className */
  className?: string;

  /** Card variant */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * WalletCard Component
 *
 * Generic card for displaying wallet metrics
 *
 * @example
 * ```tsx
 * <WalletCard
 *   title="Toplam Bakiye"
 *   value="1,500.00 TL"
 *   subtitle="Kullanılabilir"
 *   icon={Wallet}
 *   trend={{ value: 12.5, isPositive: true }}
 *   onClick={() => router.push('/wallet')}
 * />
 * ```
 */
export function WalletCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  trend,
  onClick,
  isLoading = false,
  className,
  variant = 'default',
}: WalletCardProps) {
  // Variant styles
  const variantStyles = {
    default: 'border-gray-200 hover:border-gray-300',
    primary: 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100',
    success: 'border-green-200 bg-gradient-to-br from-green-50 to-green-100',
    warning:
      'border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100',
    danger: 'border-red-200 bg-gradient-to-br from-red-50 to-red-100',
  };

  const iconVariantStyles = {
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-blue-500 text-white',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    danger: 'bg-red-500 text-white',
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-6 transition-all',
        variantStyles[variant],
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground mb-2 text-sm font-medium">
            {title}
          </p>
          <h3 className="mb-1 text-2xl font-bold tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground text-xs">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        <div
          className={cn(
            'rounded-full p-3',
            iconClassName || iconVariantStyles[variant]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

export default WalletCard;
