'use client';

import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  SearchX,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Filter,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ZeroResultsState Component - Sprint 4 Day 3
 *
 * Displays a friendly empty state when search returns no results
 *
 * Features:
 * - Empty state illustration
 * - "Did you mean?" suggestions for typos
 * - Related categories to explore
 * - Clear filters CTA
 * - Search tips and help text
 */

export interface ZeroResultsStateProps {
  /** Search query that returned no results */
  query?: string;
  /** Are filters currently active? */
  hasActiveFilters?: boolean;
  /** Callback to clear all filters */
  onClearFilters?: () => void;
  /** Callback to try new search */
  onNewSearch?: (query: string) => void;
  /** Suggested alternative queries */
  suggestions?: string[];
  /** Related categories to explore */
  relatedCategories?: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  /** Custom className */
  className?: string;
}

/**
 * Default related categories
 */
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Web Geliştirme', count: 142 },
  { id: '2', name: 'Grafik Tasarım', count: 156 },
  { id: '3', name: 'Mobil Uygulama', count: 87 },
  { id: '4', name: 'İçerik Yazarlığı', count: 93 },
  { id: '5', name: 'Dijital Pazarlama', count: 78 },
  { id: '6', name: 'Video Düzenleme', count: 64 },
];

/**
 * Search tips
 */
const SEARCH_TIPS = [
  'Daha genel terimler kullanmayı deneyin',
  'Yazım hatalarını kontrol edin',
  'Farklı anahtar kelimeler deneyin',
  'Filtreleri kaldırarak aramanızı genişletin',
];

export function ZeroResultsState({
  query,
  hasActiveFilters = false,
  onClearFilters,
  onNewSearch,
  suggestions = [],
  relatedCategories = DEFAULT_CATEGORIES,
  className,
}: ZeroResultsStateProps) {
  // Generate "did you mean" suggestions based on query
  const didYouMeanSuggestions = suggestions.length > 0 ? suggestions : [];

  return (
    <div className={cn('flex flex-col items-center px-4 py-12', className)}>
      {/* Icon & Title */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
          <SearchX className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Sonuç Bulunamadı
        </h2>
        {query && (
          <p className="text-gray-600">
            <span className="font-semibold">&quot;{query}&quot;</span> için
            sonuç bulunamadı
          </p>
        )}
      </div>

      {/* Did You Mean? Suggestions */}
      {didYouMeanSuggestions.length > 0 && (
        <Card className="mb-6 w-full max-w-2xl border-blue-200 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-blue-600" />
            <div className="flex-1">
              <p className="mb-2 font-medium text-blue-900">
                Bunu mu demek istediniz?
              </p>
              <div className="flex flex-wrap gap-2">
                {didYouMeanSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onNewSearch?.(suggestion)}
                    className="border-blue-300 bg-white hover:bg-blue-50"
                  >
                    {suggestion}
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Clear Filters CTA */}
      {hasActiveFilters && onClearFilters && (
        <Card className="mb-6 w-full max-w-2xl border-orange-200 bg-orange-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  Aktif filtreler sonuçları sınırlıyor olabilir
                </p>
                <p className="text-sm text-orange-700">
                  Daha fazla sonuç görmek için filtreleri kaldırın
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="shrink-0 border-orange-300 bg-white hover:bg-orange-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Filtreleri Temizle
            </Button>
          </div>
        </Card>
      )}

      {/* Related Categories */}
      {relatedCategories.length > 0 && (
        <div className="mb-8 w-full max-w-2xl">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Popüler Kategoriler
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onNewSearch?.(category.name)}
                className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-sm"
              >
                <div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.count} ilan
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-gray-300 bg-gray-50 text-gray-600"
                >
                  {category.count}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      <Card className="w-full max-w-2xl bg-gray-50/50">
        <div className="flex items-start gap-3">
          <Lightbulb className="mt-1 h-5 w-5 shrink-0 text-yellow-600" />
          <div className="flex-1">
            <p className="mb-3 font-medium text-gray-900">Arama İpuçları:</p>
            <ul className="space-y-2">
              {SEARCH_TIPS.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Help CTA */}
      <div className="mt-8 text-center">
        <p className="mb-3 text-sm text-gray-600">
          Yardıma mı ihtiyacınız var?
        </p>
        <Button variant="outline" size="sm">
          Destek ile İletişime Geçin
        </Button>
      </div>
    </div>
  );
}
