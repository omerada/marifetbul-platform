'use client';

import type { Job, ServicePackage } from '@/types';
import type { PackageSummary } from '@/types/business/features/package';
import type { ViewPreferences } from '@/lib/core/validations/marketplace';
import { JobCard } from '@/components/domains/jobs';
import { PackageCard } from '@/components/packages/public/PackageCard';
// Note: Empty state handled by ZeroResultsState component

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
      <div className="space-y-4">
        {/* Skeleton Loading - Modern Design */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60"
          >
            <div className="flex gap-4">
              <div className="h-16 w-16 rounded-lg bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-slate-200" />
                  <div className="h-6 w-24 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          {mode === 'jobs' ? 'İş ilanı bulunamadı' : 'Hizmet paketi bulunamadı'}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'jobs'
            ? 'Arama kriterlerinizi değiştirerek tekrar deneyin veya yeni iş ilanları için daha sonra kontrol edin.'
            : 'Arama kriterlerinizi değiştirerek tekrar deneyin veya yeni hizmet paketleri için daha sonra kontrol edin.'}
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="bg-primary-600 hover:bg-primary-700 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
          >
            Filtreleri Temizle
          </button>
        )}
      </div>
    );
  }

  const gridCols =
    viewPreferences.layout === 'grid'
      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
      : 'grid-cols-1';

  return (
    <div className={`grid ${gridCols} gap-6`}>
      {mode === 'jobs'
        ? (data as Job[]).map((job) => (
            <JobCard
              key={job.id}
              job={job as any}
              layout={viewPreferences.layout}
              {...({} as any)}
            />
          ))
        : (data as ServicePackage[]).map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg as unknown as PackageSummary}
            />
          ))}
    </div>
  );
}
