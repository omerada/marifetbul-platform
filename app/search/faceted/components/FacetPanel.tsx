'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import type { Facets, SearchFilters } from '@/hooks/business/search';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FacetPanelProps {
  facets: Facets;
  filters: SearchFilters;
  onToggleFacet: (facetType: string, value: string) => void;
  onUpdateFilters: (filters: Partial<SearchFilters>) => void;
  isLoading: boolean;
}

export function FacetPanel({
  facets,
  filters,
  onToggleFacet,
  onUpdateFilters,
  isLoading,
}: FacetPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'price', 'location', 'rating'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          Filters
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Facet */}
        {facets.category && facets.category.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('category')}
              className="flex w-full items-center justify-between font-medium"
            >
              <span>Category</span>
              {expandedSections.has('category') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('category') && (
              <div className="space-y-2 pl-2">
                {facets.category.map((facet) => (
                  <div key={facet.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`category-${facet.value}`}
                      checked={filters.categories?.includes(facet.value)}
                      onChange={() => onToggleFacet('category', facet.value)}
                    />
                    <label
                      htmlFor={`category-${facet.value}`}
                      className="flex flex-1 cursor-pointer justify-between text-sm"
                    >
                      <span>{facet.value}</span>
                      <span className="text-muted-foreground">
                        ({facet.count})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('price')}
            className="flex w-full items-center justify-between font-medium"
          >
            <span>Price Range</span>
            {expandedSections.has('price') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has('price') && (
            <div className="space-y-3 pl-2">
              <div>
                <Label htmlFor="price-min" className="text-xs">
                  Minimum
                </Label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder="Min price"
                  value={filters.priceMin || ''}
                  onChange={(e) =>
                    onUpdateFilters({
                      priceMin: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="price-max" className="text-xs">
                  Maximum
                </Label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder="Max price"
                  value={filters.priceMax || ''}
                  onChange={(e) =>
                    onUpdateFilters({
                      priceMax: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {/* Location Facet */}
        {facets.location && facets.location.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('location')}
              className="flex w-full items-center justify-between font-medium"
            >
              <span>Location</span>
              {expandedSections.has('location') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {expandedSections.has('location') && (
              <div className="space-y-2 pl-2">
                {facets.location.map((facet) => (
                  <div key={facet.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`location-${facet.value}`}
                      checked={filters.locations?.includes(facet.value)}
                      onChange={() => onToggleFacet('location', facet.value)}
                    />
                    <label
                      htmlFor={`location-${facet.value}`}
                      className="flex flex-1 cursor-pointer justify-between text-sm"
                    >
                      <span>{facet.value}</span>
                      <span className="text-muted-foreground">
                        ({facet.count})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rating Filter */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('rating')}
            className="flex w-full items-center justify-between font-medium"
          >
            <span>Minimum Rating</span>
            {expandedSections.has('rating') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has('rating') && (
            <div className="space-y-2 pl-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={filters.minRating === rating}
                    onChange={() =>
                      onUpdateFilters({
                        minRating:
                          filters.minRating === rating ? undefined : rating,
                      })
                    }
                  />
                  <label
                    htmlFor={`rating-${rating}`}
                    className="flex cursor-pointer items-center gap-1 text-sm"
                  >
                    <span>{rating}</span>
                    <span className="text-yellow-500">★</span>
                    <span className="text-muted-foreground">& up</span>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
