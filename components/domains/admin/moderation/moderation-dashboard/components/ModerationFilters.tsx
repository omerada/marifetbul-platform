/**
 * ModerationFilters Component
 *
 * Search and filter controls for moderation items
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui';
import {
  MODERATION_TYPE_OPTIONS,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
} from '../utils/moderationConstants';
import type { ModerationFiltersProps } from '../types/moderationDashboardTypes';

export function ModerationFilters({
  filters,
  onFilterChange,
  onSearchChange,
}: ModerationFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Rapor, kullanıcı veya içerik ara..."
                value={filters.search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MODERATION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.severity}
              onChange={(e) => onFilterChange('severity', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
