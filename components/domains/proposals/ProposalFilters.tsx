/**
 * ================================================
 * PROPOSAL FILTERS COMPONENT
 * ================================================
 * Filter and sort controls for job proposals
 *
 * Features:
 * - Status filtering (all, pending, accepted, rejected, withdrawn)
 * - Sort options (newest, oldest, price, delivery time)
 * - Proposal comparison mode
 * - Selection management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created 2025-11-09 - Sprint: Dashboard Route Consolidation
 */

'use client';

import { Card, Button } from '@/components/ui';
import { Filter, Star } from 'lucide-react';
import type { ProposalStatsData } from './ProposalStatistics';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'amount_low'
  | 'amount_high'
  | 'delivery';

export type FilterStatus =
  | 'all'
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

interface ProposalFiltersProps {
  filterStatus: FilterStatus;
  setFilterStatus: (status: FilterStatus) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  stats: ProposalStatsData;
  selectedProposals?: string[];
  onCompare?: () => void;
  onClearSelection?: () => void;
  className?: string;
}

export function ProposalFilters({
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  stats,
  selectedProposals = [],
  onCompare,
  onClearSelection,
  className = '',
}: ProposalFiltersProps) {
  const hasSelection = selectedProposals.length > 0;
  const canCompare =
    selectedProposals.length >= 2 && selectedProposals.length <= 3;

  return (
    <Card className={`sticky top-4 p-4 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filtreler</h3>
      </div>

      {/* Status Filter */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Durum
        </label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="all">Tümü ({stats.total})</option>
          <option value="PENDING">Bekleyen ({stats.pending})</option>
          <option value="ACCEPTED">Kabul Edilen ({stats.accepted})</option>
          <option value="REJECTED">Reddedilen ({stats.rejected})</option>
          <option value="WITHDRAWN">Geri Çekilen</option>
        </select>
      </div>

      {/* Sort Options */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Sıralama
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="newest">En Yeni</option>
          <option value="oldest">En Eski</option>
          <option value="amount_low">En Düşük Fiyat</option>
          <option value="amount_high">En Yüksek Fiyat</option>
          <option value="delivery">En Kısa Süre</option>
        </select>
      </div>

      {/* Comparison Mode */}
      {hasSelection && onCompare && onClearSelection && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="mb-2 text-sm font-medium text-blue-900">
            {selectedProposals.length} teklif seçildi
          </p>
          <Button
            size="sm"
            className="w-full"
            onClick={onCompare}
            disabled={!canCompare}
          >
            <Star className="mr-2 h-4 w-4" />
            Karşılaştır
          </Button>
          {!canCompare && (
            <p className="mt-2 text-xs text-blue-700">
              2-3 arası teklif seçmelisiniz
            </p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full"
            onClick={onClearSelection}
          >
            Seçimi Temizle
          </Button>
        </div>
      )}
    </Card>
  );
}
