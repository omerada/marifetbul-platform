'use client';

import React, { useState, useCallback } from 'react';
import { useAdvancedSearchStore } from '@/lib/core/store/advanced-search';
import { AdvancedSearchRequest } from '@/types';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Save,
  Trash2,
  MapPin,
  TrendingUp,
  X,
  Star,
} from 'lucide-react';

interface FilterState {
  category: string;
  minBudget: string;
  maxBudget: string;
  location: string;
  skills: string[];
}

interface AdvancedSearchFormProps {
  onSearch?: (query: string, filters: FilterState) => void;
  className?: string;
}

export const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  className = '',
}) => {
  const {
    searchQuery,
    suggestions,
    savedSearches,
    isLoading,
    setSearchQuery,
    performAdvancedSearch,
    getSuggestions,
    saveSearch,
    deleteSavedSearch,
    reset,
  } = useAdvancedSearchStore();

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    category: '',
    minBudget: '',
    maxBudget: '',
    location: '',
    skills: [],
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Handle search input changes
  const handleSearchChange = useCallback(
    async (value: string) => {
      setSearchQuery(value);

      if (value.length >= 2) {
        await getSuggestions(value);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    },
    [setSearchQuery, getSuggestions]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const searchRequest: AdvancedSearchRequest = {
        query: searchQuery,
        filters: {
          category: activeFilters.category || undefined,
          priceRange:
            activeFilters.minBudget || activeFilters.maxBudget
              ? {
                  min: activeFilters.minBudget
                    ? Number(activeFilters.minBudget)
                    : 0,
                  max: activeFilters.maxBudget
                    ? Number(activeFilters.maxBudget)
                    : 999999,
                }
              : undefined,
          location: activeFilters.location || undefined,
          skills:
            activeFilters.skills.length > 0 ? activeFilters.skills : undefined,
        },
        page: 1,
        limit: 20,
      };

      await performAdvancedSearch(searchRequest);
      onSearch?.(searchQuery, activeFilters);
      setShowSuggestions(false);
    },
    [searchQuery, activeFilters, performAdvancedSearch, onSearch]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
    },
    [setSearchQuery]
  );

  // Handle saved search operations
  const handleSaveSearch = useCallback(async () => {
    if (searchName.trim()) {
      const searchRequest = {
        name: searchName.trim(),
        query: searchQuery,
        filters: {
          category: activeFilters.category || undefined,
          budget:
            activeFilters.minBudget || activeFilters.maxBudget
              ? {
                  min: activeFilters.minBudget
                    ? Number(activeFilters.minBudget)
                    : undefined,
                  max: activeFilters.maxBudget
                    ? Number(activeFilters.maxBudget)
                    : undefined,
                }
              : undefined,
          location: activeFilters.location
            ? {
                city: activeFilters.location,
              }
            : undefined,
          skills:
            activeFilters.skills.length > 0 ? activeFilters.skills : undefined,
          sortBy: 'relevance' as const,
          page: 1,
        },
      };
      await saveSearch(searchRequest);
      setSearchName('');
      setShowSaveDialog(false);
    }
  }, [searchName, searchQuery, activeFilters, saveSearch]);

  const handleLoadSearch = useCallback(
    async (searchId: string) => {
      const savedSearch = savedSearches.find(
        (search) => search.id === searchId
      );
      if (savedSearch && savedSearch.filters) {
        // Load the saved search query and filters
        setSearchQuery(savedSearch.query);

        // Apply saved filters to the form
        setActiveFilters({
          category: savedSearch.filters.category || '',
          minBudget: savedSearch.filters.priceRange?.min?.toString() || '',
          maxBudget: savedSearch.filters.priceRange?.max?.toString() || '',
          location: savedSearch.filters.location || '',
          skills: savedSearch.filters.skills || [],
        });

        // Trigger a search with the loaded parameters
        if (onSearch) {
          onSearch(savedSearch.query, {
            category: savedSearch.filters.category || '',
            minBudget: savedSearch.filters.priceRange?.min?.toString() || '',
            maxBudget: savedSearch.filters.priceRange?.max?.toString() || '',
            location: savedSearch.filters.location || '',
            skills: savedSearch.filters.skills || [],
          });
        }
      }
      setShowSavedSearches(false);
    },
    [savedSearches, setSearchQuery, onSearch]
  );

  const handleDeleteSearch = useCallback(
    async (searchId: string) => {
      await deleteSavedSearch(searchId);
    },
    [deleteSavedSearch]
  );

  // Clear all filters
  const handleClearAll = useCallback(() => {
    reset();
    setActiveFilters({
      category: '',
      minBudget: '',
      maxBudget: '',
      location: '',
      skills: [],
    });
    setShowSuggestions(false);
  }, [reset]);

  // Update filter
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | string[]) => {
      setActiveFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Gelişmiş Arama
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Keyword Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Anahtar kelime, beceri veya başlık ara..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
              <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto">
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionSelect(suggestion)}
                        className="hover:bg-accent flex w-full items-center gap-2 rounded-md p-2 text-left"
                      >
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <div className="font-medium">{suggestion}</div>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Location Search */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Şehir veya bölge seç..."
                value={activeFilters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="pr-10"
              />
              <MapPin className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform" />
            </div>

            {/* Category Filter */}
            <div>
              <label className="mb-2 block text-sm font-medium">Kategori</label>
              <select
                value={activeFilters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="border-input bg-background w-full rounded-md border p-2"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="web-development">Web Geliştirme</option>
                <option value="mobile-development">Mobil Geliştirme</option>
                <option value="design">Tasarım</option>
                <option value="marketing">Pazarlama</option>
                <option value="writing">Yazım & Çeviri</option>
                <option value="data-science">Veri Bilimi</option>
                <option value="consulting">Danışmanlık</option>
              </select>
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Min Bütçe
                </label>
                <Input
                  type="number"
                  placeholder="Minimum"
                  value={activeFilters.minBudget}
                  onChange={(e) => updateFilter('minBudget', e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Max Bütçe
                </label>
                <Input
                  type="number"
                  placeholder="Maksimum"
                  value={activeFilters.maxBudget}
                  onChange={(e) => updateFilter('maxBudget', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px] flex-1"
              >
                {isLoading ? 'Aranıyor...' : 'Ara'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaveDialog(true)}
                disabled={!searchQuery}
              >
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSavedSearches(!showSavedSearches)}
              >
                <Star className="mr-2 h-4 w-4" />
                Kaydedilenler
              </Button>

              <Button type="button" variant="ghost" onClick={handleClearAll}>
                <X className="mr-2 h-4 w-4" />
                Temizle
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(searchQuery ||
        activeFilters.category ||
        activeFilters.location ||
        activeFilters.minBudget ||
        activeFilters.maxBudget) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Aktif Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}

              {activeFilters.category && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeFilters.category}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('category', '')}
                  />
                </Badge>
              )}

              {activeFilters.location && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {activeFilters.location}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => updateFilter('location', '')}
                  />
                </Badge>
              )}

              {(activeFilters.minBudget || activeFilters.maxBudget) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {activeFilters.minBudget && activeFilters.maxBudget
                    ? `${activeFilters.minBudget} - ${activeFilters.maxBudget} TL`
                    : activeFilters.minBudget
                      ? `${activeFilters.minBudget}+ TL`
                      : `${activeFilters.maxBudget} TL'ye kadar`}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      updateFilter('minBudget', '');
                      updateFilter('maxBudget', '');
                    }}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <Card className="border-primary border-2">
          <CardHeader>
            <CardTitle className="text-sm">Aramayı Kaydet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Arama adı girin..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSearch}
                  disabled={!searchName.trim()}
                >
                  Kaydet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  İptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Searches */}
      {showSavedSearches && savedSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Kaydedilen Aramalar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="hover:bg-accent flex items-center justify-between rounded-md p-2"
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleLoadSearch(search.id)}
                  >
                    <div className="font-medium">{search.name}</div>
                    <div className="text-muted-foreground text-sm">
                      Kayıtlı arama
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSearch(search.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
