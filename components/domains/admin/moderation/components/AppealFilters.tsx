/**
 * Appeal Filters Component
 *
 * Filter controls for appeal list (search, status, priority, reason).
 */

import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Search, Filter } from 'lucide-react';
import type { AppealFilters } from '../types/appeal';
import {
  APPEAL_STATUS_OPTIONS,
  APPEAL_PRIORITY_OPTIONS,
  APPEAL_REASON_OPTIONS,
} from '../constants/appealConstants';

interface AppealFiltersProps {
  filters: AppealFilters;
  onFilterChange: (key: keyof AppealFilters, value: string) => void;
  onClear: () => void;
}

export function AppealFilters({
  filters,
  onFilterChange,
  onClear,
}: AppealFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Arama
            </label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="İtiraz no, kullanıcı adı..."
                value={filters.search}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Durum
            </label>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {APPEAL_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Öncelik
            </label>
            <select
              value={filters.priority}
              onChange={(e) => onFilterChange('priority', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {APPEAL_PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reason Filter */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              İtiraz Nedeni
            </label>
            <select
              value={filters.reason}
              onChange={(e) => onFilterChange('reason', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {APPEAL_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <Button
              onClick={onClear}
              variant="outline"
              className="flex w-full items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
