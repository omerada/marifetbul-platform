/**
 * ================================================
 * REVIEW MODERATION FILTERS COMPONENT
 * ================================================
 * Filter controls for admin review moderation dashboard
 * Provides filters for status, flagged only, and sorting options
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 2.1: Admin Moderation Dashboard
 */

'use client';

import { Search, Filter, X } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ReviewStatus } from '@/types/business/review';

export interface ReviewModerationFiltersProps {
  status?: ReviewStatus;
  flaggedOnly: boolean;
  sortBy: 'CREATED_AT' | 'FLAGGED_COUNT';
  sortDirection: 'ASC' | 'DESC';
  searchQuery?: string;
  onStatusChange: (status?: ReviewStatus) => void;
  onFlaggedOnlyChange: (flaggedOnly: boolean) => void;
  onSortByChange: (sortBy: 'CREATED_AT' | 'FLAGGED_COUNT') => void;
  onSortDirectionChange: (direction: 'ASC' | 'DESC') => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export function ReviewModerationFilters({
  status,
  flaggedOnly,
  sortBy,
  sortDirection,
  searchQuery = '',
  onStatusChange,
  onFlaggedOnlyChange,
  onSortByChange,
  onSortDirectionChange,
  onSearchChange,
  onClearFilters,
}: ReviewModerationFiltersProps) {
  const activeFiltersCount =
    (status ? 1 : 0) + (flaggedOnly ? 1 : 0) + (searchQuery.length > 0 ? 1 : 0);

  const statusLabels: Record<ReviewStatus, string> = {
    [ReviewStatus.PENDING]: 'Beklemede',
    [ReviewStatus.APPROVED]: 'Onaylandı',
    [ReviewStatus.REJECTED]: 'Reddedildi',
    [ReviewStatus.FLAGGED]: 'Bayraklı',
  };

  const sortByLabels = {
    CREATED_AT: 'Oluşturma Tarihi',
    FLAGGED_COUNT: 'Bayrak Sayısı',
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="İnceleyici adı, paket adı veya yorum içeriğinde ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <Select
          value={status || 'ALL'}
          onValueChange={(value) =>
            onStatusChange(
              value === 'ALL' ? undefined : (value as ReviewStatus)
            )
          }
        >
          <SelectTrigger className="w-[180px]" placeholder="Durum" />
          <SelectContent>
            <SelectItem value="ALL">Tüm Durumlar</SelectItem>
            {Object.values(ReviewStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Flagged Only Toggle */}
        <Button
          variant={flaggedOnly ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFlaggedOnlyChange(!flaggedOnly)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Sadece Bayraklılar
        </Button>

        {/* Sort By */}
        <Select
          value={sortBy}
          onValueChange={(value) =>
            onSortByChange(value as 'CREATED_AT' | 'FLAGGED_COUNT')
          }
        >
          <SelectTrigger className="w-[180px]" placeholder="Sıralama" />
          <SelectContent>
            <SelectItem value="CREATED_AT">
              {sortByLabels.CREATED_AT}
            </SelectItem>
            <SelectItem value="FLAGGED_COUNT">
              {sortByLabels.FLAGGED_COUNT}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction */}
        <Select
          value={sortDirection}
          onValueChange={(value) =>
            onSortDirectionChange(value as 'ASC' | 'DESC')
          }
        >
          <SelectTrigger className="w-[140px]" placeholder="Yön" />
          <SelectContent>
            <SelectItem value="DESC">Azalan</SelectItem>
            <SelectItem value="ASC">Artan</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Filtreleri Temizle
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {status && (
            <Badge variant="secondary" className="gap-1">
              Durum: {statusLabels[status]}
              <button
                onClick={() => onStatusChange(undefined)}
                className="hover:text-foreground ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {flaggedOnly && (
            <Badge variant="secondary" className="gap-1">
              Sadece Bayraklılar
              <button
                onClick={() => onFlaggedOnlyChange(false)}
                className="hover:text-foreground ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Arama: &quot;{searchQuery}&quot;
              <button
                onClick={() => onSearchChange('')}
                className="hover:text-foreground ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
