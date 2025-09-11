'use client';

import React from 'react';
import { Filter, X, MapPin, DollarSign, Clock, Star, Zap } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { JobFilters as JobFiltersComponent } from '@/components/filters';
import { PackageFiltersComponent } from '@/components/filters/PackageFilters';
import { JobFilters, PackageFilters } from '@/types';

interface JobFilterHook {
  filters: JobFilters;
  updateFilters: (filters: JobFilters) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

interface PackageFilterHook {
  filters: PackageFilters;
  updateFilters: (filters: PackageFilters) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

interface EnhancedFiltersProps {
  activeTab: 'jobs' | 'services';
  jobFilters: JobFilterHook;
  packageFilters: PackageFilterHook;
}

export function EnhancedFilters({
  activeTab,
  jobFilters,
  packageFilters,
}: EnhancedFiltersProps) {
  const currentFilters = activeTab === 'jobs' ? jobFilters : packageFilters;

  // Quick filter presets
  const quickFilters = {
    jobs: [
      { label: 'Uzaktan', icon: MapPin, count: 245 },
      { label: 'Acil', icon: Zap, count: 67 },
      { label: 'Yüksek Bütçe', icon: DollarSign, count: 89 },
      { label: 'Bu Hafta', icon: Clock, count: 52 },
    ],
    services: [
      { label: 'Hızlı Teslimat', icon: Zap, count: 156 },
      { label: 'Popüler', icon: Star, count: 234 },
      { label: 'Uygun Fiyat', icon: DollarSign, count: 445 },
      { label: 'Yeni', icon: Clock, count: 78 },
    ],
  };

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-6 space-y-6">
        {/* Quick Filters */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Hızlı Filtreler</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickFilters[activeTab].map((filter, index) => (
              <button
                key={index}
                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <filter.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{filter.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {filter.count}
                </Badge>
              </button>
            ))}
          </div>
        </Card>

        {/* Main Filters */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtreler</h3>
          </div>

          {activeTab === 'jobs' ? (
            <JobFiltersComponent
              filters={jobFilters.filters}
              onFiltersChange={jobFilters.updateFilters}
              onClearFilters={jobFilters.clearFilters}
            />
          ) : (
            <PackageFiltersComponent
              filters={packageFilters.filters}
              onFiltersChange={packageFilters.updateFilters}
            />
          )}
        </Card>

        {/* Active Filters Summary */}
        {currentFilters.hasActiveFilters && (
          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Aktif Filtreler</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={currentFilters.clearFilters}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <X className="mr-1 h-4 w-4" />
                Temizle
              </Button>
            </div>
            <div className="text-center text-sm font-medium text-blue-600">
              Filtreler aktif - Sonuçlar filtrelenmiş
            </div>
          </Card>
        )}

        {/* Tips & Stats */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <h4 className="font-medium text-gray-900">İpucu</h4>
          </div>
          <p className="text-sm text-gray-600">
            {activeTab === 'jobs'
              ? 'Daha fazla iş ilanı görmek için farklı anahtar kelimeler deneyin veya filtreleri genişletin.'
              : 'Hizmet sağlayıcıların profillerini inceleyerek en uygun seçimi yapabilirsiniz.'}
          </p>
        </Card>
      </div>
    </div>
  );
}
