/**
 * ================================================
 * USER DASHBOARD - REVIEWS PAGE
 * ================================================
 * User's review management page
 * View, edit, delete their reviews
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useEffect, useState } from 'react';
import { useReviewStore } from '@/hooks/business/useReviewStore';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Alert } from '@/components/ui/Alert';
import { ReviewList } from '@/components/shared/ReviewList';
import { ReviewForm } from '@/components/shared/ReviewForm';
import type { Review, ReviewType } from '@/types/business/review';

export default function DashboardReviewsPage() {
  const {
    reviews,
    stats,
    pagination,
    loading,
    error,
    fetchReviews,
    deleteReview,
    voteReview,
    removeVote,
    clearError,
  } = useReviewStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load reviews on mount
  useEffect(() => {
    fetchReviews({ page: currentPage - 1, pageSize: 10 });
  }, [currentPage, fetchReviews]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle edit review
  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowEditDialog(true);
  };

  // Handle update success
  const handleUpdateSuccess = () => {
    setShowEditDialog(false);
    setEditingReview(null);
    clearError();
    fetchReviews({ page: currentPage - 1, pageSize: 10 });
  };

  // Handle delete review
  const handleDelete = async (reviewId: string) => {
    if (!deleteConfirmId) {
      setDeleteConfirmId(reviewId);
      return;
    }

    if (deleteConfirmId === reviewId) {
      try {
        await deleteReview(reviewId);
        setDeleteConfirmId(null);
        fetchReviews({ page: currentPage - 1, pageSize: 10 });
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Değerlendirmelerim
        </h1>
        <p className="text-gray-600">
          Verdiğiniz değerlendirmeleri görüntüleyin ve yönetin
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="mt-2"
          >
            Kapat
          </Button>
        </Alert>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <Alert variant="destructive" className="mb-6">
          <p className="mb-2 font-semibold">
            Değerlendirmeyi silmek istediğinizden emin misiniz?
          </p>
          <p className="mb-4 text-sm">Bu işlem geri alınamaz.</p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(deleteConfirmId)}
            >
              Evet, Sil
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelDelete}>
              İptal
            </Button>
          </div>
        </Alert>
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
        onVote={voteReview}
        onRemoveVote={removeVote}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showPackageInfo
        showActions
        showStats
        showFilters
      />

      {/* Edit Review Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Değerlendirmeyi Düzenle</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <ReviewForm
              review={editingReview}
              type={editingReview.type as ReviewType}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
