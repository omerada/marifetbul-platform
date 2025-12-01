'use client';

/**
 * ================================================
 * ADVANCED FILTER PANEL COMPONENT
 * ================================================
 * Comprehensive filtering panel for comment moderation
 * Includes saved presets, multi-select, and advanced options
 *
 * Sprint 3 Day 2: Moderator Dashboard Enhancement
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  Filter,
  Calendar,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  List,
  User,
  FileText,
  Flag,
  ChevronDown,
  ChevronUp,
  Save,
  Star,
} from 'lucide-react';
import type { CommentModerationFilters } from '@/hooks/business/moderation';

// ================================================
// TYPES
// ================================================

export interface FilterPreset {
  id: string;
  name: string;
  filters: CommentModerationFilters;
  icon?: React.ReactNode;
}

export interface AdvancedFilterPanelProps {
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
  presets?: FilterPreset[];
  onSavePreset?: (name: string, filters: CommentModerationFilters) => void;
  onLoadPreset?: (preset: FilterPreset) => void;
}

type StatusOption = 'ALL' | 'pending' | 'approved' | 'rejected' | 'spam';

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
    value: 'pending',
    label: 'Bekleyen',
    icon: <Clock className="h-4 w-4" />,
    color: 'yellow',
  },
  {
    value: 'approved',
    label: 'Onaylı',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'green',
  },
  {
    value: 'rejected',
    label: 'Reddedilen',
    icon: <XCircle className="h-4 w-4" />,
    color: 'red',
  },
  {
    value: 'spam',
    label: 'Spam',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'orange',
  },
];

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'urgent',
    name: 'Acil İnceleme',
    filters: { status: 'pending', hasReports: true },
    icon: <Flag className="h-4 w-4" />,
  },
  {
    id: 'recent-pending',
    name: 'Son Bekleyenler',
    filters: { status: 'pending' },
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'today-approved',
    name: 'Bugün Onaylananlar',
    filters: {
      status: 'approved',
      startDate: new Date().toISOString().split('T')[0],
    },
    icon: <CheckCircle className="h-4 w-4" />,
  },
];

// ================================================
// COMPONENT
// ================================================

export function AdvancedFilterPanel({
  filters,
  onFilterChange,
  onClearFilters,
  stats,
  presets = DEFAULT_PRESETS,
  onSavePreset,
  onLoadPreset,
}: AdvancedFilterPanelProps) {
  // ================================================
  // STATE
  // ================================================

  const [expandedSections, setExpandedSections] = useState({
    status: true,
    dateRange: false,
    advanced: false,
    presets: false,
  });

  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [authorFilter, setAuthorFilter] = useState(filters.search || '');
  const [postIdFilter, setPostIdFilter] = useState(
    filters.postId?.toString() || ''
  );

  // ================================================
  // COMPUTED
  // ================================================

  const hasActiveFilters =
    (filters.status !== undefined && (filters.status as string) !== 'ALL') ||
    filters.startDate ||
    filters.endDate ||
    filters.hasReports ||
    filters.search ||
    filters.postId;

  const activeFilterCount = [
    filters.status !== undefined && (filters.status as string) !== 'ALL',
    filters.startDate,
    filters.endDate,
    filters.hasReports,
    filters.search,
    filters.postId,
  ].filter(Boolean).length;

  // ================================================
  // HANDLERS
  // ================================================

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = (status: StatusOption) => {
    onFilterChange({
      ...filters,
      status: status === 'ALL' ? undefined : status,
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

  const handleAuthorFilterApply = () => {
    onFilterChange({
      ...filters,
      search: authorFilter || undefined,
    });
  };

  const handlePostIdFilterApply = () => {
    onFilterChange({
      ...filters,
      postId: postIdFilter || undefined,
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    if (onLoadPreset) {
      onLoadPreset(preset);
    } else {
      onFilterChange(preset.filters);
    }
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
      case 'pending':
        return stats.pending;
      case 'approved':
        return stats.approved;
      case 'rejected':
        return stats.rejected;
      case 'spam':
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
          <h3 className="text-lg font-semibold text-gray-900">
            Gelişmiş Filtreler
          </h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && onSavePreset && (
            <button
              onClick={() => setShowSavePreset(!showSavePreset)}
              className="flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Save className="h-4 w-4" />
              <span>Kaydet</span>
            </button>
          )}

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
      </div>

      {/* Save Preset Dialog */}
      {showSavePreset && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Filtre Ön Ayarı Kaydet
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Ön ayar adı..."
              className="flex-1 rounded-lg border border-blue-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Kaydet
            </button>
            <button
              onClick={() => {
                setShowSavePreset(false);
                setPresetName('');
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Filter Presets */}
      {presets.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => toggleSection('presets')}
            className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-700"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Ön Ayarlar</span>
            </div>
            {expandedSections.presets ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expandedSections.presets && (
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="flex items-center gap-2 rounded-lg border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
                >
                  {preset.icon}
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Filter */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => toggleSection('status')}
          className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-700"
        >
          <span>Durum Filtresi</span>
          {expandedSections.status ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.status && (
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
        )}
      </div>

      {/* Date Range Filter */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => toggleSection('dateRange')}
          className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-700"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Tarih Aralığı</span>
            {(filters.startDate || filters.endDate) && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                Aktif
              </span>
            )}
          </div>
          {expandedSections.dateRange ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.dateRange && (
          <div className="space-y-3">
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

            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  handleDateRangeChange('start', today);
                  handleDateRangeChange('end', today);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Bugün
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  const dateStr = yesterday.toISOString().split('T')[0];
                  handleDateRangeChange('start', dateStr);
                  handleDateRangeChange('end', dateStr);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Dün
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const weekAgo = new Date(today);
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  handleDateRangeChange(
                    'start',
                    weekAgo.toISOString().split('T')[0]
                  );
                  handleDateRangeChange(
                    'end',
                    today.toISOString().split('T')[0]
                  );
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Son 7 Gün
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const monthAgo = new Date(today);
                  monthAgo.setDate(monthAgo.getDate() - 30);
                  handleDateRangeChange(
                    'start',
                    monthAgo.toISOString().split('T')[0]
                  );
                  handleDateRangeChange(
                    'end',
                    today.toISOString().split('T')[0]
                  );
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Son 30 Gün
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => toggleSection('advanced')}
          className="mb-3 flex w-full items-center justify-between text-sm font-medium text-gray-700"
        >
          <span>Gelişmiş Filtreler</span>
          {expandedSections.advanced ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {expandedSections.advanced && (
          <div className="space-y-3">
            {/* Author Filter */}
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs text-gray-600">
                <User className="h-3.5 w-3.5" />
                <span>Yazar Ara</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  placeholder="Yazar adı..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handleAuthorFilterApply()
                  }
                />
                <button
                  onClick={handleAuthorFilterApply}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Ara
                </button>
              </div>
            </div>

            {/* Post ID Filter */}
            <div>
              <label className="mb-1 flex items-center gap-2 text-xs text-gray-600">
                <FileText className="h-3.5 w-3.5" />
                <span>Gönderi ID</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={postIdFilter}
                  onChange={(e) => setPostIdFilter(e.target.value)}
                  placeholder="Gönderi ID..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  onKeyPress={(e) =>
                    e.key === 'Enter' && handlePostIdFilterApply()
                  }
                />
                <button
                  onClick={handlePostIdFilterApply}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Filtrele
                </button>
              </div>
            </div>

            {/* Reported Comments Toggle */}
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 p-3 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                checked={filters.hasReports || false}
                onChange={handleToggleReportsFilter}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <Flag className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">
                Sadece şikayet edilen yorumlar
              </span>
            </label>
          </div>
        )}
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

export default AdvancedFilterPanel;
