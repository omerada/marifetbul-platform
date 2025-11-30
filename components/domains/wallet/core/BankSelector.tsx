'use client';

/**
 * ================================================
 * BANK SELECTOR COMPONENT
 * ================================================
 * Autocomplete bank selection with Turkish banks
 *
 * Features:
 * - Autocomplete search
 * - Turkish bank list (38+ banks)
 * - Bank logo display (placeholder)
 * - Keyboard navigation
 * - Selected bank display
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created October 30, 2025
 * @updated November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 1: Bank Account Management
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Building2, Search, Check, ChevronDown, X } from 'lucide-react';
import {
  searchBanks,
  getAllBanks,
  type BankInfo,
} from '@/lib/services/bank-info-service';

// ================================================
// TYPES
// ================================================

export interface BankSelectorProps {
  value?: BankInfo | null;
  onChange: (bank: BankInfo | null) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

// ================================================
// COMPONENT
// ================================================

export const BankSelector: React.FC<BankSelectorProps> = ({
  value,
  onChange,
  label = 'Banka Seçin',
  placeholder = 'Banka adı ile ara...',
  required = false,
  disabled = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBanks, setFilteredBanks] = useState<BankInfo[]>(
    getAllBanks({ activeOnly: true, sortBy: 'name' })
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // ==================== EFFECTS ====================

  // Filter banks when search query changes
  useEffect(() => {
    if (searchQuery) {
      const results = searchBanks(searchQuery, { activeOnly: true });
      setFilteredBanks(results);
      setSelectedIndex(0);
    } else {
      setFilteredBanks(getAllBanks({ activeOnly: true, sortBy: 'name' }));
      setSelectedIndex(0);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ==================== HANDLERS ====================

  const handleSelect = (bank: BankInfo) => {
    onChange(bank);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredBanks.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredBanks[selectedIndex]) {
          handleSelect(filteredBanks[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex, isOpen]);

  // ==================== RENDER ====================

  return (
    <div ref={containerRef} className={`relative space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <Label htmlFor="bank-selector">
          {label}
          {required && <span className="text-red-600">*</span>}
        </Label>
      )}

      {/* Selected Bank Display */}
      {value && !isOpen ? (
        <div
          className={`flex items-center justify-between rounded-lg border-2 p-3 ${
            error ? 'border-red-500' : 'border-green-500'
          } bg-white transition-colors`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{value.name}</p>
              <p className="text-xs text-gray-600">Kod: {value.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="gap-1">
              <Check className="h-3 w-3" />
              Seçili
            </Badge>
            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-full p-1 hover:bg-gray-100"
                title="Temizle"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Search Input */
        <div className="relative">
          <div className="absolute top-1/2 left-3 -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            ref={inputRef}
            id="bank-selector"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`pr-10 pl-10 ${error ? 'border-red-500' : ''}`}
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      )}

      {/* Dropdown List */}
      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filteredBanks.length > 0 ? (
            <ul ref={listRef} className="py-1">
              {filteredBanks.map((bank, index) => (
                <li key={bank.code}>
                  <button
                    type="button"
                    onClick={() => handleSelect(bank)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{bank.name}</p>
                      <p className="text-xs text-gray-600">Kod: {bank.code}</p>
                    </div>
                    {value?.code === bank.code && (
                      <Check className="h-5 w-5 text-green-600" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm">Banka bulunamadı</p>
              <p className="text-xs">
                Arama kriterlerinizi değiştirip tekrar deneyin
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Help Text */}
      {!error && !value && (
        <p className="text-xs text-gray-600">
          {filteredBanks.length} Türk bankası arasından seçim yapabilirsiniz
        </p>
      )}
    </div>
  );
};

export default BankSelector;
