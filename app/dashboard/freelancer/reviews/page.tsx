/**
 * ================================================
 * FREELANCER REVIEWS DASHBOARD PAGE
 * ================================================
 * Freelancer dashboard page for viewing and managing received reviews
 * Shows review stats, ratings, and allows seller responses
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Production Ready
 */

'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare, TrendingUp, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { useReviewStore } from '@/hooks/business/useReviewStore';
import { RatingSummary, RatingStars } from '@/components/shared/RatingStars';
import {
  RatingDistribution,
  RatingBreakdown,
} from '@/components/shared/RatingDistribution';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { SellerResponseModal } from '@/components/domains/reviews';
import UnifiedSkeleton from '@/components/ui/UnifiedLoadingSystem';
import { Pagination } from '@/components/ui/Pagination';
import type { Review } from '@/types/business/review';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

export default function FreelancerReviewsPage() {
  const {
    reviews,
    stats,
    pagination,
    loading,
    error,
    fetchSellerReviews,
    clearError,
  } = useReviewStore();

  const { getCurrentUserId } = useAuthStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('CREATED_AT');
  const [sortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [minRating, setMinRating] = useState<number | undefined>();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Load seller reviews
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortDirection, minRating, verifiedOnly]);

  const loadReviews = () => {
    const sellerId = getCurrentUserId();
    if (!sellerId) {
      console.error('User not authenticated');
      return;
    }
    fetchSellerReviews({
      sellerId,
      page: currentPage - 1,
      pageSize: 10,
      sortBy: sortBy as 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT',
      sortDirection,
      minRating,
      verifiedOnly,
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle respond to review
  const handleRespond = (review: Review) => {
    setSelectedReview(review);
    setShowResponseDialog(true);
  };

  // Calculate response rate
  const responseRate =
    stats && stats.totalReviews > 0
      ? Math.round(
          (reviews.filter((r) => r.sellerResponse).length /
            stats.totalReviews) *
            100
        )
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Aldığım Değerlendirmeler
        </h1>
        <p className="mt-2 text-gray-600">
          Müşterilerinizden aldığınız değerlendirmeleri görüntüleyin ve
          yanıtlayın
        </p>
      </div>

      {/* Stats Cards */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Average Rating */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Puan
              </CardTitle>
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageRating.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  / 5.0
                </span>
              </div>
              <RatingSummary
                averageRating={stats.averageRating}
                totalReviews={stats.totalReviews}
                size="sm"
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Değerlendirme
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="mt-1 text-xs text-gray-500">Tüm zamanlar</p>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Yanıt Oranı</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responseRate}%</div>
              <p className="mt-1 text-xs text-gray-500">
                {reviews.filter((r) => r.sellerResponse).length} yanıtlandı
              </p>
            </CardContent>
          </Card>

          {/* Communication Rating */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                İletişim Puanı
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.communicationAvg.toFixed(1)}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  / 5.0
                </span>
              </div>
              <RatingStars
                value={stats.communicationAvg}
                size="sm"
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution & Breakdown */}
      {stats && stats.totalReviews > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Puan Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingDistribution
                stats={stats}
                onFilterByRating={(rating) => {
                  setMinRating(rating);
                  setCurrentPage(1);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kategori Değerlendirmeleri</CardTitle>
            </CardHeader>
            <CardContent>
              <RatingBreakdown stats={stats} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtreler:</span>
            </div>

            <div className="min-w-[200px] flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger placeholder="Sıralama" />
                <SelectContent>
                  <SelectItem value="CREATED_AT">En Yeni</SelectItem>
                  <SelectItem value="RATING">En Yüksek Puan</SelectItem>
                  <SelectItem value="HELPFUL_COUNT">En Faydalı</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px] flex-1">
              <Select
                value={minRating?.toString() || 'all'}
                onValueChange={(value) => {
                  setMinRating(value === 'all' ? undefined : parseInt(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger placeholder="Minimum Puan" />
                <SelectContent>
                  <SelectItem value="all">Tüm Puanlar</SelectItem>
                  <SelectItem value="5">5 Yıldız</SelectItem>
                  <SelectItem value="4">4+ Yıldız</SelectItem>
                  <SelectItem value="3">3+ Yıldız</SelectItem>
                  <SelectItem value="2">2+ Yıldız</SelectItem>
                  <SelectItem value="1">1+ Yıldız</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant={verifiedOnly ? 'primary' : 'outline'}
              onClick={() => {
                setVerifiedOnly(!verifiedOnly);
                setCurrentPage(1);
              }}
            >
              {verifiedOnly ? 'Tüm Değerlendirmeler' : 'Sadece Doğrulanmış'}
            </Button>

            {(minRating || verifiedOnly) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setMinRating(undefined);
                  setVerifiedOnly(false);
                  setCurrentPage(1);
                }}
              >
                Filtreleri Temizle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Kapat
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <UnifiedSkeleton variant="skeleton" className="h-4 w-1/3" />
                <UnifiedSkeleton variant="skeleton" className="h-20 w-full" />
                <UnifiedSkeleton variant="skeleton" className="h-10 w-1/4" />
              </div>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Henüz değerlendirme almadınız
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Siparişleriniz tamamlandıkça müşterileriniz değerlendirme
            yapabilecek
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="relative">
              <ReviewCard review={review} showActions={false} />
              {!review.sellerResponse && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleRespond(review)}
                  >
                    Yanıtla
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading &&
        reviews.length > 0 &&
        pagination &&
        pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      {/* Seller Response Modal */}
      {selectedReview && (
        <SellerResponseModal
          open={showResponseDialog}
          onOpenChange={setShowResponseDialog}
          review={selectedReview}
          onSuccess={(_updatedReview) => {
            // Trigger a re-fetch to update the list
            loadReviews();
          }}
        />
      )}
    </div>
  );
}
