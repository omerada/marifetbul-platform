'use client';

/**
 * ================================================
 * ADVANCED SEARCH FILTERS SIDEBAR
 * ================================================
 * Sprint DAY 3 - Task 10: Search Functionality Enhancement
 *
 * Advanced search filters with:
 * - Category multi-select with hierarchy
 * - Price range sliders with presets
 * - Location filters with city autocomplete
 * - Rating filters (star ratings)
 * - Delivery time filters
 * - Experience level filters
 * - Language filters
 * - Filter presets (save/load)
 * - Clear all filters
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Enhanced
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import {
  SlidersHorizontal,
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Languages,
  ChevronDown,
  ChevronUp,
  Save,
  FolderOpen,
} from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

interface FilterState {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  locations: string[];
  minRating: number;
  maxDeliveryDays: number;
  experienceLevels: string[];
  languages: string[];
  verified: boolean;
  featured: boolean;
}

interface AdvancedSearchFiltersSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  categories?: Array<{
    id: string;
    name: string;
    subcategories?: Array<{ id: string; name: string }>;
  }>;
  className?: string;
}

// Default filter state - can be used for reset functionality
const _DEFAULT_FILTERS: FilterState = {
  categories: [],
  minPrice: 0,
  maxPrice: 100000,
  locations: [],
  minRating: 0,
  maxDeliveryDays: 365,
  experienceLevels: [],
  languages: [],
  verified: false,
  featured: false,
};

const PRICE_PRESETS = [
  { label: '?0 - ?500', min: 0, max: 500 },
  { label: '?500 - ?2,000', min: 500, max: 2000 },
  { label: '?2,000 - ?5,000', min: 2000, max: 5000 },
  { label: '?5,000+', min: 5000, max: 100000 },
];

const RATING_OPTIONS = [
  { label: '5 Y�ld�z', value: 5 },
  { label: '4+ Y�ld�z', value: 4 },
  { label: '3+ Y�ld�z', value: 3 },
  { label: '2+ Y�ld�z', value: 2 },
];

const DELIVERY_PRESETS = [
  { label: '24 Saat', value: 1 },
  { label: '3 G�n', value: 3 },
  { label: '7 G�n', value: 7 },
  { label: '14 G�n', value: 14 },
  { label: '30 G�n', value: 30 },
];

const EXPERIENCE_LEVELS = [
  { id: 'entry', label: 'Ba�lang��' },
  { id: 'intermediate', label: 'Orta' },
  { id: 'expert', label: 'Uzman' },
  { id: 'senior', label: 'K�demli' },
];

const LANGUAGES = [
  { id: 'tr', label: 'T�rk�e' },
  { id: 'en', label: '�ngilizce' },
  { id: 'de', label: 'Almanca' },
  { id: 'fr', label: 'Frans�zca' },
  { id: 'ar', label: 'Arap�a' },
  { id: 'ru', label: 'Rus�a' },
];

const TOP_CITIES = [
  '�stanbul',
  'Ankara',
  '�zmir',
  'Antalya',
  'Bursa',
  'Adana',
  'Gaziantep',
  'Konya',
];

export function AdvancedSearchFiltersSidebar({
  filters,
  onFiltersChange,
  onClearFilters,
  categories = [],
  className = '',
}: AdvancedSearchFiltersSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['price', 'rating'])
  );
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<Record<string, FilterState>>(
    {}
  );

  // Load saved presets from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('marifet_search_filter_presets');
      if (saved) {
        setSavedPresets(JSON.parse(saved));
      }
    } catch (error) {
      logger.error(
        'Failed to load filter presets', error instanceof Error ? error : new Error(String(error)));
    }
  }, []);

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

  const isSectionExpanded = (section: string) => expandedSections.has(section);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayValue = (key: keyof FilterState, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as FilterState[typeof key]);
  };

  const setPricePreset = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const savePreset = () => {
    if (!presetName.trim()) {
      alert('L�tfen bir preset ad� girin');
      return;
    }

    const newPresets = {
      ...savedPresets,
      [presetName]: filters,
    };

    setSavedPresets(newPresets);
    localStorage.setItem(
      'marifet_search_filter_presets',
      JSON.stringify(newPresets)
    );
    setPresetName('');
    logger.info('Filter preset saved', { name: presetName });
  };

  const loadPreset = (name: string) => {
    const preset = savedPresets[name];
    if (preset) {
      onFiltersChange(preset);
      logger.info('Filter preset loaded', { name });
    }
  };

  const deletePreset = (name: string) => {
    const newPresets = { ...savedPresets };
    delete newPresets[name];
    setSavedPresets(newPresets);
    localStorage.setItem(
      'marifet_search_filter_presets',
      JSON.stringify(newPresets)
    );
    logger.info('Filter preset deleted', { name });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.locations.length +
    filters.experienceLevels.length +
    filters.languages.length +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < 100000 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDeliveryDays < 365 ? 1 : 0) +
    (filters.verified ? 1 : 0) +
    (filters.featured ? 1 : 0);

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-primary h-5 w-5" />
            <h3 className="font-semibold">Geli�mi� Filtreler</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <UnifiedButton
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            disabled={activeFilterCount === 0}
          >
            <X className="mr-1 h-4 w-4" />
            Temizle
          </UnifiedButton>
        </div>

        {/* Save/Load Presets */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Preset ad�..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              className="flex-1"
            />
            <UnifiedButton
              variant="outline"
              size="sm"
              onClick={savePreset}
              disabled={!presetName.trim()}
              title="Filtreleri Kaydet"
            >
              <Save className="h-4 w-4" />
            </UnifiedButton>
          </div>

          {Object.keys(savedPresets).length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground flex items-center gap-1 text-xs">
                <FolderOpen className="h-3 w-3" />
                Kaydedilmi� Presetler
              </Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(savedPresets).map((name) => (
                  <div
                    key={name}
                    className="bg-muted flex items-center gap-1 rounded-md px-2 py-1"
                  >
                    <button
                      onClick={() => loadPreset(name)}
                      className="hover:text-primary text-xs transition-colors"
                    >
                      {name}
                    </button>
                    <button
                      onClick={() => deletePreset(name)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">H�zl� Filtreler</Label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateFilter('verified', !filters.verified)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.verified
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              ? Do�rulanm��
            </button>
            <button
              onClick={() => updateFilter('featured', !filters.featured)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.featured
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              ? �ne ��kanlar
            </button>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('categories')}
              className="hover:text-primary flex w-full items-center justify-between transition-colors"
            >
              <Label className="cursor-pointer text-sm font-medium">
                Kategoriler
              </Label>
              {isSectionExpanded('categories') ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {isSectionExpanded('categories') && (
              <div className="space-y-2 pl-2">
                {categories.slice(0, 8).map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={filters.categories.includes(category.id)}
                      onChange={() =>
                        toggleArrayValue('categories', category.id)
                      }
                    />
                    <label
                      htmlFor={`cat-${category.id}`}
                      className="cursor-pointer text-sm"
                    >
                      {category.name}
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
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Fiyat Aral���
            </Label>
            {isSectionExpanded('price') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('price') && (
            <div className="space-y-3 pl-2">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    updateFilter('minPrice', Number(e.target.value))
                  }
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    updateFilter('maxPrice', Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {PRICE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setPricePreset(preset.min, preset.max)}
                    className={`rounded-md px-2 py-1 text-xs transition-colors ${
                      filters.minPrice === preset.min &&
                      filters.maxPrice === preset.max
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('location')}
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Lokasyon
            </Label>
            {isSectionExpanded('location') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('location') && (
            <div className="space-y-2 pl-2">
              {TOP_CITIES.map((city) => (
                <div key={city} className="flex items-center space-x-2">
                  <Checkbox
                    id={`city-${city}`}
                    checked={filters.locations.includes(city)}
                    onChange={() => toggleArrayValue('locations', city)}
                  />
                  <label
                    htmlFor={`city-${city}`}
                    className="cursor-pointer text-sm"
                  >
                    {city}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('rating')}
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4" />
              De�erlendirme
            </Label>
            {isSectionExpanded('rating') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('rating') && (
            <div className="space-y-2 pl-2">
              {RATING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('minRating', option.value)}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    filters.minRating === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {Array.from({ length: option.value }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Time */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('delivery')}
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Teslimat S�resi
            </Label>
            {isSectionExpanded('delivery') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('delivery') && (
            <div className="space-y-2 pl-2">
              <Select
                value={filters.maxDeliveryDays.toString()}
                onValueChange={(value) =>
                  updateFilter('maxDeliveryDays', Number(value))
                }
              >
                <SelectTrigger placeholder="Maksimum s�re" />
                <SelectContent>
                  {DELIVERY_PRESETS.map((preset) => (
                    <SelectItem
                      key={preset.value}
                      value={preset.value.toString()}
                    >
                      {preset.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="365">T�m�</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('experience')}
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4" />
              Deneyim Seviyesi
            </Label>
            {isSectionExpanded('experience') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('experience') && (
            <div className="space-y-2 pl-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <div key={level.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`exp-${level.id}`}
                    checked={filters.experienceLevels.includes(level.id)}
                    onChange={() =>
                      toggleArrayValue('experienceLevels', level.id)
                    }
                  />
                  <label
                    htmlFor={`exp-${level.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {level.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <button
            onClick={() => toggleSection('languages')}
            className="hover:text-primary flex w-full items-center justify-between transition-colors"
          >
            <Label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4" />
              Diller
            </Label>
            {isSectionExpanded('languages') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {isSectionExpanded('languages') && (
            <div className="space-y-2 pl-2">
              {LANGUAGES.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language.id}`}
                    checked={filters.languages.includes(language.id)}
                    onChange={() => toggleArrayValue('languages', language.id)}
                  />
                  <label
                    htmlFor={`lang-${language.id}`}
                    className="cursor-pointer text-sm"
                  >
                    {language.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
