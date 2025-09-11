'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
}

export function Progress({
  value,
  max = 100,
  className,
  showPercentage = false,
}: ProgressProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn('w-full', className)}>
      {showPercentage && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">İlerleme</span>
          <span className="text-sm font-medium text-blue-600">
            {percentage}%
          </span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
