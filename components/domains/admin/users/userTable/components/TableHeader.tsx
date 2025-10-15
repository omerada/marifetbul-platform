/**
 * TableHeader Component
 *
 * Header section with title, user count, and action buttons
 */

'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { CardTitle } from '@/components/ui/Card';
import { Users, Download, RefreshCw } from 'lucide-react';
import { TableHeaderProps } from '../types/userTableTypes';

export function TableHeader({
  title,
  description,
  userCount,
  isLoading,
  onRefresh,
  onExport,
}: TableHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      {/* Title Section */}
      <div className="flex items-center space-x-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {title}
          </CardTitle>
          <p className="mt-1 text-gray-600">{description}</p>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
        {/* User Count Badge */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
          <span>{userCount} kullanıcı yüklendi</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('csv')}
            disabled={isLoading}
            className="border-gray-300 hover:border-blue-300"
          >
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="border-gray-300 hover:border-blue-300"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
        </div>
      </div>
    </div>
  );
}
