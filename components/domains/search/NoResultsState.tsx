/**
 * ================================================
 * NO RESULTS STATE COMPONENT (DEPRECATED)
 * ================================================
 * @deprecated Use ZeroResultsState instead (Sprint 15 - Story 1.3)
 *
 * This component has been superseded by ZeroResultsState which offers:
 * - Real API integration for popular searches
 * - Smarter typo correction
 * - Better category recommendations
 * - Enhanced UX with loading states
 *
 * Migration guide:
 * ```tsx
 * // Old:
 * <NoResultsState query={query} onNewSearch={handleSearch} />
 *
 * // New:
 * <ZeroResultsState
 *   query={query}
 *   onSearch={handleSearch}
 *   activeFilterCount={filterCount}
 *   onClearFilters={clearFilters}
 * />
 * ```
 *
 * Sprint 2: Search & Discovery - Story 4
 * Replaced by: Sprint 15 - Story 1.3
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 (Legacy)
 * @since 2025-11-26
 * @deprecated Since 2025-11-26 - Use ZeroResultsState
 */

'use client';

import React from 'react';
import {
  Search,
  TrendingUp,
  Grid3x3,
  Lightbulb,
  RefreshCcw,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface Suggestion {
  text: string;
  type: 'correction' | 'related' | 'category';
  icon?: React.ComponentType<{ className?: string }>;
}

interface PopularCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface NoResultsStateProps {
  /** The search query that returned no results */
  query: string;

  /** Whether filters are currently active */
  hasActiveFilters?: boolean;

  /** Callback to clear all filters */
  onClearFilters?: () => void;

  /** Callback for new search */
  onNewSearch?: (query: string) => void;

  /** Custom suggestions */
  suggestions?: string[];

  /** Popular categories to show */
  popularCategories?: PopularCategory[];

  /** Custom class name */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate spelling correction suggestions
 */
function generateSpellingCorrections(query: string): string[] {
  const corrections: string[] = [];

  // Turkish character conversions
  const turkishMap: Record<string, string> = {
    ı: 'i',
    i: 'ı',
    ş: 's',
    s: 'ş',
    ğ: 'g',
    g: 'ğ',
    ü: 'u',
    u: 'ü',
    ö: 'o',
    o: 'ö',
    ç: 'c',
    c: 'ç',
  };

  // Try replacing each character
  for (const [from, to] of Object.entries(turkishMap)) {
    if (query.includes(from)) {
      corrections.push(query.replace(new RegExp(from, 'g'), to));
    }
  }

  // Remove duplicates
  return [...new Set(corrections)].slice(0, 3);
}

/**
 * Generate related search suggestions
 */
function generateRelatedSuggestions(query: string): string[] {
  const suggestions: string[] = [];

  // Add common suffixes
  const suffixes = [
    'hizmeti',
    'uzmanı',
    'freelancer',
    'tasarımı',
    'geliştirme',
  ];

  suffixes.forEach((suffix) => {
    if (!query.toLowerCase().includes(suffix)) {
      suggestions.push(`${query} ${suffix}`);
    }
  });

  return suggestions.slice(0, 3);
}

// ============================================================================
// DEFAULT DATA
// ============================================================================

const DEFAULT_POPULAR_CATEGORIES: PopularCategory[] = [
  { id: 'web-design', name: 'Web Tasarım', icon: '🎨', count: 2340 },
  { id: 'logo-design', name: 'Logo Tasarımı', icon: '🎯', count: 1820 },
  { id: 'seo', name: 'SEO Hizmetleri', icon: '📈', count: 967 },
  { id: 'mobile-app', name: 'Mobil Uygulama', icon: '📱', count: 1250 },
  { id: 'content-writing', name: 'İçerik Yazımı', icon: '✍️', count: 834 },
  { id: 'social-media', name: 'Sosyal Medya', icon: '📸', count: 692 },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * NoResultsState Component
 *
 * Displays intelligent suggestions when search returns no results.
 *
 * @example
 * ```tsx
 * <NoResultsState
 *   query="web tasarım"
 *   hasActiveFilters={true}
 *   onClearFilters={() => clearFilters()}
 *   onNewSearch={(q) => performSearch(q)}
 * />
 * ```
 */
export function NoResultsState({
  query,
  hasActiveFilters = false,
  onClearFilters,
  onNewSearch,
  suggestions: customSuggestions,
  popularCategories = DEFAULT_POPULAR_CATEGORIES,
  className,
}: NoResultsStateProps) {
  // Generate automatic suggestions
  const spellingCorrections = generateSpellingCorrections(query);
  const relatedSuggestions = generateRelatedSuggestions(query);

  // Combine all suggestions
  const allSuggestions: Suggestion[] = [
    ...spellingCorrections.map((text) => ({
      text,
      type: 'correction' as const,
      icon: Lightbulb,
    })),
    ...relatedSuggestions.map((text) => ({
      text,
      type: 'related' as const,
      icon: Search,
    })),
    ...(customSuggestions || []).map((text) => ({
      text,
      type: 'category' as const,
      icon: Grid3x3,
    })),
  ].slice(0, 6);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Empty State */}
      <Card className="py-12 text-center">
        <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />

        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Sonuç Bulunamadı
        </h2>

        <p className="mb-6 text-gray-600">
          <strong className="font-semibold">&quot;{query}&quot;</strong> için
          sonuç bulunamadı.
        </p>

        {/* Filter Warning */}
        {hasActiveFilters && (
          <div className="mb-6">
            <Card className="mx-auto max-w-md border-blue-200 bg-blue-50">
              <div className="flex items-start gap-3">
                <Filter className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-blue-900">
                    Aktif filtreleriniz var
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Filtreleri kaldırarak daha fazla sonuç görebilirsiniz.
                  </p>
                </div>
              </div>
              {onClearFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearFilters}
                  className="mt-3 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Filtreleri Temizle
                </Button>
              )}
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/marketplace')}
          >
            <Grid3x3 className="mr-2 h-4 w-4" />
            Marketplace&apos;e Git
          </Button>

          <Button
            variant="outline"
            onClick={() => (window.location.href = '/search')}
          >
            <Search className="mr-2 h-4 w-4" />
            Yeni Arama
          </Button>
        </div>
      </Card>

      {/* Suggestions */}
      {allSuggestions.length > 0 && (
        <Card>
          <div className="border-b border-gray-100 px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold text-gray-900">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Önerilen Aramalar
            </h3>
          </div>

          <div className="p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {allSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon || Search;
                return (
                  <button
                    key={index}
                    onClick={() => onNewSearch?.(suggestion.text)}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span className="flex-1 text-sm text-gray-700">
                      {suggestion.text}
                    </span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Popular Categories */}
      <Card>
        <div className="border-b border-gray-100 px-4 py-3">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Popüler Kategoriler
          </h3>
        </div>

        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popularCategories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  (window.location.href = `/categories/${category.id}`)
                }
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 text-left transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="mb-2 text-3xl">{category.icon}</div>

                <h4 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.count.toLocaleString()} hizmet
                  </span>

                  <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
                </div>

                {category.count > 1000 && (
                  <Badge
                    variant="warning"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    Popüler
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Search Tips */}
      <Card className="bg-gray-50">
        <div className="p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Arama İpuçları</h3>

          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                1
              </span>
              <span>Farklı anahtar kelimeler veya eş anlamlılar deneyin</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                2
              </span>
              <span>Daha genel terimler kullanarak aramanızı genişletin</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                3
              </span>
              <span>Yazım hatalarını kontrol edin (ı/i, ş/s gibi)</span>
            </li>

            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                4
              </span>
              <span>Aktif filtreleri kaldırarak daha geniş sonuçlar görün</span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default NoResultsState;
