/**
 * ================================================
 * COMMENT FILTER BAR COMPONENT
 * ================================================
 * Filter bar for admin comment moderation
 * Includes status, date range, and search filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import {
  Filter,
  Calendar,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  List,
} from 'lucide-react';
import type { CommentModerationFilters } from '@/hooks/business/moderation';

// ================================================
// TYPES
// ================================================

export interface CommentFilterBarProps {
  filters: CommentModerationFilters;
  onFilterChange: (filters: CommentModerationFilters) => void;
  onClearFilters: () => void;
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    spam: number;
    total: number;
  };
}

type StatusOption = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';

// ================================================
// CONSTANTS
// ================================================

const STATUS_OPTIONS: Array<{
  value: StatusOption;
  label: string;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    value: 'ALL',
    label: 'Tümü',
    icon: <List className="h-4 w-4" />,
    color: 'gray',
  },
  {
    value: 'PENDING',
    label: 'Bekleyen',
    icon: <Clock className="h-4 w-4" />,
    color: 'yellow',
  },
  {
    value: 'APPROVED',
    label: 'Onaylı',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'green',
  },
  {
    value: 'REJECTED',
    label: 'Reddedilen',
    icon: <XCircle className="h-4 w-4" />,
    color: 'red',
  },
  {
    value: 'SPAM',
    label: 'Spam',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'orange',
  },
];

// ================================================
// COMPONENT
// ================================================

export function CommentFilterBar({
  filters,
  onFilterChange,
  onClearFilters,
  stats,
}: CommentFilterBarProps) {
  // ================================================
  // COMPUTED
  // ================================================

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.startDate ||
    filters.endDate ||
    filters.hasReports;

  const activeFilterCount = [
    filters.status !== 'ALL',
    filters.startDate,
    filters.endDate,
    filters.hasReports,
  ].filter(Boolean).length;

  // ================================================
  // HANDLERS
  // ================================================

  const handleStatusChange = (status: StatusOption) => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  const handleDateRangeChange = (
    type: 'start' | 'end',
    value: string | undefined
  ) => {
    onFilterChange({
      ...filters,
      [type === 'start' ? 'startDate' : 'endDate']: value,
    });
  };

  const handleToggleReportsFilter = () => {
    onFilterChange({
      ...filters,
      hasReports: !filters.hasReports,
    });
  };

  const getStatusColor = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'orange':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusCount = (status: StatusOption): number => {
    if (!stats) return 0;
    switch (status) {
      case 'ALL':
        return stats.total;
      case 'PENDING':
        return stats.pending;
      case 'APPROVED':
        return stats.approved;
      case 'REJECTED':
        return stats.rejected;
      case 'SPAM':
        return stats.spam;
      default:
        return 0;
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtreler</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
          >
            <X className="h-4 w-4" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Status Filter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Durum
        </label>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const isActive = filters.status === option.value;
            const count = getStatusCount(option.value);

            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? getStatusColor(option.color) + ' ring-2 ring-offset-2'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
                {stats && (
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                      isActive ? 'bg-white/50' : 'bg-gray-100'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Calendar className="h-4 w-4" />
          <span>Tarih Aralığı</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="startDate"
              className="mb-1 block text-xs text-gray-600"
            >
              Başlangıç
            </label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate || ''}
              onChange={(e) =>
                handleDateRangeChange('start', e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="mb-1 block text-xs text-gray-600"
            >
              Bitiş
            </label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate || ''}
              onChange={(e) =>
                handleDateRangeChange('end', e.target.value || undefined)
              }
              min={filters.startDate}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Diğer Filtreler
        </label>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
            <input
              type="checkbox"
              checked={filters.hasReports || false}
              onChange={handleToggleReportsFilter}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Sadece şikayet edilen yorumlar
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>{activeFilterCount}</strong> filtre aktif
            {stats && (
              <>
                {' • '}
                <strong>{stats.total}</strong> yorum gösteriliyor
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
