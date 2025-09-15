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
      className="flex flex-col items-center justify-center px-4 py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="mb-6 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 p-6"
        aria-hidden="true"
      >
        <Icon className="h-12 w-12 text-blue-500" />
      </div>

      <h3
        className="mb-2 text-xl font-semibold text-gray-900"
        id="empty-state-title"
      >
        {title}
      </h3>

      <p
        className="mb-6 max-w-md text-gray-600"
        aria-describedby="empty-state-title"
      >
        {description}
      </p>

      {action || (
        <div
          className="flex flex-col gap-3 sm:flex-row"
          role="group"
          aria-label="İş ilanı seçenekleri"
        >
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="gap-2"
            aria-label="Filtreleri temizle ve tüm sonuçları göster"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Filtreleri Temizle
          </Button>
          <Button
            onClick={onShowAll}
            className="gap-2"
            aria-label={`Tüm ${mode === 'jobs' ? 'iş ilanlarını' : 'hizmet paketlerini'} göster`}
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            {mode === 'jobs' ? 'Tüm İş İlanları' : 'Tüm Hizmet Paketleri'}
          </Button>
        </div>
      )}
    </div>
  );
}
