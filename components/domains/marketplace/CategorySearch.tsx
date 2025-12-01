'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Clock,
  TrendingUp,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Input, Badge } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import { CategorySearchProps } from '@/types/business/features/marketplace-categories';

// Animation variants
const searchBarVariants = {
  focused: {
    scale: 1.02,
    boxShadow:
      '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    transition: { duration: 0.2 },
  },
  unfocused: {
    scale: 1,
    boxShadow:
      '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: { duration: 0.2 },
  },
};

const suggestionVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
};

const listVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -10,
  },
  visible: {
    opacity: 1,
    x: 0,
  },
};

// Popular searches data
const POPULAR_SEARCHES = [
  'Web sitesi',
  'Logo tasarımı',
  'Mobil uygulama',
  'SEO',
  'İngilizce dersi',
  'Ev temizliği',
  'Grafik tasarım',
  'WordPress',
];

const CategorySearch: React.FC<CategorySearchProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  suggestions = [],
  loading = false,
  placeholder = 'Kategori, hizmet veya beceri arayın...',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Calculate dropdown position
  useEffect(() => {
    const updatePosition = () => {
      if (showSuggestions && inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8, // Add scroll position back for portal
          left: rect.left + window.scrollX, // Add scroll position back for portal
          width: rect.width,
        });
      }
    };

    updatePosition();

    if (showSuggestions) {
      // Listen to both resize and scroll for portal positioning
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [showSuggestions, isFocused]);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('categorySearchHistory');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5));
        } catch (e) {
          logger.error('Error loading search history:', e as Error);
        }
      }
    }
  }, []);

  // Save search to history
  const saveSearchToHistory = (term: string) => {
    if (!term.trim()) return;

    const newHistory = [
      term,
      ...recentSearches.filter((s) => s !== term),
    ].slice(0, 5);
    setRecentSearches(newHistory);

    if (typeof window !== 'undefined') {
      localStorage.setItem('categorySearchHistory', JSON.stringify(newHistory));
    }
  };

  const handleSearch = (term: string) => {
    saveSearchToHistory(term);
    onSearch(term);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setShowSuggestions(value.length > 0 || isFocused);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch(searchTerm);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const clearSearch = () => {
    onSearchChange('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('categorySearchHistory');
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayedSuggestions = searchTerm.trim() ? suggestions : [];
  const showRecentSearches = !searchTerm.trim() && recentSearches.length > 0;
  const showPopularSearches = !searchTerm.trim() && recentSearches.length === 0;

  return (
    <div className="relative z-[100] mx-auto w-full max-w-2xl">
      {/* Search Input */}
      <motion.div
        variants={searchBarVariants}
        animate={isFocused ? 'focused' : 'unfocused'}
        className="relative"
      >
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="h-14 border-2 border-gray-200 pr-12 pl-12 text-lg transition-colors focus:border-blue-500"
          />
          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2">
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            )}
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="rounded-full p-1 transition-colors hover:bg-gray-100"
                aria-label="Aramayı temizle"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Suggestions Dropdown */}
      {typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showSuggestions && (isFocused || searchTerm) && (
              <motion.div
                ref={suggestionRef}
                variants={suggestionVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute z-[99999] max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  width: dropdownPosition.width,
                  minWidth: '300px',
                }}
              >
                <div className="p-4">
                  {/* Search Results */}
                  {displayedSuggestions.length > 0 && (
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-1"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">
                          Öneriler
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {displayedSuggestions.length} sonuç
                        </Badge>
                      </div>
                      {displayedSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          variants={itemVariants}
                          onClick={() => handleSearch(suggestion)}
                          className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <Search className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{suggestion}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Recent Searches */}
                  {showRecentSearches && (
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-1"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="h-4 w-4" />
                          Son Aramalar
                        </h4>
                        <button
                          onClick={clearHistory}
                          className="text-xs text-gray-500 transition-colors hover:text-gray-700"
                        >
                          Temizle
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <motion.button
                          key={index}
                          variants={itemVariants}
                          onClick={() => handleSearch(search)}
                          className="group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{search}</span>
                          <ArrowRight className="ml-auto h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {/* Popular Searches */}
                  {showPopularSearches && (
                    <motion.div
                      variants={listVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-3"
                    >
                      <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <TrendingUp className="h-4 w-4" />
                        Popüler Aramalar
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((search, index) => (
                          <motion.button
                            key={index}
                            variants={itemVariants}
                            onClick={() => handleSearch(search)}
                            className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                          >
                            {search}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* No Results */}
                  {searchTerm &&
                    displayedSuggestions.length === 0 &&
                    !loading && (
                      <div className="py-8 text-center">
                        <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h4 className="mb-2 text-sm font-medium text-gray-900">
                          Sonuç bulunamadı
                        </h4>
                        <p className="mb-4 text-sm text-gray-500">
                          &ldquo;{searchTerm}&rdquo; için eşleşen kategori
                          bulunamadı
                        </p>
                        <button
                          onClick={() => handleSearch(searchTerm)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Genel aramada dene →
                        </button>
                      </div>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default CategorySearch;
