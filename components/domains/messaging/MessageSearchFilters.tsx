/**
 * MessageSearchFilters Component
 *
 * Advanced filters for message search:
 * - Date range (from/to)
 * - Attachment filter (has attachments, specific types)
 * - Message type filter
 * - Sender filter
 * - Unread only filter
 *
 * @sprint Sprint 1.4 - Message Search & Filter
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { Calendar, Paperclip, Filter, X, Check } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';

// ============================================================================
// TYPES
// ============================================================================

export interface MessageSearchFilters {
  /** Filter by date range - from */
  dateFrom?: string;
  /** Filter by date range - to */
  dateTo?: string;
  /** Filter messages with attachments */
  hasAttachment?: boolean;
  /** Filter by attachment type (extension) */
  attachmentType?: string;
  /** Filter by message type */
  messageType?: 'text' | 'system' | 'file';
  /** Show only unread messages */
  unreadOnly?: boolean;
}

interface MessageSearchFiltersProps {
  /** Current filter values */
  filters: MessageSearchFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: MessageSearchFilters) => void;
  /** Whether filter panel is expanded */
  isExpanded: boolean;
  /** Toggle filter panel */
  onToggle: () => void;
  /** Available attachment types */
  availableAttachmentTypes?: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ATTACHMENT_TYPES = [
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word' },
  { value: 'docx', label: 'Word (DOCX)' },
  { value: 'xls', label: 'Excel' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
  { value: 'jpg', label: 'JPEG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'zip', label: 'ZIP' },
  { value: 'rar', label: 'RAR' },
];

const MESSAGE_TYPES = [
  { value: 'text', label: 'Metin' },
  { value: 'file', label: 'Dosya' },
  { value: 'system', label: 'Sistem' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export const MessageSearchFilters = memo(function MessageSearchFilters({
  filters,
  onFiltersChange,
  isExpanded,
  onToggle,
  availableAttachmentTypes,
}: MessageSearchFiltersProps) {
  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (filters.hasAttachment) count++;
    if (filters.attachmentType) count++;
    if (filters.messageType) count++;
    if (filters.unreadOnly) count++;
    return count;
  }, [filters]);

  // Attachment type options
  const attachmentTypeOptions = useMemo(() => {
    if (availableAttachmentTypes && availableAttachmentTypes.length > 0) {
      return availableAttachmentTypes.map((type) => ({
        value: type.toLowerCase(),
        label: type.toUpperCase(),
      }));
    }
    return DEFAULT_ATTACHMENT_TYPES;
  }, [availableAttachmentTypes]);

  // Update filter
  const updateFilter = useCallback(
    (key: keyof MessageSearchFilters, value: string | boolean | undefined) => {
      onFiltersChange({
        ...filters,
        [key]: value,
      });
    },
    [filters, onFiltersChange]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  // Clear single filter
  const clearFilter = useCallback(
    (key: keyof MessageSearchFilters) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Render collapsed state (button only)
  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="relative flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        aria-label="Filtreleri aç"
      >
        <Filter className="h-4 w-4" />
        <span>Filtreler</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    );
  }

  // Render expanded state (full filter panel)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Gelişmiş Filtreler
          </h3>
          {activeFilterCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <UnifiedButton
              onClick={handleClearAll}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              Tümünü Temizle
            </UnifiedButton>
          )}
          <button
            onClick={onToggle}
            className="rounded-lg p-1 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Filtreleri kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Grid */}
      <div className="space-y-4">
        {/* Date Range Filter */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              Başlangıç Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) =>
                  updateFilter('dateFrom', e.target.value || undefined)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              {filters.dateFrom && (
                <button
                  onClick={() => clearFilter('dateFrom')}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Başlangıç tarihini temizle"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4" />
              Bitiş Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) =>
                  updateFilter('dateTo', e.target.value || undefined)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
              {filters.dateTo && (
                <button
                  onClick={() => clearFilter('dateTo')}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Bitiş tarihini temizle"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Attachment Filter */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Paperclip className="h-4 w-4" />
            Ek Dosyalar
          </label>

          <div className="space-y-2">
            {/* Has Attachment Checkbox */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasAttachment || false}
                onChange={(e) =>
                  updateFilter('hasAttachment', e.target.checked || undefined)
                }
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Sadece ekli mesajlar
              </span>
            </label>

            {/* Attachment Type Select */}
            {filters.hasAttachment && (
              <div className="ml-6">
                <select
                  value={filters.attachmentType || ''}
                  onChange={(e) =>
                    updateFilter('attachmentType', e.target.value || undefined)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">Tüm dosya tipleri</option>
                  {attachmentTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Message Type Filter */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mesaj Tipi
          </label>
          <div className="flex flex-wrap gap-2">
            {MESSAGE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() =>
                  updateFilter(
                    'messageType',
                    filters.messageType === type.value
                      ? undefined
                      : (type.value as MessageSearchFilters['messageType'])
                  )
                }
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  filters.messageType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {filters.messageType === type.value && (
                  <Check className="h-4 w-4" />
                )}
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Unread Only Filter */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.unreadOnly || false}
              onChange={(e) =>
                updateFilter('unreadOnly', e.target.checked || undefined)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sadece okunmamış mesajlar
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
            Aktif Filtreler ({activeFilterCount})
          </p>
          <div className="flex flex-wrap gap-2">
            {filters.dateFrom && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Başlangıç:{' '}
                {new Date(filters.dateFrom).toLocaleDateString('tr-TR')}
                <button
                  onClick={() => clearFilter('dateFrom')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Bitiş: {new Date(filters.dateTo).toLocaleDateString('tr-TR')}
                <button
                  onClick={() => clearFilter('dateTo')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.hasAttachment && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Ekli Mesajlar
                <button
                  onClick={() => clearFilter('hasAttachment')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.attachmentType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Dosya: {filters.attachmentType.toUpperCase()}
                <button
                  onClick={() => clearFilter('attachmentType')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.messageType && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Tip:{' '}
                {
                  MESSAGE_TYPES.find((t) => t.value === filters.messageType)
                    ?.label
                }
                <button
                  onClick={() => clearFilter('messageType')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.unreadOnly && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Okunmamış
                <button
                  onClick={() => clearFilter('unreadOnly')}
                  className="hover:text-blue-900 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
