/**
 * ================================================
 * EMPLOYER REVIEWS DASHBOARD PAGE
 * ================================================
 * Employer dashboard page for viewing and managing written reviews
 * Shows user's own reviews with edit/delete functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint - Production Ready
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  MessageSquare,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useReviewStore } from '@/hooks/business/useReviewStore';
import { RatingSummary } from '@/components/shared/RatingStars';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { ReviewFormModal } from '@/components/domains/reviews';
import { UnifiedSkeleton } from '@/components/ui/UnifiedLoadingSystem';
import { Pagination } from '@/components/ui/Pagination';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Review } from '@/types/business/review';

export default function EmployerReviewsPage() {
  const {
    reviews,
    pagination,
    loading,
    error,
    fetchUserReviews,
    deleteReview,
    clearError,
  } = useReviewStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load user reviews
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const loadReviews = () => {
    fetchUserReviews({
      page: currentPage - 1,
      pageSize: 10,
      sortBy: 'CREATED_AT',
      sortDirection: 'DESC',
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle edit review
  const handleEdit = (review: Review) => {
    // Check if review is still editable (within 30 days)
    const createdAt = new Date(review.createdAt);
    const daysSinceCreation = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCreation > 30) {
      alert('Bu değerlendirme 30 günlük düzenleme süresini aştı.');
      return;
    }

    setEditingReview(review);
    setShowEditModal(true);
  };

  // Handle delete review
  const handleDelete = async (reviewId: string) => {
    if (deleteConfirm !== reviewId) {
      setDeleteConfirm(reviewId);
      setTimeout(() => setDeleteConfirm(null), 5000); // Reset after 5 seconds
      return;
    }

    try {
      await deleteReview(reviewId);
      setDeleteConfirm(null);
      loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  // Calculate stats from reviews
  const stats = {
    totalReviews: reviews.length,
    averageRating:
      reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.overallRating, 0) / reviews.length
        : 0,
    pendingCount: reviews.filter((r) => r.status === 'PENDING').length,
    approvedCount: reviews.filter((r) => r.status === 'APPROVED').length,
    rejectedCount: reviews.filter((r) => r.status === 'REJECTED').length,
    withResponseCount: reviews.filter((r) => r.sellerResponse).length,
  };

  // Check if review is editable
  const isEditable = (review: Review): boolean => {
    const createdAt = new Date(review.createdAt);
    const daysSinceCreation = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 30;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Verdiğim Değerlendirmeler
        </h1>
        <p className="mt-2 text-gray-600">
          Satıcılara yazdığınız değerlendirmeleri görüntüleyin ve yönetin
        </p>
      </div>

      {/* Stats Cards */}
      {reviews.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Total Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Değerlendirme
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <RatingSummary
                averageRating={stats.averageRating}
                totalReviews={stats.totalReviews}
                size="sm"
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Approved Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.approvedCount}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {stats.totalReviews > 0
                  ? Math.round((stats.approvedCount / stats.totalReviews) * 100)
                  : 0}
                % onay oranı
              </p>
            </CardContent>
          </Card>

          {/* Pending Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Beklemede</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pendingCount}
              </div>
              <p className="mt-1 text-xs text-gray-500">Moderasyon bekliyor</p>
            </CardContent>
          </Card>

          {/* Seller Responses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Satıcı Yanıtı
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.withResponseCount}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {stats.totalReviews > 0
                  ? Math.round(
                      (stats.withResponseCount / stats.totalReviews) * 100
                    )
                  : 0}
                % yanıt oranı
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info Alert */}
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Değerlendirmelerinizi oluşturulduktan sonraki <strong>30 gün</strong>{' '}
          içinde düzenleyebilir veya silebilirsiniz. Bu süre sonunda değişiklik
          yapılamaz.
        </AlertDescription>
      </Alert>

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
                <UnifiedSkeleton.Skeleton
                  variant="rounded"
                  className="h-4 w-1/3"
                />
                <UnifiedSkeleton.Skeleton
                  variant="rounded"
                  className="h-20 w-full"
                />
                <UnifiedSkeleton.Skeleton
                  variant="rounded"
                  className="h-10 w-1/4"
                />
              </div>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card className="p-12 text-center">
          <Star className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Henüz değerlendirme yapmadınız
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Siparişleriniz tamamlandığında satıcıları değerlendirebilirsiniz
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => {
            const editable = isEditable(review);
            const createdAt = new Date(review.createdAt);
            const timeAgo = formatDistanceToNow(createdAt, {
              addSuffix: true,
              locale: tr,
            });

            return (
              <Card key={review.id} className="overflow-hidden">
                <CardContent className="p-6">
                  {/* Review Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge
                          variant={
                            review.status === 'APPROVED'
                              ? 'default'
                              : review.status === 'PENDING'
                                ? 'outline'
                                : 'destructive'
                          }
                        >
                          {review.status === 'APPROVED'
                            ? 'Onaylandı'
                            : review.status === 'PENDING'
                              ? 'Beklemede'
                              : 'Reddedildi'}
                        </Badge>
                        {review.verifiedPurchase && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            ✓ Doğrulanmış Alım
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {review.packageName || review.serviceName}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
                    </div>

                    {/* Actions */}
                    {review.status === 'APPROVED' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(review)}
                          disabled={!editable}
                          title={
                            !editable
                              ? '30 günlük düzenleme süresi doldu'
                              : 'Düzenle'
                          }
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Düzenle
                        </Button>
                        <Button
                          variant={
                            deleteConfirm === review.id
                              ? 'destructive'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => handleDelete(review.id)}
                          disabled={!editable}
                          title={
                            !editable ? '30 günlük silme süresi doldu' : 'Sil'
                          }
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          {deleteConfirm === review.id
                            ? 'Emin misiniz?'
                            : 'Sil'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Review Card */}
                  <ReviewCard review={review} showActions={false} />

                  {/* Edit Time Remaining */}
                  {editable && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Düzenleme süresi:{' '}
                        {30 -
                          Math.floor(
                            (Date.now() - createdAt.getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                        gün kaldı
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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

      {/* Edit Review Modal */}
      {editingReview && (
        <ReviewFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingReview(null);
          }}
          orderId={editingReview.orderId}
          packageId={editingReview.packageId}
          existingReview={editingReview}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingReview(null);
            loadReviews();
          }}
        />
      )}
    </div>
  );
}
