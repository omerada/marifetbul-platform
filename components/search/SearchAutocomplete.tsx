'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Search,
  Clock,
  TrendingUp,
  MapPin,
  User,
  Briefcase,
  Package,
  X,
  Star,
} from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { SearchSuggestion } from '@/types/search';
import { cn } from '@/lib/utils';

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  showTrending?: boolean;
  showHistory?: boolean;
  autoFocus?: boolean;
}

export function SearchAutocomplete({
  onSearch,
  onSuggestionSelect,
  placeholder = 'İş, hizmet veya freelancer ara...',
  className,
  showTrending = true,
  showHistory = true,
  autoFocus = false,
}: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    suggestions,
    history,
    isLoading,
    setQuery,
    fetchSuggestions,
    performSearch,
    config,
  } = useSearchStore();

  useEffect(() => {
    if (inputValue && inputValue.length >= config.minQueryLength) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(inputValue);
      }, config.debounceMs);

      return () => clearTimeout(timeoutId);
    }
  }, [inputValue, fetchSuggestions, config.minQueryLength, config.debounceMs]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setQuery(value);
  };

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || inputValue;
    if (finalQuery.trim()) {
      setQuery(finalQuery);
      performSearch();
      onSearch?.(finalQuery);
      setOpen(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    setQuery(suggestion.text);
    onSuggestionSelect?.(suggestion);
    handleSearch(suggestion.text);
  };

  const handleHistorySelect = (historyQuery: string) => {
    setInputValue(historyQuery);
    handleSearch(historyQuery);
  };

  const getTypeIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'service':
        return <Package className="h-4 w-4" />;
      case 'user':
        return <User className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'skill':
        return <Star className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'job':
        return 'İş';
      case 'service':
        return 'Hizmet';
      case 'user':
        return 'Kullanıcı';
      case 'location':
        return 'Konum';
      case 'skill':
        return 'Yetenek';
      case 'category':
        return 'Kategori';
      default:
        return '';
    }
  };

  // Mock trending searches
  const trendingSearches = [
    'Web tasarım',
    'Logo tasarımı',
    'Mobil uygulama',
    'SEO optimizasyonu',
    'İçerik yazarlığı',
  ];

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className={cn(
            'border-input bg-background ring-offset-background w-full rounded-lg border px-10 py-3 text-sm',
            'placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:outline-none',
            'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          )}
          autoFocus={autoFocus}
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setInputValue('');
              setQuery('');
              inputRef.current?.focus();
            }}
            className="hover:bg-muted absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <Card className="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-b-2"></div>
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b">
                <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                  Öneriler
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`${suggestion.type}-${suggestion.text}-${index}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="hover:bg-muted flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suggestion.type)}
                      <span className="text-sm">{suggestion.text}</span>
                      {suggestion.category && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                      {suggestion.count > 0 && (
                        <span className="text-muted-foreground text-xs">
                          {suggestion.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {showHistory && history.length > 0 && !inputValue && (
              <div className="border-b">
                <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                  Son Aramalar
                </div>
                {history.slice(0, 5).map((historyItem) => (
                  <button
                    key={historyItem.id}
                    onClick={() => handleHistorySelect(historyItem.query)}
                    className="hover:bg-muted flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">{historyItem.query}</span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {historyItem.resultCount} sonuç
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {showTrending && !inputValue && (
              <div>
                <div className="text-muted-foreground px-3 py-2 text-xs font-medium">
                  Popüler Aramalar
                </div>
                {trendingSearches.map((trend) => (
                  <button
                    key={trend}
                    onClick={() => handleHistorySelect(trend)}
                    className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    <TrendingUp className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">{trend}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && suggestions.length === 0 && inputValue && (
              <div className="flex flex-col items-center gap-2 px-3 py-6">
                <Search className="text-muted-foreground h-8 w-8" />
                <p className="text-muted-foreground text-sm">
                  &quot;{inputValue}&quot; için öneri bulunamadı
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch()}
                  className="mt-2"
                >
                  Yine de ara
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Quick search component for mobile
export function QuickSearch({
  onSearch,
}: {
  onSearch?: (query: string) => void;
}) {
  const { setQuery, performSearch } = useSearchStore();

  const quickSearches = [
    'Web tasarım',
    'Logo',
    'Mobil app',
    'SEO',
    'Yazarlık',
    'Çeviri',
  ];

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    performSearch();
    onSearch?.(searchQuery);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {quickSearches.map((query) => (
        <Button
          key={query}
          variant="outline"
          size="sm"
          onClick={() => handleQuickSearch(query)}
          className="text-xs"
        >
          {query}
        </Button>
      ))}
    </div>
  );
}
