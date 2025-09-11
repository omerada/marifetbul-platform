'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, Zap, Users, Star } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { useSearchSuggestions } from '@/hooks/useFilters';

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: 'jobs' | 'services';
  quickStats: {
    jobs: { total: number; thisWeek: number; trending: string };
    services: { total: number; thisWeek: number; trending: string };
  };
}

export function MarketplaceHeader({
  searchQuery,
  onSearchChange,
  activeTab,
  quickStats,
}: MarketplaceHeaderProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const { suggestions, isLoading } = useSearchSuggestions(
    searchQuery,
    activeTab === 'services' ? 'packages' : activeTab
  );

  // Handle search suggestions
  useEffect(() => {
    setShowSuggestions(inputFocused && searchQuery.length > 1);
  }, [inputFocused, searchQuery]);

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    setInputFocused(false);
  };

  const clearSearch = () => {
    onSearchChange('');
    setShowSuggestions(false);
  };

  return (
    <section className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            {activeTab === 'jobs' ? (
              <TrendingUp className="h-8 w-8 text-white" />
            ) : (
              <Zap className="h-8 w-8 text-white" />
            )}
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gray-900">
            {activeTab === 'jobs' ? 'İş Fırsatları' : 'Hizmet Pazarı'}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            {activeTab === 'jobs'
              ? 'Hayalinizdeki projeyi bulun veya yetenekli freelancerlarla tanışın'
              : 'İhtiyacınıza uygun profesyonel hizmetleri keşfedin'}
          </p>
        </div>

        {/* Enhanced Search Section */}
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder={
                  activeTab === 'jobs'
                    ? 'İş ara... (örn: React Developer, UI/UX Designer)'
                    : 'Hizmet ara... (örn: Logo Tasarım, Web Geliştirme)'
                }
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow click
                  setTimeout(() => setInputFocused(false), 200);
                }}
                className="h-14 border-2 py-4 pr-20 pl-12 text-lg shadow-lg focus:border-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-16 flex items-center rounded-md pr-3 hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <Button
                size="lg"
                className="absolute top-1/2 right-2 h-10 -translate-y-1/2 transform px-6"
              >
                Ara
              </Button>
            </div>

            {/* Search Suggestions */}
            {showSuggestions && (suggestions.length > 0 || isLoading) && (
              <Card className="absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Öneriler yükleniyor...
                  </div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left transition-colors hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <span>{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="transform rounded-lg bg-blue-50 p-4 text-center transition-all hover:scale-105">
              <div className="mb-2 flex items-center justify-center">
                <Users className="mr-1 h-5 w-5 text-blue-600" />
                <div className="text-2xl font-bold text-blue-600">
                  {quickStats[activeTab].total.toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-blue-600">
                Toplam {activeTab === 'jobs' ? 'İş İlanı' : 'Hizmet'}
              </div>
            </div>
            <div className="transform rounded-lg bg-green-50 p-4 text-center transition-all hover:scale-105">
              <div className="mb-2 flex items-center justify-center">
                <TrendingUp className="mr-1 h-5 w-5 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  +{quickStats[activeTab].thisWeek}
                </div>
              </div>
              <div className="text-sm text-green-600">Bu Hafta Yeni</div>
            </div>
            <div className="transform rounded-lg bg-purple-50 p-4 text-center transition-all hover:scale-105">
              <div className="mb-2 flex items-center justify-center">
                <Star className="mr-1 h-5 w-5 text-purple-600" />
                <div className="truncate text-lg font-semibold text-purple-600">
                  {quickStats[activeTab].trending}
                </div>
              </div>
              <div className="text-sm text-purple-600">En Popüler</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
