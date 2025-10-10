'use client';

import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Search, Briefcase, Package, RotateCcw } from 'lucide-react';

interface EmptyStateProps {
  mode: 'jobs' | 'packages';
  title: string;
  description: string;
  action?: React.ReactNode;
  onClearFilters?: () => void;
  onShowAll?: () => void;
}

export function EmptyState({
  mode,
  title,
  description,
  action,
  onClearFilters,
  onShowAll,
}: EmptyStateProps) {
  const Icon = mode === 'jobs' ? Briefcase : Package;

  return (
    <div
      className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-gray-50 to-white px-4 py-16 text-center shadow-sm ring-1 ring-gray-200/60"
      role="status"
      aria-live="polite"
    >
      {/* Icon with gradient */}
      <div className="relative mb-8" aria-hidden="true">
        <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-50 blur-xl" />
        <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-lg ring-1 ring-blue-200/60">
          <Icon className="h-14 w-14 text-blue-600" />
        </div>
      </div>

      {/* Content */}
      <div className="mb-8 space-y-3">
        <h3 className="text-2xl font-bold text-gray-900" id="empty-state-title">
          {title}
        </h3>

        <p
          className="mx-auto max-w-md text-lg leading-relaxed text-gray-600"
          aria-describedby="empty-state-title"
        >
          {description}
        </p>
      </div>

      {/* Actions */}
      {action || (
        <div
          className="flex flex-col gap-3 sm:flex-row"
          role="group"
          aria-label="İş ilanı seçenekleri"
        >
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="gap-2 shadow-sm"
            aria-label="Filtreleri temizle ve tüm sonuçları göster"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Filtreleri Temizle</span>
          </Button>
          <Button
            onClick={onShowAll}
            className="gap-2 bg-blue-600 shadow-md hover:bg-blue-700"
            aria-label={`Tüm ${mode === 'jobs' ? 'iş ilanlarını' : 'hizmet paketlerini'} göster`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>
              {mode === 'jobs'
                ? 'Tüm İş İlanlarını Göster'
                : 'Tüm Hizmet Paketlerini Göster'}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
