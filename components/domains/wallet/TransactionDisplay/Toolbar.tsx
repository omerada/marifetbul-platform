/**
 * ================================================
 * TRANSACTION TOOLBAR
 * ================================================
 * Toolbar with view controls and actions
 */

'use client';

import { Download, Filter, RefreshCw, Table, List, Grid } from 'lucide-react';
import Button from '@/components/ui/UnifiedButton';
import type { ViewMode } from './index';

export interface TransactionToolbarProps {
  viewMode: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  showFilters?: boolean;
  showExport?: boolean;
  showRefresh?: boolean;
  filtersOpen: boolean;
  onFiltersToggle: () => void;
  onExport?: (format: 'CSV' | 'EXCEL') => void;
  onRefresh?: () => void;
}

export function TransactionToolbar({
  viewMode,
  onViewModeChange,
  showFilters = true,
  showExport = true,
  showRefresh = true,
  filtersOpen,
  onFiltersToggle,
  onExport,
  onRefresh,
}: TransactionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {/* Left: View Mode Switcher */}
      {onViewModeChange && (
        <div className="flex gap-1 rounded-lg border p-1">
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('table')}
            title="Tablo Görünümü"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            title="Liste Görünümü"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'card' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('card')}
            title="Kart Görünümü"
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex gap-2">
        {showFilters && (
          <Button
            variant={filtersOpen ? 'primary' : 'outline'}
            size="sm"
            onClick={onFiltersToggle}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtreler
          </Button>
        )}

        {showExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExport('CSV')}
            title="Dışa Aktar"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}

        {showRefresh && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            title="Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
