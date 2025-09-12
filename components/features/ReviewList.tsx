'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Filter, Star, Clock, Check } from 'lucide-react';
import { ReviewCard } from './ReviewCard';
import { ReviewReply } from './ReviewReply';
import { useReviews } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ReviewListProps {
  freelancerId?: string;
  employerId?: string;
  projectId?: string;
  showFilters?: boolean;
  showReplyButton?: boolean;
  className?: string;
}

type SortOption =
  | 'newest'
  | 'oldest'
  | 'rating-high'
  | 'rating-low'
  | 'helpful';
type FilterOption =
  | 'all'
  | '5-star'
  | '4-star'
  | '3-star'
  | '2-star'
  | '1-star'
  | 'verified';

const sortOptions = [
  { value: 'newest' as SortOption, label: 'En Yeni' },
  { value: 'oldest' as SortOption, label: 'En Eski' },
  { value: 'rating-high' as SortOption, label: 'En Yüksek Puan' },
  { value: 'rating-low' as SortOption, label: 'En Düşük Puan' },
  { value: 'helpful' as SortOption, label: 'En Faydalı' },
];

const filterOptions = [
  { value: 'all' as FilterOption, label: 'Tümü', count: 0 },
  { value: '5-star' as FilterOption, label: '5 Yıldız', count: 0 },
  { value: '4-star' as FilterOption, label: '4 Yıldız', count: 0 },
  { value: '3-star' as FilterOption, label: '3 Yıldız', count: 0 },
  { value: '2-star' as FilterOption, label: '2 Yıldız', count: 0 },
  { value: '1-star' as FilterOption, label: '1 Yıldız', count: 0 },
  { value: 'verified' as FilterOption, label: 'Doğrulanmış', count: 0 },
];

export function ReviewList({
  freelancerId,
  employerId,
  projectId,
  showFilters = true,
  showReplyButton = false,
  className,
}: ReviewListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { reviews, isLoading, error, reviewSummary } = useReviews(
    freelancerId || employerId || projectId
  );

  // Calculate filter counts
  const filtersWithCounts = useMemo(() => {
    return filterOptions.map((filter) => {
      let count = 0;

      if (filter.value === 'all') {
        count = reviews.length;
      } else if (filter.value === 'verified') {
        count = reviews.filter((r) => r.verifiedPurchase).length;
      } else {
        const rating = parseInt(filter.value.split('-')[0]);
        count = reviews.filter((r) => r.rating === rating).length;
      }

      return { ...filter, count };
    });
  }, [reviews]);

  // Sort and filter reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...reviews];

    // Apply filter
    if (filterBy !== 'all') {
      if (filterBy === 'verified') {
        filtered = filtered.filter((r) => r.verifiedPurchase);
      } else {
        const rating = parseInt(filterBy.split('-')[0]);
        filtered = filtered.filter((r) => r.rating === rating);
      }
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [reviews, sortBy, filterBy]);

  const handleReply = (reviewId: string) => {
    setReplyingTo(reviewId);
  };

  const handleReplySubmit = () => {
    setReplyingTo(null);
    // Reviews will be automatically refreshed by the store
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted h-32 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive mb-4">
          İncelemeler yüklenirken bir hata oluştu.
        </p>
        <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center">
        <Star className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">Henüz inceleme yok</h3>
        <p className="text-muted-foreground">İlk incelemeyi siz yazın!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Review Summary */}
      {reviewSummary && (
        <div className="bg-muted/30 mb-6 rounded-lg p-4">
          <div className="mb-3 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(reviewSummary.averageRating)
                        ? 'fill-current text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xl font-bold">
                {reviewSummary.averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({reviewSummary.totalReviews} inceleme)
              </span>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                reviewSummary.ratingDistribution[
                  rating as keyof typeof reviewSummary.ratingDistribution
                ] || 0;
              const percentage =
                reviewSummary.totalReviews > 0
                  ? (count / reviewSummary.totalReviews) * 100
                  : 0;

              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}</span>
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                  <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-12">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters and Sort */}
      {showFilters && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filtersWithCounts.map((filter) => (
              <Button
                key={filter.value}
                variant={filterBy === filter.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilterBy(filter.value)}
                className="gap-2"
              >
                {filter.label}
                <Badge variant="secondary" className="text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="bg-border hidden h-6 w-px sm:block"></div>

          {/* Sort Menu */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {sortOptions.find((opt) => opt.value === sortBy)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showSortMenu && (
              <div className="bg-background absolute top-full left-0 z-10 mt-1 min-w-[150px] rounded-md border shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    className="hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm"
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortMenu(false);
                    }}
                  >
                    {sortBy === option.value && (
                      <Check className="text-primary h-4 w-4" />
                    )}
                    <span
                      className={sortBy === option.value ? 'font-medium' : ''}
                    >
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-6">
        {filteredAndSortedReviews.map((review) => (
          <div key={review.id}>
            <ReviewCard
              review={review}
              showReplyButton={showReplyButton}
              onReply={handleReply}
            />

            {replyingTo === review.id && (
              <div className="mt-4 ml-6">
                <ReviewReply
                  reviewId={review.id}
                  onSubmit={handleReplySubmit}
                  onCancel={handleReplyCancel}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {filteredAndSortedReviews.length > 0 && (
        <div className="mt-8 text-center">
          <Button variant="outline" className="gap-2">
            <Clock className="h-4 w-4" />
            Daha Fazla Yükle
          </Button>
        </div>
      )}
    </div>
  );
}
