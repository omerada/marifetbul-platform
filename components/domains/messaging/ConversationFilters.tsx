'use client';

import { memo, useState } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { ContextType } from '@/types/business/features/messaging';

export interface ConversationFiltersState {
  hasUnread?: boolean;
  contextTypes?: ContextType[];
  sortBy?: 'recent' | 'unread' | 'alphabetical';
}

interface ConversationFiltersProps {
  filters: ConversationFiltersState;
  onFiltersChange: (filters: ConversationFiltersState) => void;
  /**
   * Show/hide the filters panel
   */
  isOpen?: boolean;
  onToggle?: () => void;
}

const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  ORDER: 'Sipariş',
  PROPOSAL: 'Teklif',
  JOB: 'İş İlanı',
  PACKAGE: 'Paket',
};

const SORT_OPTIONS = [
  { value: 'recent' as const, label: 'En Yeni' },
  { value: 'unread' as const, label: 'Okunmamış' },
  { value: 'alphabetical' as const, label: 'A-Z' },
];

/**
 * Advanced conversation filters component
 *
 * Features:
 * - Filter by unread status
 * - Filter by context type (ORDER, PROPOSAL, JOB, PACKAGE)
 * - Sort conversations (recent, unread first, alphabetical)
 * - Collapsible panel
 * - Active filter indicators
 * - Clear all filters
 */
export const ConversationFilters = memo(function ConversationFilters({
  filters,
  onFiltersChange,
  isOpen = false,
  onToggle,
}: ConversationFiltersProps) {
  const [localFilters, setLocalFilters] =
    useState<ConversationFiltersState>(filters);

  const handleToggleUnread = () => {
    const newFilters = { ...localFilters, hasUnread: !localFilters.hasUnread };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleToggleContextType = (contextType: ContextType) => {
    const currentTypes = localFilters.contextTypes || [];
    const newTypes = currentTypes.includes(contextType)
      ? currentTypes.filter((t) => t !== contextType)
      : [...currentTypes, contextType];

    const newFilters = { ...localFilters, contextTypes: newTypes };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (sortBy: ConversationFiltersState['sortBy']) => {
    const newFilters = { ...localFilters, sortBy };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters: ConversationFiltersState = {
      hasUnread: false,
      contextTypes: [],
      sortBy: 'recent',
    };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFiltersCount =
    (localFilters.hasUnread ? 1 : 0) +
    (localFilters.contextTypes?.length || 0) +
    (localFilters.sortBy && localFilters.sortBy !== 'recent' ? 1 : 0);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Filter className="h-4 w-4" />
        <span>Filtrele</span>
        {activeFiltersCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
            {activeFiltersCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <Card className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-700" />
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Temizle
            </button>
          )}
          <button
            onClick={onToggle}
            className="rounded p-1 hover:bg-gray-100"
            aria-label="Close filters"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Unread Filter */}
      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={localFilters.hasUnread || false}
            onChange={handleToggleUnread}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Sadece okunmamış mesajlar
          </span>
        </label>
      </div>

      {/* Context Type Filter */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900">Konuşma Türü</h4>
        <div className="space-y-2">
          {(Object.keys(CONTEXT_TYPE_LABELS) as ContextType[]).map(
            (contextType) => {
              const isActive = localFilters.contextTypes?.includes(contextType);
              return (
                <button
                  key={contextType}
                  onClick={() => handleToggleContextType(contextType)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{CONTEXT_TYPE_LABELS[contextType]}</span>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-gray-900">Sıralama</h4>
        <div className="space-y-2">
          {SORT_OPTIONS.map((option) => {
            const isActive = (localFilters.sortBy || 'recent') === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{option.label}</span>
                {isActive && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
});
