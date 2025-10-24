'use client';

import { useState } from 'react';
import { Search, Filter, X, Calendar, MessageSquare } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { formatDate } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface ConversationSearchFilters {
  query?: string;
  contextType?: string;
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

interface ConversationSearchProps {
  onSearch: (filters: ConversationSearchFilters) => void;
  isLoading?: boolean;
}

const CONTEXT_TYPES = [
  { value: '', label: 'Tümü' },
  { value: 'ORDER', label: 'Sipariş' },
  { value: 'PROPOSAL', label: 'Teklif' },
  { value: 'JOB', label: 'İş İlanı' },
  { value: 'PACKAGE', label: 'Paket' },
];

export function ConversationSearch({
  onSearch,
  isLoading = false,
}: ConversationSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ConversationSearchFilters>({
    sortBy: 'lastMessageAt',
    sortDirection: 'desc',
  });

  const handleSearch = () => {
    onSearch({
      ...filters,
      query: query.trim() || undefined,
    });
  };

  const handleClearFilters = () => {
    setQuery('');
    setFilters({
      sortBy: 'lastMessageAt',
      sortDirection: 'desc',
    });
    onSearch({
      sortBy: 'lastMessageAt',
      sortDirection: 'desc',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const activeFilterCount = [
    filters.contextType,
    filters.unreadOnly,
    filters.startDate,
    filters.endDate,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Kişi adı veya mesaj içeriğinde ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-4 pl-10"
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading} className="px-6">
          <Search className="mr-2 h-4 w-4" />
          Ara
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtreler
          {activeFilterCount > 0 && (
            <span className="bg-primary-600 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              Gelişmiş Filtreler
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Context Type Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <MessageSquare className="mr-1 inline h-4 w-4" />
                Konuşma Tipi
              </label>
              <select
                value={filters.contextType || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    contextType: e.target.value || undefined,
                  })
                }
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              >
                {CONTEXT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Unread Only Filter */}
            <div className="flex items-center">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={filters.unreadOnly || false}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      unreadOnly: e.target.checked || undefined,
                    })
                  }
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Sadece okunmamış mesajlar
                </span>
              </label>
            </div>

            {/* Start Date Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={
                  filters.startDate
                    ? formatDate(filters.startDate, 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    startDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <Calendar className="mr-1 inline h-4 w-4" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={
                  filters.endDate
                    ? formatDate(filters.endDate, 'yyyy-MM-dd')
                    : ''
                }
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    endDate: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  })
                }
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sıralama
              </label>
              <select
                value={filters.sortBy || 'lastMessageAt'}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              >
                <option value="lastMessageAt">Son Mesaj Tarihi</option>
                <option value="createdAt">Oluşturulma Tarihi</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sıra
              </label>
              <select
                value={filters.sortDirection || 'desc'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortDirection: e.target.value as 'asc' | 'desc',
                  })
                }
                className="focus:border-primary-500 focus:ring-primary-500 w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-1 focus:outline-none"
              >
                <option value="desc">Yeniden Eskiye</option>
                <option value="asc">Eskiden Yeniye</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex justify-end gap-2 border-t border-gray-200 pt-2">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              Filtreleri Temizle
            </Button>
            <Button size="sm" onClick={handleSearch} disabled={isLoading}>
              Filtreleri Uygula
            </Button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.contextType && (
            <div className="bg-primary-50 text-primary-700 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm">
              <MessageSquare className="h-3 w-3" />
              {
                CONTEXT_TYPES.find((t) => t.value === filters.contextType)
                  ?.label
              }
              <button
                onClick={() =>
                  setFilters({ ...filters, contextType: undefined })
                }
                className="hover:text-primary-900 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.unreadOnly && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">
              Okunmamış
              <button
                onClick={() =>
                  setFilters({ ...filters, unreadOnly: undefined })
                }
                className="ml-1 hover:text-blue-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.startDate && (
            <div className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700">
              <Calendar className="h-3 w-3" />
              {formatDate(filters.startDate, 'dd MMM yyyy', { locale: tr })} -
              <button
                onClick={() => setFilters({ ...filters, startDate: undefined })}
                className="ml-1 hover:text-green-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.endDate && (
            <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700">
              <Calendar className="h-3 w-3" />-{' '}
              {formatDate(filters.endDate, 'dd MMM yyyy', { locale: tr })}
              <button
                onClick={() => setFilters({ ...filters, endDate: undefined })}
                className="ml-1 hover:text-orange-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
