import { Card } from '@/components/ui';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

/**
 * Reusable Wallet Card Component
 * Displays financial metrics with icon and optional trend
 */
export function WalletCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  trend,
  onClick,
  className,
}: WalletCardProps) {
  return (
    <Card
      className={cn(
        'p-6 transition-all',
        onClick && 'hover:border-primary/50 cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground mb-2 text-sm">{title}</p>
          <h3 className="mb-1 text-2xl font-bold">{value}</h3>
          {subtitle && (
            <p className="text-muted-foreground text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-muted-foreground text-xs">son 30 gün</span>
            </div>
          )}
        </div>
        <div className={cn('bg-primary/10 rounded-full p-3', iconClassName)}>
          <Icon className="text-primary h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
