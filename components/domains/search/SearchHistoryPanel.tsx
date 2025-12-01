'use client';

/**
 * ================================================
 * SEARCH HISTORY PANEL COMPONENT
 * ================================================
 * Sprint DAY 3 - Task 10: Search Functionality Enhancement
 *
 * Search history management panel with:
 * - Recent searches list
 * - Most searched queries
 * - Clear history action
 * - Search suggestions from history
 * - Export/Import functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Enhanced
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  Clock,
  TrendingUp,
  X,
  Download,
  Upload,
  Trash2,
  Search,
} from 'lucide-react';
import {
  getSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
  getMostSearched,
  getSearchHistoryStats,
  exportSearchHistory,
  importSearchHistory,
  type SearchHistoryItem,
} from '@/lib/services/search-history.service';
import logger from '@/lib/infrastructure/monitoring/logger';

interface SearchHistoryPanelProps {
  onSearch?: (query: string) => void;
  showStats?: boolean;
  maxItems?: number;
  className?: string;
}

export function SearchHistoryPanel({
  onSearch,
  showStats = true,
  maxItems = 10,
  className = '',
}: SearchHistoryPanelProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [mostSearched, setMostSearched] = useState<SearchHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalSearches: 0,
    uniqueQueries: 0,
    lastSearchDate: null as number | null,
    topQuery: null as string | null,
  });

  // Load history on mount
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHistory = () => {
    const historyData = getSearchHistory();
    setHistory(historyData.slice(0, maxItems));
    setMostSearched(getMostSearched(5));
    setStats(getSearchHistoryStats());
  };

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
    logger.debug('Search from history', { query });
  };

  const handleRemove = (query: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeFromSearchHistory(query);
    loadHistory();
    logger.info('Search removed from history', { query });
  };

  const handleClearAll = () => {
    if (
      window.confirm('T�m arama ge�mi�ini silmek istedi�inizden emin misiniz?')
    ) {
      clearSearchHistory();
      loadHistory();
      logger.info('Search history cleared by user');
    }
  };

  const handleExport = () => {
    try {
      const json = exportSearchHistory();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marifetbul-search-history-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      logger.info('Search history exported');
    } catch (error) {
      logger.error(
        'Failed to export history', error instanceof Error ? error : new Error(String(error)));
      alert('D��a aktarma ba�ar�s�z oldu.');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importSearchHistory(content);
        if (success) {
          loadHistory();
          alert('Arama ge�mi�i ba�ar�yla i�e aktar�ld�.');
        } else {
          alert('��e aktarma ba�ar�s�z oldu. Dosya format�n� kontrol edin.');
        }
      } catch (error) {
        logger.error(
          'Import failed', error instanceof Error ? error : new Error(String(error)));
        alert('��e aktarma s�ras�nda hata olu�tu.');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const formatDate = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes === 0 ? 'Az �nce' : `${minutes} dakika �nce`;
    }

    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} saat �nce`;
    }

    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days} g�n �nce`;
    }

    // Format as date
    return new Date(timestamp).toLocaleDateString('tr-TR');
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Arama Ge�mi�i</h3>
          <div className="flex gap-2">
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={handleExport}
              disabled={history.length === 0}
              title="D��a Aktar"
            >
              <Download className="h-4 w-4" />
            </UnifiedButton>
            <label>
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="hidden"
              />
              <UnifiedButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  const input = document.querySelector(
                    'input[type="file"]'
                  ) as HTMLInputElement;
                  input?.click();
                }}
                title="��e Aktar"
              >
                <Upload className="h-4 w-4" />
              </UnifiedButton>
            </label>
            <UnifiedButton
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              disabled={history.length === 0}
              title="T�m�n� Sil"
            >
              <Trash2 className="h-4 w-4" />
            </UnifiedButton>
          </div>
        </div>

        {/* Stats */}
        {showStats && stats.totalSearches > 0 && (
          <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
            <div>
              <div className="text-muted-foreground text-sm">Toplam Arama</div>
              <div className="text-2xl font-bold">{stats.totalSearches}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">
                Benzersiz Sorgu
              </div>
              <div className="text-2xl font-bold">{stats.uniqueQueries}</div>
            </div>
            {stats.topQuery && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-sm">
                  En �ok Aranan
                </div>
                <div className="mt-1 font-medium">{stats.topQuery}</div>
              </div>
            )}
          </div>
        )}

        {/* Most Searched */}
        {mostSearched.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="text-primary h-4 w-4" />
              <h4 className="font-medium">En �ok Arananlar</h4>
            </div>
            <div className="space-y-2">
              {mostSearched.map((item, index) => (
                <button
                  key={`most-${index}`}
                  onClick={() => handleSearch(item.query)}
                  className="hover:bg-muted/50 group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Badge variant="secondary" className="shrink-0">
                      #{index + 1}
                    </Badge>
                    <span className="truncate">{item.query}</span>
                  </div>
                  {item.resultCount !== undefined && (
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {item.resultCount} sonu�
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Clock className="text-primary h-4 w-4" />
            <h4 className="font-medium">Son Aramalar</h4>
          </div>

          {history.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              <Search className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>Hen�z arama ge�mi�i yok</p>
              <p className="mt-1 text-sm">Aramalar�n�z burada g�r�necek</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={`recent-${index}`}
                  className="hover:bg-muted/50 group flex items-center justify-between rounded-lg p-3 transition-colors"
                >
                  <button
                    onClick={() => handleSearch(item.query)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <Search className="text-muted-foreground h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{item.query}</div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                        <span>{formatDate(item.timestamp)}</span>
                        {item.resultCount !== undefined && (
                          <>
                            <span>�</span>
                            <span>{item.resultCount} sonu�</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                  <UnifiedButton
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRemove(item.query, e)}
                    className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    title="Sil"
                  >
                    <X className="h-4 w-4" />
                  </UnifiedButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
