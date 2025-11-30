/**
 * ================================================
 * ZERO RESULTS STATE - Enhanced Search Experience
 * ================================================
 * Sprint 15 - Story 1.3: Analytics Enhancement
 *
 * Akıllı zero-result handling:
 * - Alternatif öneriler (typo correction)
 * - Popüler aramalar
 * - İlgili kategoriler
 * - Filtre önerileri
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/components/ui';
import {
  Search,
  Sparkles,
  TrendingUp,
  Filter,
  Lightbulb,
  Package,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchPopularSearches } from '@/lib/api/popular-searches';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface ZeroResultsStateProps {
  /** Search query that returned no results */
  query: string;

  /** Number of active filters */
  activeFilterCount?: number;

  /** Callback to clear all filters */
  onClearFilters?: () => void;

  /** Callback to perform new search */
  onSearch?: (query: string) => void;

  /** Optional CSS classes */
  className?: string;

  /** Show alternative suggestions */
  showSuggestions?: boolean;

  /** Show popular searches */
  showPopular?: boolean;

  /** Show category recommendations */
  showCategories?: boolean;
}

interface PopularSearch {
  searchTerm: string;
  searchCount: number;
  percentage?: number;
  category?: string | null;
}

interface CategorySuggestion {
  id: string;
  name: string;
  icon: string;
  count: string;
}

/**
 * Generate alternative search suggestions based on query
 * Uses simple typo correction and synonym suggestions
 */
function generateAlternativeSuggestions(query: string): string[] {
  const suggestions: string[] = [];
  const lowerQuery = query.toLowerCase().trim();

  // Common typos and corrections (Turkish)
  const corrections: Record<string, string> = {
    'web dizayn': 'web tasarım',
    'web design': 'web tasarım',
    'logo tasarim': 'logo tasarım',
    'grafik tasarim': 'grafik tasarım',
    'mobil uygulama': 'mobil app',
    'seo optimizasyon': 'seo',
    'sosyal medya yönetimi': 'sosyal medya',
    'icerik yazimi': 'içerik yazımı',
    'video editleme': 'video editör',
  };

  // Check for direct corrections
  for (const [typo, correct] of Object.entries(corrections)) {
    if (lowerQuery.includes(typo)) {
      suggestions.push(lowerQuery.replace(typo, correct));
    }
  }

  // Synonym suggestions
  const synonyms: Record<string, string[]> = {
    tasarım: ['dizayn', 'design'],
    geliştirme: ['development', 'yazılım'],
    mobil: ['mobile', 'app'],
    yazılım: ['software', 'kod'],
  };

  for (const [word, syns] of Object.entries(synonyms)) {
    if (lowerQuery.includes(word)) {
      syns.forEach((syn) => {
        if (!lowerQuery.includes(syn)) {
          suggestions.push(lowerQuery + ' ' + syn);
        }
      });
    }
  }

  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 3);
}

/**
 * Get recommended categories based on query
 */
function getRecommendedCategories(query: string): CategorySuggestion[] {
  const lowerQuery = query.toLowerCase();

  const allCategories: CategorySuggestion[] = [
    { id: 'web-dev', name: 'Web Geliştirme', icon: '💻', count: '2.3k' },
    { id: 'graphic-design', name: 'Grafik Tasarım', icon: '🎨', count: '1.8k' },
    { id: 'mobile-dev', name: 'Mobil Uygulama', icon: '📱', count: '1.2k' },
    { id: 'content-writing', name: 'İçerik Yazımı', icon: '✍️', count: '834' },
    { id: 'seo', name: 'SEO & Pazarlama', icon: '📈', count: '967' },
    { id: 'video-editing', name: 'Video Editör', icon: '🎬', count: '543' },
  ];

  // Simple keyword matching
  const keywords: Record<string, string[]> = {
    'web-dev': [
      'web',
      'website',
      'site',
      'frontend',
      'backend',
      'html',
      'css',
      'javascript',
    ],
    'graphic-design': [
      'logo',
      'tasarım',
      'design',
      'grafik',
      'banner',
      'poster',
    ],
    'mobile-dev': ['mobil', 'mobile', 'app', 'uygulama', 'ios', 'android'],
    'content-writing': ['yazı', 'içerik', 'makale', 'blog', 'copywriting'],
    seo: ['seo', 'google', 'arama', 'optimizasyon', 'pazarlama'],
    'video-editing': ['video', 'montaj', 'edit', 'animasyon'],
  };

  const matched = allCategories.filter((category) => {
    const catKeywords = keywords[category.id] || [];
    return catKeywords.some((keyword) => lowerQuery.includes(keyword));
  });

  return matched.length > 0 ? matched.slice(0, 4) : allCategories.slice(0, 4);
}

