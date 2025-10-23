/**
 * ================================================
 * PACKAGE REVIEWS TAB
 * ================================================
 * Reviews section for package detail page
 * Shows reviews, stats, and allows creating new reviews
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useEffect, useState } from 'react';
import { Star, TrendingUp } from 'lucide-react';
import { useReviewStore } from '@/hooks/business/useReviewStore';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { ReviewList } from '@/components/shared/ReviewList';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { RatingSummary } from '@/components/shared/RatingStars';
import { RatingDistribution } from '@/components/shared/RatingDistribution';
import { FlagReason, type ReviewType } from '@/types/business/review';

interface PackageReviewsTabProps {
  packageId: string;
  canReview?: boolean;
  onReviewCreated?: () => void;
  className?: string;
}

export function PackageReviewsTab({
  packageId,
  canReview = false,
  onReviewCreated,
  className,
}: PackageReviewsTabProps) {
  const {
    reviews,
    stats,
    pagination,
    loading,
    error,
    fetchPackageReviews,
    voteReview,
    removeVote,
    flagReview,
    clearError,
  } = useReviewStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [minRating, setMinRating] = useState<number | undefined>();

  // Load package reviews on mount
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageId, currentPage, sortBy, sortDirection, minRating]);

  const loadReviews = () => {
    fetchPackageReviews({
      packageId,
      page: currentPage - 1,
      pageSize: 10,
      sortBy: sortBy as 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT',
      sortDirection,
      minRating,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter by rating
  const handleFilterByRating = (rating: number) => {
    setMinRating(rating);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (
    newSortBy: string,
    newDirection: 'ASC' | 'DESC'
  ) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  // Handle review created
  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    clearError();
    loadReviews();
    onReviewCreated?.();
  };

  // Handle flag review
  const handleFlagReview = (reviewId: string) => {
    // Open flag dialog (could be enhanced with a modal)
    const reason = window.prompt('Şikayet sebebi nedir?');
    if (reason) {
      flagReview(reviewId, {
        reason: FlagReason.OTHER,
        description: reason,
      });
    }
  };

  return (
    <div className={className}>
      {/* Stats Header */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Overall Rating */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-yellow-50 p-3">
                  <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ortalama Puan</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
              </div>
              <RatingSummary
                averageRating={stats.averageRating}
                totalReviews={stats.totalReviews}
                size="md"
              />
            </div>

            {/* Rating Distribution */}
            <div>
              <RatingDistribution
                stats={stats}
                onFilterByRating={handleFilterByRating}
              />
            </div>
          </div>

          {/* Category Averages */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="mb-1 text-sm text-gray-600">İletişim</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {stats.communicationAvg.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Kalite</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {stats.qualityAvg.toFixed(1)}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-sm text-gray-600">Teslimat</p>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {stats.deliveryAvg.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Button */}
      {canReview && (
        <div className="mb-6">
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full gap-2 md:w-auto"
          >
            <TrendingUp className="h-4 w-4" />
            Değerlendirme Yaz
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <ReviewList
        reviews={reviews}
        stats={stats}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={pagination?.totalPages || 1}
        _pageSize={pagination?.pageSize || 10}
        totalElements={pagination?.totalElements || 0}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
        onFilterChange={(filters) => {
          setMinRating(filters.minRating);
          setCurrentPage(1);
        }}
        onVote={voteReview}
        onRemoveVote={removeVote}
        onFlag={handleFlagReview}
        showStats={false} // Already shown above
        showFilters
        showActions
      />

      {/* Write Review Dialog */}
      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Değerlendirme Yaz</DialogTitle>
          </DialogHeader>
          <ReviewForm
            packageId={packageId}
            type={'PACKAGE' as ReviewType}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
