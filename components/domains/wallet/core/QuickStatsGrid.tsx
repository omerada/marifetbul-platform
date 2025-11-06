import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui';

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
 * Displays a grid of quick statistics
 */
export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const getIcon = (type: QuickStat['icon']) => {
    switch (type) {
      case 'up':
        return <ArrowUpRight className="h-4 w-4" />;
      case 'down':
        return <ArrowDownRight className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'package':
        return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-xs">{stat.label}</span>
            {getIcon(stat.icon)}
          </div>
          <div className="text-xl font-bold">{stat.value}</div>
          {stat.change !== undefined && (
            <div
              className={`mt-1 text-xs ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.change >= 0 ? '+' : ''}
              {stat.change}% bu ay
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
