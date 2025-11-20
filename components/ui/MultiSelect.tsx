'use client';

/**
 * MultiSelect Component
 * Sprint: Marketplace Advanced Filters
 *
 * Reusable multi-select dropdown with search functionality
 * Used for skills, tags, and other multi-value selections
 */

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './Badge';

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDisplay?: number;
  searchable?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seçiniz...',
  disabled = false,
  maxDisplay = 2,
  searchable = true,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions = searchQuery
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Get selected option labels
  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  // Toggle option selection
  const toggleOption = (optionValue: string) => {
    if (disabled) return;

    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];

    onChange(newValue);
  };

  // Remove specific value
  const removeValue = (valueToRemove: string) => {
    if (disabled) return;
    onChange(value.filter((v) => v !== valueToRemove));
  };

  // Clear all selections
  const clearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm transition-colors',
          'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'hover:border-gray-400'
        )}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <>
              {/* Show first N selected items */}
              {selectedLabels.slice(0, maxDisplay).map((label, index) => (
                <Badge
                  key={value[index]}
                  variant="secondary"
                  className="flex items-center gap-1 text-xs"
                >
                  {label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(value[index]);
                      }}
                      className="rounded-full hover:bg-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}

              {/* Show count if more items selected */}
              {value.length > maxDisplay && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - maxDisplay} daha
                </Badge>
              )}
            </>
          )}
        </div>

        <div className="ml-2 flex items-center gap-1">
          {value.length > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="rounded-full p-0.5 hover:bg-gray-200"
              aria-label="Tümünü temizle"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          {/* Search Input */}
          {searchable && (
            <div className="border-b border-gray-200 p-2">
              <div className="relative">
                <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-gray-300 py-1.5 pr-3 pl-8 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Sonuç bulunamadı
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleOption(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors',
                      isSelected && 'bg-blue-50 text-blue-700',
                      !isSelected && 'text-gray-700 hover:bg-gray-100',
                      option.disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {value.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-200 p-2">
              <span className="text-xs text-gray-600">
                {value.length} seçili
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
