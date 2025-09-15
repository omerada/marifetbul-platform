'use client';

import { JobCard } from './JobCard';
import { PackageCard } from './PackageCard';
import { Loading } from '@/components/ui';
import { EmptyState } from './EmptyState';
import type { Job, ServicePackage } from '@/types';
import type { ViewPreferences } from '@/lib/validations/marketplace';

interface MarketplaceListProps {
  mode: 'jobs' | 'packages';
  data: Job[] | ServicePackage[];
  isLoading: boolean;
  viewPreferences: ViewPreferences;
  onClearFilters?: () => void;
  onShowAll?: () => void;
}

export function MarketplaceList({
  mode,
  data,
  isLoading,
  viewPreferences,
  onClearFilters,
  onShowAll,
}: MarketplaceListProps) {
  if (isLoading) {
    return (
      <Loading
        variant="skeleton"
        size="lg"
        text="Marketplace içeriği yükleniyor..."
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        mode={mode}
        title={
          mode === 'jobs' ? 'İş ilanı bulunamadı' : 'Hizmet paketi bulunamadı'
        }
        description={
          mode === 'jobs'
            ? 'Arama kriterlerinizi değiştirerek tekrar deneyin veya yeni iş ilanları için daha sonra kontrol edin.'
            : 'Arama kriterlerinizi değiştirerek tekrar deneyin veya yeni hizmet paketleri için daha sonra kontrol edin.'
        }
        onClearFilters={onClearFilters}
        onShowAll={onShowAll}
      />
    );
  }

  const gridCols =
    viewPreferences.layout === 'grid'
      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1';

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {mode === 'jobs'
        ? (data as Job[]).map((job) => (
            <JobCard key={job.id} job={job} layout={viewPreferences.layout} />
          ))
        : (data as ServicePackage[]).map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              layout={viewPreferences.layout}
            />
          ))}
    </div>
  );
}
