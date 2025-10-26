'use client';

/**
 * Marketplace Package Filters
 * Search and filter controls for public package listings
 */

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';
import { categoryApi } from '@/lib/api/categories';
import type { Category } from '@/types/business/features/marketplace-categories';

interface MarketplaceFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryId: string;
  onCategoryChange: (categoryId: string) => void;
  minPrice: string;
  onMinPriceChange: (price: string) => void;
  maxPrice: string;
  onMaxPriceChange: (price: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function MarketplaceFilters({
  searchQuery,
  onSearchChange,
  categoryId,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  sortBy,
  onSortChange,
}: MarketplaceFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to empty array
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Paket ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            value={categoryId}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={loadingCategories}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {loadingCategories ? 'Yükleniyor...' : 'Tüm Kategoriler'}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Min Fiyat (₺)
          </label>
          <Input
            type="number"
            placeholder="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            min="0"
          />
        </div>

        {/* Max Price */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Max Fiyat (₺)
          </label>
          <Input
            type="number"
            placeholder="10000"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            min="0"
          />
        </div>

        {/* Sort */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Sırala
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="relevant">En Uygun</option>
            <option value="rating">En Yüksek Puan</option>
            <option value="popular">En Popüler</option>
            <option value="newest">En Yeni</option>
            <option value="price_asc">Fiyat (Düşük → Yüksek)</option>
            <option value="price_desc">Fiyat (Yüksek → Düşük)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
