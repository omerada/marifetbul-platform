'use client';

/**
 * ================================================
 * COMMENT SEARCH BAR COMPONENT
 * ================================================
 * Search bar for filtering comments by content, author, or post
 * Includes debounce functionality for performance
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface CommentSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isSearching?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentSearchBar({
  value,
  onChange,
  placeholder = 'Yorum, yazar veya gönderi ara...',
  debounceMs = 300,
  isSearching = false,
}: CommentSearchBarProps) {
  // ================================================
  // STATE
  // ================================================

  const [localValue, setLocalValue] = useState(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // ================================================
  // EFFECTS
  // ================================================

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced onChange
  useEffect(() => {
    if (localValue === value) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      onChange(localValue);
      setIsDebouncing(false);
    }, debounceMs);

    return () => {
      clearTimeout(timer);
    };
  }, [localValue, value, onChange, debounceMs]);

  // ================================================
  // HANDLERS
  // ================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // ================================================
  // COMPUTED
  // ================================================

  const showClearButton = localValue.length > 0;
  const showLoadingSpinner = isSearching || isDebouncing;

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-10 text-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        aria-label="Yorum ara"
      />

      {/* Clear Button / Loading Spinner */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
        {showLoadingSpinner ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : showClearButton ? (
          <button
            onClick={handleClear}
            className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Aramayı temizle"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* Search Info */}
      {localValue.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {isDebouncing ? (
            <span>Aranıyor...</span>
          ) : (
            <span>
              <kbd className="rounded bg-gray-100 px-1 py-0.5">Esc</kbd> ile
              temizle
            </span>
          )}
        </div>
      )}
    </div>
  );
}
