'use client';

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { UnifiedButton } from '@/components/ui/UnifiedButton';

interface SearchHeaderProps {
  query: string;
  onSearch: (query: string) => void;
  activeFiltersCount: number;
  onClearFilters: () => void;
}

export function SearchHeader({
  query: initialQuery,
  onSearch,
  activeFiltersCount,
  onClearFilters,
}: SearchHeaderProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">Advanced Search</h1>
        <p className="text-muted-foreground">
          Find services using multiple filters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <UnifiedButton type="submit">Search</UnifiedButton>
        {activeFiltersCount > 0 && (
          <UnifiedButton
            type="button"
            variant="outline"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters ({activeFiltersCount})
          </UnifiedButton>
        )}
      </form>
    </div>
  );
}
