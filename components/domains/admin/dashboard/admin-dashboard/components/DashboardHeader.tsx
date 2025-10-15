/**
 * DashboardHeader Component
 *
 * Dashboard header with title, status, and actions
 */

import { BarChart3, Clock, Calendar, RefreshCw } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { DashboardHeaderProps } from '../types/adminDashboardTypes';

export function DashboardHeader({
  isLoading,
  onRefresh,
  lastUpdated,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
      <div className="space-y-2">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Yönetici Paneli
            </h1>
            <p className="text-gray-600">
              Hoş geldiniz! Platformunuzda neler olduğunu görün.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            <span>Sistem Sağlıklı</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>
              Son güncelleme:{' '}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString('tr-TR')
                : new Date().toLocaleTimeString('tr-TR')}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-gray-300">
            <Calendar className="mr-2 h-4 w-4" />
            Son 30 Gün
          </Button>
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            variant="primary"
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"
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
