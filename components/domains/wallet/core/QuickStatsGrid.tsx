import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import { StatsCardCompact } from '@/components/domains/dashboard/widgets/StatsCard';

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon: 'up' | 'down' | 'trending' | 'package';
}

interface QuickStatsGridProps {
  stats: QuickStat[];
}

/**
 * Quick Stats Grid Component
 * Displays a grid of quick statistics using unified StatsCardCompact
 */
export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const getIcon = (type: QuickStat['icon']) => {
    switch (type) {
      case 'up':
        return ArrowUpRight;
      case 'down':
        return ArrowDownRight;
      case 'trending':
        return TrendingUp;
      case 'package':
        return Package;
    }
  };

  const getIconColor = (type: QuickStat['icon']): string => {
    switch (type) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      case 'trending':
        return 'blue';
      case 'package':
        return 'purple';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCardCompact
          key={index}
          data={{
            id: `quick-stat-${index}`,
            title: stat.label,
            value:
              typeof stat.value === 'number'
                ? stat.value.toLocaleString()
                : stat.value,
            icon: getIcon(stat.icon),
            iconColor: getIconColor(stat.icon),
            ...(stat.change !== undefined && {
              trend: {
                percentage: Math.abs(stat.change),
                direction: stat.change >= 0 ? 'up' : 'down',
                isPositive: stat.change >= 0,
                label: 'bu ay',
              },
            }),
          }}
        />
      ))}
    </div>
  );
}
