'use client';

/**
 * Marketplace Container
 * Main marketplace page with package listings
 */

import { useState, useEffect, useCallback } from 'react';
import { packageApi } from '@/lib/api/packages';
import type { PackageSortBy } from '@/types/business/features/package';
import { PackageGrid } from './PackageGrid';
import { MarketplaceFilters } from './MarketplaceFilters';
import { Button } from '@/components/ui';
import type { PackageSummary } from '@/types/business/features/package';

export function MarketplaceContainer() {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('relevant');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page: page - 1, // Backend uses 0-based indexing
        size: 20,
      };

      if (searchQuery) params.search = searchQuery;
      if (categoryId) params.categoryId = categoryId;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (sortBy && sortBy !== 'relevant') {
        // Map UI sortBy to backend enum
        const sortMapping: Record<string, string> = {
          rating: 'RATING',
          popular: 'POPULARITY',
          newest: 'CREATED_AT',
          price_asc: 'PRICE',
          price_desc: 'PRICE',
        };
        params.sortBy = sortMapping[sortBy] || 'CREATED_AT';
        params.sortDir = sortBy === 'price_desc' ? 'DESC' : 'ASC';
      }

      const sortByEnum: PackageSortBy =
        sortBy === 'rating'
          ? 'RATING'
          : sortBy === 'popular'
            ? 'ORDER_COUNT'
            : sortBy === 'newest'
              ? 'CREATED_AT'
              : sortBy === 'price_asc'
                ? 'PRICE_ASC'
                : sortBy === 'price_desc'
                  ? 'PRICE_DESC'
                  : 'CREATED_AT';

      const response = await packageApi.getActivePackages({
        page: page - 1,
        size: 20,
        sortBy: sortByEnum,
        sortDir: 'DESC',
      });

      setPackages(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Paketler yüklenirken bir hata oluştu.');
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, categoryId, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryId, minPrice, maxPrice, sortBy]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchPackages} variant="outline" className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <MarketplaceFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Results Count */}
      {!loading && (
        <div className="text-sm text-gray-600">
          {packages.length} paket bulundu
        </div>
      )}

      {/* Package Grid */}
      <PackageGrid packages={packages} loading={loading} />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Önceki
          </Button>
          <span className="text-sm text-gray-600">
            Sayfa {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}
