/**
 * ================================================
 * ENHANCED SEARCH RESULTS COMPONENT
 * ================================================
 * Sprint 2: Search & Discovery - Story 3
 *
 * Production-ready search results with:
 * - Skeleton loading states
 * - Infinite scroll pagination
 * - Result highlighting
 * - Sort options integration
 * - Empty states
 * - Error handling
 * - Performance optimizations
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Package,
  Star,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCcw,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

interface SearchPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  deliveryDays: number;
  seller: {
    id: string;
    name: string;
    username: string;
    verified: boolean;
    level?: string;
  };
  featured: boolean;
  categoryId: string;
  categoryName?: string;
  imageUrl?: string;
}

interface SearchResultsData {
  content: SearchPackage[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
}

export interface EnhancedSearchResultsProps {
  /** Search query */
  query: string;

  /** Filter parameters */
  filters?: Record<string, unknown>;

  /** Sort option */
  sortBy?: string;

  /** View mode */
  viewMode?: 'grid' | 'list';

  /** Callback when result is clicked */
  onResultClick?: (packageId: string) => void;

  /** Custom class name */
  className?: string;
}

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

function PackageCardSkeleton({
  variant = 'grid',
}: {
  variant?: 'grid' | 'list';
}) {
  if (variant === 'list') {
    return (
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="h-24 w-32 flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-48 w-full animate-pulse bg-gray-200" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </Card>
  );
}

function ResultsSkeleton({
  count = 6,
  variant = 'grid',
}: {
  count?: number;
  variant?: 'grid' | 'list';
}) {
  return (
    <div
      className={cn(
        variant === 'grid'
          ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
          : 'space-y-4'
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PackageCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

// ============================================================================
// PACKAGE CARD COMPONENT
// ============================================================================

interface PackageCardProps {
  package: SearchPackage;
  query: string;
  variant: 'grid' | 'list';
  onClick: (id: string) => void;
}

function PackageCard({
  package: pkg,
  query,
  variant,
  onClick,
}: PackageCardProps) {
  const highlightText = (text: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 text-gray-900">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  if (variant === 'list') {
    return (
      <Card
        className="cursor-pointer transition-all hover:shadow-md"
        onClick={() => onClick(pkg.id)}
      >
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="h-24 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {pkg.imageUrl ? (
              <Image
                src={pkg.imageUrl}
                alt={pkg.title}
                width={128}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate font-semibold text-gray-900">
              {highlightText(pkg.title)}
            </h3>
            <p className="mb-2 line-clamp-2 text-sm text-gray-600">
              {highlightText(pkg.description)}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{pkg.rating.toFixed(1)}</span>
                <span>({pkg.reviewCount})</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{pkg.deliveryDays} gün</span>
              </div>

              {pkg.seller.verified && (
                <Badge variant="success" size="sm">
                  Onaylı
                </Badge>
              )}

              {pkg.featured && (
                <Badge variant="warning" size="sm">
                  Öne Çıkan
                </Badge>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end justify-between">
            <span className="text-xl font-bold text-gray-900">
              ₺{pkg.price.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">{pkg.seller.username}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={() => onClick(pkg.id)}
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        {pkg.imageUrl ? (
          <Image
            src={pkg.imageUrl}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {pkg.featured && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning">Öne Çıkan</Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-1 font-semibold text-gray-900">
          {highlightText(pkg.title)}
        </h3>

        <p className="mb-3 line-clamp-2 text-sm text-gray-600">
          {highlightText(pkg.description)}
        </p>

        {/* Meta */}
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{pkg.rating.toFixed(1)}</span>
            <span>({pkg.reviewCount})</span>
          </div>

          <span>•</span>

          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{pkg.deliveryDays} gün</span>
          </div>
        </div>

        {/* Seller & Price */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>{pkg.seller.username}</span>
            {pkg.seller.verified && (
              <Badge variant="success" size="sm">
                ✓
              </Badge>
            )}
          </div>

          <span className="text-lg font-bold text-gray-900">
            ₺{pkg.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedSearchResults({
  query,
  filters = {},
  sortBy = 'relevance',
  viewMode = 'grid',
  onResultClick,
  className,
}: EnhancedSearchResultsProps) {
  const [results, setResults] = useState<SearchPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);

  /**
   * Fetch search results
   */
  const fetchResults = useCallback(
    async (page: number, append = false) => {
      if (!query.trim()) return;

      const loadingState = append ? setIsLoadingMore : setIsLoading;
      loadingState(true);
      setError(null);

      try {
        const requestBody = {
          keyword: query,
          ...filters,
          page,
          size: 20,
          sortBy,
          sortDir: 'desc',
        };

        const response = await fetch('/api/v1/search/packages/advanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data: SearchResultsData = await response.json();

        setResults((prev) =>
          append ? [...prev, ...data.content] : data.content
        );
        setTotalResults(data.totalElements);
        setHasMore(!data.last);
        setCurrentPage(page);

        logger.info('Search results fetched', {
          query,
          page,
          results: data.content.length,
          total: data.totalElements,
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Arama başarısız oldu';
        setError(errorMsg);
        logger.error(
          'Search error',
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        loadingState(false);
      }
    },
    [query, filters, sortBy]
  );

  /**
   * Load more results
   */
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchResults(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchResults]);

  /**
   * Intersection Observer for infinite scroll
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  /**
   * Fetch initial results when query/filters change
   */
  useEffect(() => {
    setResults([]);
    setCurrentPage(0);
    setHasMore(true);
    fetchResults(0, false);
  }, [query, filters, sortBy, fetchResults]);

  /**
   * Handle result click
   */
  const handleResultClick = useCallback(
    (packageId: string) => {
      if (onResultClick) {
        onResultClick(packageId);
      } else {
        window.location.href = `/packages/${packageId}`;
      }
    },
    [onResultClick]
  );

  // Error State
  if (error && results.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Arama Başarısız
          </h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <Button onClick={() => fetchResults(0, false)} variant="primary">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      {totalResults > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            <strong className="font-semibold text-gray-900">
              {totalResults.toLocaleString()}
            </strong>{' '}
            sonuç bulundu
          </p>

          {results.length > 0 && (
            <p className="text-xs text-gray-500">
              {results.length} / {totalResults} gösteriliyor
            </p>
          )}
        </div>
      )}

      {/* Loading State - Initial */}
      {isLoading && results.length === 0 && (
        <ResultsSkeleton count={6} variant={viewMode} />
      )}

      {/* Results Grid/List */}
      {results.length > 0 && (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4'
          )}
        >
          {results.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              query={query}
              variant={viewMode}
              onClick={handleResultClick}
            />
          ))}
        </div>
      )}

      {/* Loading More */}
      {isLoadingMore && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Load More Trigger (Intersection Observer Target) */}
      {hasMore && !isLoadingMore && results.length > 0 && (
        <div ref={observerTarget} className="h-10" />
      )}

      {/* End of Results */}
      {!hasMore && results.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">Tüm sonuçlar görüntülendi</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && results.length === 0 && query && (
        <Card className="py-12 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            Sonuç Bulunamadı
          </h3>
          <p className="mb-6 text-gray-600">
            &quot;{query}&quot; için sonuç bulunamadı.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/marketplace')}
            >
              Marketplace&apos;e Dön
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default EnhancedSearchResults;
