'use client';

/**
 * ================================================
 * JOB STATS CARD COMPONENT
 * ================================================
 * Reusable stats card for job dashboard
 *
 * Features:
 * - Trend indicators (up/down)
 * - Color-coded stats
 * - Click-to-filter functionality
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Dashboard Integration - Task 3
 */

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface JobStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: {
    ring: 'ring-blue-500',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
  },
  green: {
    ring: 'ring-green-500',
    text: 'text-green-700',
    bg: 'bg-green-50',
    icon: 'text-green-600',
  },
  yellow: {
    ring: 'ring-yellow-500',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
  },
  red: {
    ring: 'ring-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    icon: 'text-red-600',
  },
  gray: {
    ring: 'ring-gray-500',
    text: 'text-gray-700',
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
  },
};

/**
 * Job Statistics Card Component
 *
 * Displays a single metric with optional trend indicator
 */
export function JobStatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
  isActive = false,
  onClick,
  className = '',
}: JobStatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        'p-4 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        isActive && `ring-2 ${colors.ring}`,
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={cn('text-3xl font-bold', colors.text)}>
              {typeof value === 'number'
                ? value.toLocaleString('tr-TR')
                : value}
            </p>
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-sm font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={cn('rounded-lg p-3', colors.bg)}>
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </div>
      </div>
    </Card>
  );
}

/**
 * Grid of Job Stats Cards
 */
export interface JobStatsGridProps {
  stats: Array<JobStatsCardProps>;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function JobStatsGrid({
  stats,
  columns = 4,
  className = '',
}: JobStatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <JobStatsCard key={index} {...stat} />
      ))}
    </div>
  );
}
