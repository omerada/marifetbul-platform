/**
 * DisputeFilters Component
 * Sprint 1 - Day 1.3: Dispute Filters Component
 *
 * Advanced filtering interface for admin dispute management
 *
 * Features:
 * - Multi-select status filter
 * - Reason dropdown
 * - Date range picker
 * - Order value range
 * - Priority filter
 * - Assigned moderator filter
 * - URL query params for state persistence
 * - Reset filters functionality
 * - Filter count badge
 *
 * @example
 * ```tsx
 * <DisputeFilters
 *   onFiltersChange={(filters) => applyFilters(filters)}
 *   initialFilters={currentFilters}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import {
  Filter,
  X,
  Calendar,
  DollarSign,
  Flag,
  User,
  ChevronDown,
} from 'lucide-react';
import {
  DisputeStatus,
  DisputeReason,
  disputeStatusLabels,
  disputeReasonLabels,
  type DisputeFilters as DisputeFiltersType,
} from '@/types/dispute';

interface DisputeFiltersProps {
  onFiltersChange: (filters: DisputeFiltersType) => void;
  initialFilters?: Partial<DisputeFiltersType>;
  className?: string;
}

type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'ALL';

const priorityLabels: Record<Priority, string> = {
  HIGH: 'Yüksek',
  MEDIUM: 'Orta',
  LOW: 'Düşük',
  ALL: 'Tümü',
};

export const DisputeFilters: React.FC<DisputeFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  className = '',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter states
  const [selectedStatuses, setSelectedStatuses] = useState<DisputeStatus[]>(
    initialFilters.status ? [initialFilters.status] : []
  );
  const [selectedReason, setSelectedReason] = useState<DisputeReason | 'ALL'>(
    initialFilters.reason || 'ALL'
  );
  const [dateFrom, setDateFrom] = useState<string>(
    initialFilters.dateFrom || ''
  );
  const [dateTo, setDateTo] = useState<string>(initialFilters.dateTo || '');
  const [orderValueMin, setOrderValueMin] = useState<string>('');
  const [orderValueMax, setOrderValueMax] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('ALL');
  const [selectedModerator, setSelectedModerator] = useState<string>('');

  // UI states
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Calculate active filter count
  useEffect(() => {
    let count = 0;
    if (selectedStatuses.length > 0) count++;
    if (selectedReason !== 'ALL') count++;
    if (dateFrom || dateTo) count++;
    if (orderValueMin || orderValueMax) count++;
    if (selectedPriority !== 'ALL') count++;
    if (selectedModerator) count++;
    setActiveFilterCount(count);
  }, [
    selectedStatuses,
    selectedReason,
    dateFrom,
    dateTo,
    orderValueMin,
    orderValueMax,
    selectedPriority,
    selectedModerator,
  ]);

  // Build filters object
  const buildFilters = useCallback((): DisputeFiltersType => {
    const filters: DisputeFiltersType = {};

    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses[0]; // Single status for now
    }
    if (selectedReason !== 'ALL') {
      filters.reason = selectedReason;
    }
    if (dateFrom) {
      filters.dateFrom = dateFrom;
    }
    if (dateTo) {
      filters.dateTo = dateTo;
    }

    return filters;
  }, [selectedStatuses, selectedReason, dateFrom, dateTo]);

  // Update URL query params
  const updateQueryParams = useCallback(
    (filters: DisputeFiltersType) => {
      const params = new URLSearchParams(searchParams?.toString() || '');

      // Update or remove params
      if (filters.status) {
        params.set('status', filters.status);
      } else {
        params.delete('status');
      }

      if (filters.reason) {
        params.set('reason', filters.reason);
      } else {
        params.delete('reason');
      }

      if (filters.dateFrom) {
        params.set('dateFrom', filters.dateFrom);
      } else {
        params.delete('dateFrom');
      }

      if (filters.dateTo) {
        params.set('dateTo', filters.dateTo);
      } else {
        params.delete('dateTo');
      }

      // Update URL without page reload
      const newUrl = `${pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Apply filters
  const applyFilters = useCallback(() => {
    const filters = buildFilters();
    onFiltersChange(filters);
    updateQueryParams(filters);
  }, [buildFilters, onFiltersChange, updateQueryParams]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedStatuses([]);
    setSelectedReason('ALL');
    setDateFrom('');
    setDateTo('');
    setOrderValueMin('');
    setOrderValueMax('');
    setSelectedPriority('ALL');
    setSelectedModerator('');

    onFiltersChange({});
    updateQueryParams({});
  }, [onFiltersChange, updateQueryParams]);

  // Toggle status selection
  const toggleStatus = (status: DisputeStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Auto-apply filters when changed (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedStatuses, selectedReason, dateFrom, dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* Filter Header */}
      <div
        className="flex cursor-pointer items-center justify-between bg-gray-50 p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Gelişmiş Filtreler</h3>
            <p className="text-sm text-gray-600">
              {activeFilterCount > 0
                ? `${activeFilterCount} filtre aktif`
                : 'Filtre ekle'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <>
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetFilters();
                }}
              >
                <X className="h-4 w-4" />
                Temizle
              </Button>
            </>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-600 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-6 p-6">
          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Durum
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.values(DisputeStatus).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedStatuses.includes(status)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {disputeStatusLabels[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Filter */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Sebep
            </label>
            <div className="relative">
              <select
                value={selectedReason}
                onChange={(e) =>
                  setSelectedReason(e.target.value as DisputeReason | 'ALL')
                }
                className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="ALL">Tüm Sebepler</option>
                {Object.values(DisputeReason).map((reason) => (
                  <option key={reason} value={reason}>
                    {disputeReasonLabels[reason]}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar className="h-4 w-4" />
              Tarih Aralığı
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Başlangıç
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Bitiş
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Order Value Range */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-4 w-4" />
              Sipariş Tutarı (TL)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Minimum
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={orderValueMin}
                  onChange={(e) => setOrderValueMin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-600">
                  Maksimum
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={orderValueMax}
                  onChange={(e) => setOrderValueMax(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Flag className="h-4 w-4" />
              Öncelik
            </label>
            <div className="flex gap-2">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map(
                (priority) => (
                  <button
                    key={priority}
                    onClick={() => setSelectedPriority(priority)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      selectedPriority === priority
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {priorityLabels[priority]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Assigned Moderator */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <User className="h-4 w-4" />
              Atanan Moderatör
            </label>
            <div className="relative">
              <select
                value={selectedModerator}
                onChange={(e) => setSelectedModerator(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="">Atanmamış / Tümü</option>
                <option value="moderator-1">Ahmet Yılmaz</option>
                <option value="moderator-2">Ayşe Demir</option>
                <option value="moderator-3">Mehmet Kaya</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t border-gray-200 pt-4">
            <Button variant="primary" className="flex-1" onClick={applyFilters}>
              Filtreleri Uygula
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              <X className="mr-2 h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default DisputeFilters;
