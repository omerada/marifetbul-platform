/**
 * ================================================
 * PLATFORM METRICS CARD COMPONENT
 * ================================================
 * Displays key platform metrics in card layout
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.2
 */

'use client';

import { Card } from '@/components/ui';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  className?: string;
}

export function PlatformMetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  subtitle,
  className = '',
}: MetricCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
          )}
          {change !== undefined && (
            <div
              className={`mt-2 flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}
            >
              <span>{getTrendIcon()}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-muted-foreground text-xs">
                geçen döneme göre
              </span>
            </div>
          )}
        </div>
        <div className="bg-primary/10 text-primary rounded-lg p-3">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

export default PlatformMetricCard;
