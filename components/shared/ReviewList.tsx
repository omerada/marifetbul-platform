/**
 * ================================================
 * REVIEW LIST COMPONENT
 * ================================================
 * Displays a paginated list of reviews
 * With filtering, sorting, and empty states
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Pagination } from '@/components/ui/Pagination';
import UnifiedSkeleton from '@/components/ui/UnifiedSkeleton';
import { ReviewCard } from './ReviewCard';
import { RatingDistribution, RatingBreakdown } from './RatingDistribution';
import { RatingSummary } from './RatingStars';
import type {
  Review,
  ReviewStats,
  VoteType,
  ReviewStatus,
} from '@/types/business/review';

interface ReviewListProps {
  reviews: Review[];
  stats?: ReviewStats | null;
  loading?: boolean;
  error?: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  _pageSize: number;
  totalElements: number;
  onPageChange: (page: number) => void;

  // Filtering & Sorting
  onFilterChange?: (filters: ReviewFilterOptions) => void;
  onSortChange?: (sortBy: string, sortDirection: 'ASC' | 'DESC') => void;

  // Review Actions
  onVote?: (reviewId: string, voteType: VoteType) => Promise<void>;
  onRemoveVote?: (reviewId: string) => Promise<void>;
  onFlag?: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;

  // Display Options
  showStats?: boolean;
  showFilters?: boolean;
  showPackageInfo?: boolean;
  showActions?: boolean;

  className?: string;
}

export interface ReviewFilterOptions {
  status?: ReviewStatus;
  minRating?: number;
  verifiedOnly?: boolean;
}

export function ReviewList({
  reviews,
  stats,
  loading = false,
  error = null,
  currentPage,
  totalPages,
  _pageSize,
  totalElements,
  onPageChange,
  onFilterChange,
  onSortChange,
  onVote,
  onRemoveVote,
  onFlag,
  onEdit,
  onDelete,
  onReply,
  showStats = true,
  showFilters = true,
  showPackageInfo = false,
  showActions = true,
  className,
}: ReviewListProps) {
  const [filters, setFilters] = useState<ReviewFilterOptions>({
    verifiedOnly: false,
  });
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ReviewFilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  // Handle sort changes
  const handleSortChange = (newSortBy: string) => {
    const newDirection =
      sortBy === newSortBy && sortDirection === 'DESC' ? 'ASC' : 'DESC';
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    onSortChange?.(newSortBy, newDirection);
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    const newDirection = sortDirection === 'ASC' ? 'DESC' : 'ASC';
    setSortDirection(newDirection);
    onSortChange?.(sortBy, newDirection);
  };

  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <UnifiedSkeleton.Skeleton
            key={i}
            variant="rounded"
            className="h-64 w-full"
          />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="text-red-600">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="mb-2 text-gray-600">Henüz değerlendirme bulunmuyor</p>
        <p className="text-sm text-gray-500">İlk değerlendirmeyi siz yapın!</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Section */}
      {showStats && stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Rating Summary */}
          <div className="md:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <RatingSummary
                averageRating={stats.averageRating}
                totalReviews={stats.totalReviews}
                size="lg"
                className="mb-6"
              />
              <RatingDistribution
                stats={stats}
                onFilterByRating={(rating) =>
                  handleFilterChange({ minRating: rating })
                }
              />
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <RatingBreakdown stats={stats} />
          </div>
        </div>
      )}

      {/* Filters & Sort Controls */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtrele
            </Button>

            <div className="flex items-center gap-3">
              {/* Sort By */}
              <div className="w-48">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <option value="CREATED_AT">Tarihe Göre</option>
                  <option value="RATING">Puana Göre</option>
                  <option value="HELPFUL_COUNT">Faydalılığa Göre</option>
                </Select>
              </div>

              {/* Sort Direction */}
              <Button variant="outline" size="sm" onClick={toggleSortDirection}>
                {sortDirection === 'DESC' ? (
                  <SortDesc className="h-4 w-4" />
                ) : (
                  <SortAsc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              {/* Min Rating Filter */}
              <div>
                <Label htmlFor="minRating">Minimum Puan</Label>
                <div className="mt-1 w-full">
                  <Select
                    value={filters.minRating?.toString() || ''}
                    onValueChange={(value) =>
                      handleFilterChange({
                        minRating: value ? Number(value) : undefined,
                      })
                    }
                  >
                    <option value="">Tümü</option>
                    <option value="5">5 Yıldız</option>
                    <option value="4">4+ Yıldız</option>
                    <option value="3">3+ Yıldız</option>
                    <option value="2">2+ Yıldız</option>
                    <option value="1">1+ Yıldız</option>
                  </Select>
                </div>
              </div>

              {/* Verified Only */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange({ verifiedOnly: e.target.checked })
                  }
                />
                <Label htmlFor="verifiedOnly" className="cursor-pointer">
                  Sadece Doğrulanmış Alımlar
                </Label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            onVote={onVote}
            onRemoveVote={onRemoveVote}
            onFlag={onFlag}
            onEdit={onEdit}
            onDelete={onDelete}
            onReply={onReply}
            showPackageInfo={showPackageInfo}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      {/* Results Info */}
      <div className="text-center text-sm text-gray-600">
        {reviews.length} / {totalElements} değerlendirme gösteriliyor
      </div>
    </div>
  );
}
