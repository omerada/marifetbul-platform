'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconColor?: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'orange';
  className?: string;
}

const iconColorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
};

const changeColorClasses = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-gray-600',
};

export function StatsCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  icon,
  iconColor = 'blue',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('p-6 transition-shadow hover:shadow-md', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-gray-600">{title}</p>
          <p className="mb-1 text-2xl font-bold text-gray-900">{value}</p>

          <div className="flex items-center space-x-2">
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {change && (
              <p
                className={cn(
                  'text-sm font-medium',
                  changeColorClasses[changeType]
                )}
              >
                {change}
              </p>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              iconColorClasses[iconColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
