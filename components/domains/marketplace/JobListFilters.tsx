'use client';

import { memo, useMemo } from 'react';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Search, Filter, X, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Proposal filter options
 */
export type ProposalFilterType =
  | 'all'
  | 'with-proposals'
  | 'new-proposals'
  | 'pending'
  | 'accepted';

/**
 * Job list filter state
 */
export interface JobListFilters {
  search?: string;
  proposalFilter?: ProposalFilterType;
  category?: string;
  status?: 'active' | 'closed' | 'all';
}

/**
 * Component props
 */
export interface JobListFiltersProps {
  /**
   * Current filter values
   */
  filters: JobListFilters;

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: JobListFilters) => void;

  /**
   * Show proposal filters (employer-only)
   * @default false
   */
  showProposalFilters?: boolean;

  /**
   * Proposal counts for filter badges
   */
  proposalCounts?: {
    total: number;
    new: number;
    pending: number;
    accepted: number;
  };

  /**
   * Total job count for display
   */
  totalJobs?: number;

  /**
   * Loading state
   */
  loading?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Proposal filter options with labels and icons
 */
const PROPOSAL_FILTERS = [
  {
    value: 'all' as const,
    label: 'Tüm İlanlar',
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    hoverColor: 'hover:bg-gray-100',
    activeColor: 'bg-gray-200',
  },
  {
    value: 'with-proposals' as const,
    label: 'Teklifli İlanlar',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-100',
    activeColor: 'bg-blue-200',
  },
  {
    value: 'new-proposals' as const,
    label: 'Yeni Teklifler',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    hoverColor: 'hover:bg-amber-100',
    activeColor: 'bg-amber-200',
  },
  {
    value: 'pending' as const,
    label: 'Bekleyen Teklifler',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    hoverColor: 'hover:bg-orange-100',
    activeColor: 'bg-orange-200',
  },
  {
    value: 'accepted' as const,
    label: 'Kabul Edilenler',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-100',
    activeColor: 'bg-green-200',
  },
] as const;

/**
 * JobListFilters Component
 *
 * Provides filtering and search for job lists with employer-specific proposal filters.
 * Shows active filter counts and allows easy filter management.
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<JobListFilters>({
 *   proposalFilter: 'all'
 * });
 *
 * <JobListFilters
 *   filters={filters}
 *   onFiltersChange={setFilters}
 *   showProposalFilters={true}
 *   proposalCounts={{ total: 10, new: 3, pending: 5, accepted: 2 }}
 *   totalJobs={25}
 * />
 * ```
 */
export const JobListFilters = memo<JobListFiltersProps>(
  ({
    filters,
    onFiltersChange,
    showProposalFilters = false,
    proposalCounts,
    totalJobs,
    loading = false,
    className,
  }) => {
    /**
     * Get count for a specific proposal filter
     */
    const getProposalCount = (
      filterType: ProposalFilterType
    ): number | undefined => {
      if (!proposalCounts) return undefined;

      switch (filterType) {
        case 'all':
          return totalJobs;
        case 'with-proposals':
          return proposalCounts.total > 0 ? proposalCounts.total : undefined;
        case 'new-proposals':
          return proposalCounts.new > 0 ? proposalCounts.new : undefined;
        case 'pending':
          return proposalCounts.pending > 0
            ? proposalCounts.pending
            : undefined;
        case 'accepted':
          return proposalCounts.accepted > 0
            ? proposalCounts.accepted
            : undefined;
        default:
          return undefined;
      }
    };

    /**
     * Count active filters
     */
    const activeFilterCount = useMemo(() => {
      let count = 0;
      if (filters.search) count++;
      if (filters.proposalFilter && filters.proposalFilter !== 'all') count++;
      if (filters.category) count++;
      if (filters.status && filters.status !== 'all') count++;
      return count;
    }, [filters]);

    /**
     * Handle search input change
     */
    const handleSearchChange = (value: string) => {
      onFiltersChange({
        ...filters,
        search: value || undefined,
      });
    };

    /**
     * Handle proposal filter change
     */
    const handleProposalFilterChange = (proposalFilter: ProposalFilterType) => {
      onFiltersChange({
        ...filters,
        proposalFilter: proposalFilter === 'all' ? undefined : proposalFilter,
      });
    };

    /**
     * Clear all filters
     */
    const handleClearFilters = () => {
      onFiltersChange({
        proposalFilter: 'all',
      });
    };

    return (
      <div className={cn('space-y-4', className)}>
        {/* Search and Clear */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="İş ilanı ara..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              disabled={loading}
              className={cn(
                'w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-10 text-sm',
                'focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none',
                'transition-colors duration-200',
                loading && 'cursor-not-allowed opacity-50'
              )}
            />
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={loading}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Filtreleri Temizle
              <Badge variant="default" className="ml-1 bg-blue-600 text-white">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Proposal Filters (Employer Only) */}
        {showProposalFilters && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Teklif Durumuna Göre Filtrele:
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PROPOSAL_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive =
                  (filters.proposalFilter || 'all') === filter.value;
                const count = getProposalCount(filter.value);

                return (
                  <button
                    key={filter.value}
                    onClick={() => handleProposalFilterChange(filter.value)}
                    disabled={loading}
                    className={cn(
                      'group flex items-center gap-2 rounded-lg px-4 py-2.5',
                      'border-2 transition-all duration-200',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      isActive
                        ? cn(
                            'border-current shadow-sm',
                            filter.color,
                            filter.activeColor
                          )
                        : cn(
                            'border-gray-200 bg-white hover:border-gray-300',
                            filter.hoverColor
                          )
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 transition-colors',
                        isActive ? filter.color : 'text-gray-500'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isActive ? filter.color : 'text-gray-700'
                      )}
                    >
                      {filter.label}
                    </span>
                    {count !== undefined && count > 0 && (
                      <Badge
                        variant={isActive ? 'default' : 'outline'}
                        className={cn(
                          'ml-1 text-xs',
                          isActive
                            ? 'bg-white text-gray-900'
                            : 'border-gray-300 bg-gray-100 text-gray-700'
                        )}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
            <span className="text-sm text-gray-600">Aktif Filtreler:</span>

            {filters.search && (
              <Badge variant="outline" className="gap-1">
                <Search className="h-3 w-3" />
                Arama: {filters.search}
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.proposalFilter && filters.proposalFilter !== 'all' && (
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {
                  PROPOSAL_FILTERS.find(
                    (f) => f.value === filters.proposalFilter
                  )?.label
                }
                <button
                  onClick={() => handleProposalFilterChange('all')}
                  className="ml-1 hover:text-red-600"
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
);

JobListFilters.displayName = 'JobListFilters';