export function ZeroResultsState({
  query,
  activeFilterCount = 0,
  onClearFilters,
  onSearch,
  className,
  showSuggestions = true,
  showPopular = true,
  showCategories = true,
}: ZeroResultsStateProps) {
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);

  // Alternative suggestions
  const suggestions = showSuggestions
    ? generateAlternativeSuggestions(query)
    : [];

  // Recommended categories
  const recommendedCategories = showCategories
    ? getRecommendedCategories(query)
    : [];

  // Load popular searches
  useEffect(() => {
    if (!showPopular) return;

    setIsLoadingPopular(true);
    fetchPopularSearches(6, 7)
      .then(setPopularSearches)
      .catch((err) => {
        logger.error('[ZeroResultsState] Failed to load popular searches', err instanceof Error ? err : new Error(String(err)));
        setPopularSearches([]);
      })
      .finally(() => setIsLoadingPopular(false));
  }, [showPopular]);

  const handleSuggestionClick = (suggestion: string) => {
    logger.info('[ZeroResultsState] Alternative suggestion clicked', {
      original: query,
      suggestion,
    });
    onSearch?.(suggestion);
  };

  const handlePopularClick = (searchTerm: string) => {
    logger.info('[ZeroResultsState] Popular search clicked', { searchTerm });
    onSearch?.(searchTerm);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Message */}
      <Card className="border-2 border-dashed py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Search className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Sonuç bulunamadı
        </h3>

        <p className="mx-auto mb-6 max-w-md text-gray-600">
          <span className="font-medium">&quot;{query}&quot;</span> için sonuç
          bulunamadı.
          {activeFilterCount > 0 && ' Filtreleri kaldırmayı deneyin.'}
        </p>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Tüm Filtreleri Temizle ({activeFilterCount})
          </Button>
        )}
      </Card>

      {/* Alternative Suggestions */}
      {suggestions.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold text-gray-900">
              Bunu mu demek istediniz?
            </h4>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-700 transition-colors hover:border-purple-300 hover:bg-purple-100"
              >
                <Lightbulb className="h-4 w-4" />
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Searches */}
      {showPopular && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Popüler Aramalar</h4>
          </div>

          {isLoadingPopular ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : popularSearches.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {popularSearches.map((popular, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularClick(popular.searchTerm)}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">
                      {popular.searchTerm}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {popular.searchCount.toLocaleString('tr-TR')}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Popüler aramalar yüklenemedi.
            </p>
          )}
        </Card>
      )}

      {/* Recommended Categories */}
      {recommendedCategories.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-gray-900">İlgili Kategoriler</h4>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onSearch?.(category.name)}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-green-300 hover:bg-green-50 hover:shadow-sm"
              >
                <div className="text-3xl">{category.icon}</div>
                <div className="text-center">
                  <div className="font-medium text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {category.count} hizmet
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Help Text */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex gap-3">
          <Package className="h-5 w-5 shrink-0 text-blue-600" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Arama İpuçları:</p>
            <ul className="mt-2 space-y-1 text-blue-800">
              <li>
                • Daha genel terimler kullanın (örn: &quot;logo&quot; yerine
                &quot;tasarım&quot;)
              </li>
              <li>• Yazım hatalarını kontrol edin</li>
              <li>• Farklı anahtar kelimeler deneyin</li>
              <li>• Filtreleri kaldırarak daha fazla sonuç görün</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ZeroResultsState;
