'use client';

import { useState, useCallback } from 'react';
import {
  X,
  ChevronDown,
  ChevronUp,
  Search,
  MapPin,
  Star,
  Clock,
  DollarSign,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatNumber } from '@/lib/shared/formatters';

interface FilterOption {
  id: string;
  label: string;
  count?: number;
  selected?: boolean;
}

export interface FilterSection {
  id: string;
  title: string;
  type: 'multiselect' | 'range' | 'radio' | 'search';
  options?: FilterOption[];
  value?: { min: string; max: string } | string;
  icon?: React.ReactNode;
  expanded?: boolean;
}

interface MobileFiltersSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterSection[];
  onApplyFilters: (filters: FilterSection[]) => void;
  onClearAll: () => void;
  resultCount?: number;
}

interface AccordionSectionProps {
  section: FilterSection;
  onUpdate: (
    sectionId: string,
    value: FilterOption[] | { min: string; max: string }
  ) => void;
  expanded: boolean;
  onToggle: (sectionId: string) => void;
}

function AccordionSection({
  section,
  onUpdate,
  expanded,
  onToggle,
}: AccordionSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions =
    section.options?.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleOptionToggle = (optionId: string) => {
    if (section.type === 'multiselect') {
      const updatedOptions =
        section.options?.map((option) => ({
          ...option,
          selected: option.id === optionId ? !option.selected : option.selected,
        })) || [];
      onUpdate(section.id, updatedOptions);
    } else if (section.type === 'radio') {
      const updatedOptions =
        section.options?.map((option) => ({
          ...option,
          selected: option.id === optionId,
        })) || [];
      onUpdate(section.id, updatedOptions);
    }
  };

  const renderContent = () => {
    switch (section.type) {
      case 'search':
        return (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder={`${section.title} ara...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {filteredOptions.map((option) => (
                <label
                  key={option.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={option.selected || false}
                      onChange={() => handleOptionToggle(option.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {option.label}
                    </span>
                  </div>
                  {option.count && (
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 'multiselect':
      case 'radio':
        return (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {section.options?.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type={section.type === 'multiselect' ? 'checkbox' : 'radio'}
                    name={section.id}
                    checked={option.selected || false}
                    onChange={() => handleOptionToggle(option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
                {option.count && (
                  <Badge variant="secondary" className="text-xs">
                    {option.count}
                  </Badge>
                )}
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="space-y-4">
            <div className="flex space-x-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Min
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={
                    typeof section.value === 'object'
                      ? section.value?.min || ''
                      : ''
                  }
                  onChange={(e) =>
                    onUpdate(section.id, {
                      ...(typeof section.value === 'object'
                        ? section.value
                        : { min: '', max: '' }),
                      min: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Max
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  value={
                    typeof section.value === 'object'
                      ? section.value?.max || ''
                      : ''
                  }
                  onChange={(e) =>
                    onUpdate(section.id, {
                      ...(typeof section.value === 'object'
                        ? section.value
                        : { min: '', max: '' }),
                      max: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            {section.id === 'budget' && (
              <div className="grid grid-cols-2 gap-2">
                {['₺500', '₺1.000', '₺2.500', '₺5.000'].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const value = parseInt(
                        preset.replace('₺', '').replace('.', '')
                      );
                      onUpdate(section.id, { min: '0', max: value.toString() });
                    }}
                    className="text-xs"
                  >
                    {preset}&apos;e kadar
                  </Button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <button
        onClick={() => onToggle(section.id)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center space-x-3">
          {section.icon}
          <span className="font-medium text-gray-900">{section.title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="pt-3">{renderContent()}</div>
        </div>
      )}
    </Card>
  );
}

export function MobileFiltersSheet({
  isOpen,
  onClose,
  filters: initialFilters,
  onApplyFilters,
  onClearAll,
  resultCount = 0,
}: MobileFiltersSheetProps) {
  const [filters, setFilters] = useState<FilterSection[]>(initialFilters);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'budget']) // Default expanded sections
  );

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleFilterUpdate = useCallback(
    (
      sectionId: string,
      value: FilterOption[] | { min: string; max: string }
    ) => {
      setFilters((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                options: Array.isArray(value) ? value : section.options,
                value: !Array.isArray(value) ? value : section.value,
              }
            : section
        )
      );
    },
    []
  );

  const getSelectedCount = useCallback(() => {
    return filters.reduce((count, section) => {
      if (section.type === 'multiselect' || section.type === 'radio') {
        return (
          count + (section.options?.filter((opt) => opt.selected).length || 0)
        );
      }
      if (
        section.type === 'range' &&
        section.value &&
        typeof section.value === 'object'
      ) {
        return count + (section.value.min || section.value.max ? 1 : 0);
      }
      return count;
    }, 0);
  }, [filters]);

  const handleClearAll = useCallback(() => {
    const clearedFilters = filters.map((section) => ({
      ...section,
      options: section.options?.map((opt) => ({ ...opt, selected: false })),
      value: section.type === 'range' ? { min: '', max: '' } : section.value,
    }));
    setFilters(clearedFilters);
    onClearAll();
  }, [filters, onClearAll]);

  const handleApply = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 bg-black">
      <div className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col rounded-t-2xl bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
            {getSelectedCount() > 0 && (
              <Badge variant="default" className="bg-blue-100 text-blue-700">
                {getSelectedCount()} seçili
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1">
            {filters.map((section) => (
              <AccordionSection
                key={section.id}
                section={section}
                onUpdate={handleFilterUpdate}
                expanded={expandedSections.has(section.id)}
                onToggle={handleSectionToggle}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {formatNumber(resultCount)} sonuç bulundu
            </span>
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              Tümünü Temizle
            </Button>
          </div>
          <Button
            onClick={handleApply}
            className="w-full bg-blue-600 text-white hover:bg-blue-700"
            size="lg"
          >
            Filtreleri Uygula
          </Button>
        </div>
      </div>
    </div>
  );
}

// Example usage with default filter configuration
export const defaultMobileFilters: FilterSection[] = [
  {
    id: 'category',
    title: 'Kategori',
    type: 'search',
    icon: <Search className="h-4 w-4 text-gray-500" />,
    options: [
      { id: 'web-dev', label: 'Web Geliştirme', count: 245, selected: false },
      {
        id: 'mobile-dev',
        label: 'Mobil Uygulama',
        count: 128,
        selected: false,
      },
      { id: 'design', label: 'Grafik Tasarım', count: 186, selected: false },
      { id: 'writing', label: 'İçerik Yazımı', count: 92, selected: false },
      { id: 'translation', label: 'Çeviri', count: 76, selected: false },
      {
        id: 'marketing',
        label: 'Dijital Pazarlama',
        count: 154,
        selected: false,
      },
      { id: 'data', label: 'Veri Analizi', count: 67, selected: false },
      { id: 'video', label: 'Video Editleme', count: 89, selected: false },
    ],
  },
  {
    id: 'budget',
    title: 'Bütçe Aralığı',
    type: 'range',
    icon: <DollarSign className="h-4 w-4 text-gray-500" />,
    value: { min: '', max: '' },
  },
  {
    id: 'location',
    title: 'Konum',
    type: 'search',
    icon: <MapPin className="h-4 w-4 text-gray-500" />,
    options: [
      { id: 'istanbul', label: 'İstanbul', count: 412, selected: false },
      { id: 'ankara', label: 'Ankara', count: 156, selected: false },
      { id: 'izmir', label: 'İzmir', count: 134, selected: false },
      { id: 'antalya', label: 'Antalya', count: 67, selected: false },
      { id: 'bursa', label: 'Bursa', count: 89, selected: false },
      { id: 'remote', label: 'Uzaktan', count: 324, selected: false },
    ],
  },
  {
    id: 'rating',
    title: 'Değerlendirme',
    type: 'radio',
    icon: <Star className="h-4 w-4 text-gray-500" />,
    options: [
      { id: '5-star', label: '5 Yıldız', count: 89, selected: false },
      { id: '4-plus', label: '4+ Yıldız', count: 234, selected: false },
      { id: '3-plus', label: '3+ Yıldız', count: 456, selected: false },
      { id: 'any', label: 'Herhangi', count: 789, selected: false },
    ],
  },
  {
    id: 'delivery',
    title: 'Teslimat Süresi',
    type: 'multiselect',
    icon: <Clock className="h-4 w-4 text-gray-500" />,
    options: [
      { id: '24h', label: '24 Saat', count: 45, selected: false },
      { id: '3-days', label: '3 Gün', count: 128, selected: false },
      { id: '1-week', label: '1 Hafta', count: 267, selected: false },
      { id: '2-weeks', label: '2 Hafta', count: 189, selected: false },
      { id: '1-month', label: '1 Ay', count: 95, selected: false },
    ],
  },
];

// Default export
export default MobileFiltersSheet;
