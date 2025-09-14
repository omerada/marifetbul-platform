'use client';

import React, { useState } from 'react';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';

interface SearchResult {
  title: string;
  description: string;
  category?: string;
}

export interface AdvancedSearchProps {
  onSearch?: (results: SearchResult[]) => void;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  const { results, isLoading, search } = useUnifiedSearch();

  const handleSearch = async () => {
    await search(query, {
      location,
      category,
      type: 'all',
    });

    if (onSearch) {
      onSearch(results);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Label htmlFor="search-query">Arama Terimi</Label>
          <Input
            id="search-query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İş, hizmet veya freelancer ara..."
          />
        </div>

        <div>
          <Label htmlFor="search-location">Konum</Label>
          <Input
            id="search-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Şehir veya bölge..."
          />
        </div>

        <div>
          <Label htmlFor="search-category">Kategori</Label>
          <Input
            id="search-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Kategori seçin..."
          />
        </div>
      </div>

      <Button
        onClick={handleSearch}
        disabled={isLoading}
        className="w-full md:w-auto"
      >
        {isLoading ? 'Aranıyor...' : 'Ara'}
      </Button>

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-lg font-semibold">
            {results.length} sonuç bulundu
          </h3>
          <div className="space-y-2">
            {results.map((result: SearchResult, index: number) => (
              <div key={index} className="rounded-lg border p-4">
                <h4 className="font-medium">{result.title}</h4>
                <p className="text-sm text-gray-600">{result.description}</p>
                {result.category && (
                  <Badge variant="secondary" className="mt-2">
                    {result.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
