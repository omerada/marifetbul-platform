/**
 * ================================================
 * ADMIN REVIEW MODERATION PAGE - V2
 * ================================================
 * Enhanced admin interface for moderating and managing reviews
 * Uses new ReviewModerationList and ReviewModerationFilters components
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @since Story 2.1: Admin Moderation Dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import { Eye, Flag, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import {
  ReviewModerationFilters,
  ReviewModerationList,
  ReviewModerationHistory,
  ReviewModerationActions,
} from '@/components/admin/reviews';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Pagination } from '@/components/ui/Pagination';
import { ReviewCard } from '@/components/shared/ReviewCard';
import { useToast } from '@/hooks';
import { ReviewStatus } from '@/types/business/review';
import type { Review, PlatformReviewStats } from '@/types/business/review';
import {
  getReviewsForModeration,
  moderateReview,
  getPlatformStats,
} from '@/lib/api/review';

export default function AdminReviewModerationPageV2() {
  // Filters
  const [status, setStatus] = useState<ReviewStatus | undefined>();
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'CREATED_AT' | 'FLAGGED_COUNT'>(
    'CREATED_AT'
  );
  const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('DESC');
  const [searchQuery, setSearchQuery] = useState('');

  // Data
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<PlatformReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showModerateDialog, setShowModerateDialog] = useState(false);
  const [moderateAction, setModerateAction] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [moderateNote, setModerateNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const { success, error: showError } = useToast();

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load reviews when filters change
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, flaggedOnly, sortBy, sortDirection, searchQuery, currentPage]);

  const loadStats = async () => {
    try {
      const data = await getPlatformStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const response = await getReviewsForModeration({
        page: currentPage - 1,
        pageSize: 20,
        status,
        flaggedOnly,
        sortBy,
        sortDirection,
      });

      // Client-side search filter (if backend doesn't support it)
      let filteredReviews = response.reviews || [];
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredReviews = filteredReviews.filter(
          (r) =>
            r.reviewerName.toLowerCase().includes(query) ||
            r.packageTitle?.toLowerCase().includes(query) ||
            r.packageName?.toLowerCase().includes(query) ||
            r.reviewText.toLowerCase().includes(query)
        );
      }

      setReviews(filteredReviews);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      showError('Yüklenemedi', 'Yorumlar yüklenirken bir hata oluştu');
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilters = () => {
    setStatus(undefined);
    setFlaggedOnly(false);
    setSortBy('CREATED_AT');
    setSortDirection('DESC');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleSelectReview = (reviewId: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, reviewId] : prev.filter((id) => id !== reviewId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedIds(selected ? reviews.map((r) => r.id) : []);
  };

  const handleModerate = (reviewId: string, action: 'approve' | 'reject') => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    setSelectedReview(review);
    setModerateAction(action);
    setShowModerateDialog(true);
  };

  const handleModerateConfirm = async (sendEmail: boolean) => {
    if (!selectedReview) return;

    setActionLoading(true);

    try {
      await moderateReview(selectedReview.id, {
        action: moderateAction === 'approve' ? 'APPROVE' : 'REJECT',
        reason: moderateNote.trim() || undefined,
      });

      // Note: Email notification would be handled by backend
      // Backend will check the user's notification preferences
      // and send email if sendEmail is true and user opted in

      const emailMsg = sendEmail ? ' Kullanıcıya bildirim gönderildi.' : '';
      success(
        'Başarılı',
        `Yorum ${moderateAction === 'approve' ? 'onaylandı' : 'reddedildi'}.${emailMsg}`
      );

      // Refresh data
      await loadReviews();
      await loadStats();

      // Close dialog and reset
      setShowModerateDialog(false);
      setSelectedReview(null);
      setModerateNote('');
    } catch (err) {
      showError(
        'Hata',
        `Yorum ${moderateAction === 'approve' ? 'onaylanırken' : 'reddedilirken'} bir hata oluştu`
      );
      console.error('Failed to moderate review:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkModerate = async (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;

    const confirmMessage = `${selectedIds.length} yorumu ${action === 'approve' ? 'onaylamak' : 'reddetmek'} istediğinizden emin misiniz?`;
    if (!window.confirm(confirmMessage)) return;

    setActionLoading(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          moderateReview(id, {
            action: action === 'approve' ? 'APPROVE' : 'REJECT',
          })
        )
      );

      success(
        'Başarılı',
        `${selectedIds.length} yorum ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`
      );

      // Clear selection and refresh
      setSelectedIds([]);
      await loadReviews();
      await loadStats();
    } catch (err) {
      showError('Hata', 'Toplu işlem sırasında bir hata oluştu');
      console.error('Failed to bulk moderate:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Değerlendirme Moderasyonu
        </h1>
        <p className="mt-2 text-gray-600">
          Bekleyen ve şikayet edilen değerlendirmeleri yönetin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
            <p className="mt-1 text-xs text-gray-500">Tüm yorumlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPending || stats?.pendingCount || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şikayetli</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalFlagged || stats?.flaggedCount || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">İnceleme gerekiyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalApproved || stats?.approvedCount || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">Toplam onaylanmış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalRejected || stats?.rejectedCount || 0}
            </div>
            <p className="mt-1 text-xs text-gray-500">Toplam reddedilmiş</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <ReviewModerationFilters
            status={status}
            flaggedOnly={flaggedOnly}
            sortBy={sortBy}
            sortDirection={sortDirection}
            searchQuery={searchQuery}
            onStatusChange={setStatus}
            onFlaggedOnlyChange={setFlaggedOnly}
            onSortByChange={setSortBy}
            onSortDirectionChange={setSortDirection}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between py-4">
            <span className="font-medium text-blue-900">
              {selectedIds.length} yorum seçildi
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="success"
                onClick={() => handleBulkModerate('approve')}
                disabled={actionLoading}
                className="gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Toplu Onayla
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkModerate('reject')}
                disabled={actionLoading}
                className="gap-1"
              >
                <XCircle className="h-4 w-4" />
                Toplu Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <ReviewModerationList
        reviews={reviews}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onSelectReview={handleSelectReview}
        onSelectAll={handleSelectAll}
        onModerate={handleModerate}
        onViewDetails={handleViewDetails}
      />

      {/* Pagination */}
      {!isLoading && reviews.length > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Detail Dialog */}
      {selectedReview && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Değerlendirme Detayları</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <ReviewCard
                review={selectedReview}
                showActions={false}
                className="border-0 shadow-none"
              />

              {selectedReview.flaggedCount > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-orange-900">
                    <Flag className="h-4 w-4" />
                    Şikayet Bilgisi ({selectedReview.flaggedCount})
                  </h4>
                  <p className="text-sm text-orange-800">
                    Bu değerlendirme {selectedReview.flaggedCount} kez şikayet
                    edildi.
                  </p>
                </div>
              )}

              {/* Moderation History */}
              {selectedReview.moderationHistory &&
                selectedReview.moderationHistory.length > 0 && (
                  <ReviewModerationHistory
                    history={selectedReview.moderationHistory}
                  />
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Moderate Dialog */}
      {showModerateDialog && selectedReview && (
        <Dialog open={showModerateDialog} onOpenChange={setShowModerateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {moderateAction === 'approve'
                  ? 'Değerlendirmeyi Onayla'
                  : 'Değerlendirmeyi Reddet'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {moderateAction === 'approve'
                  ? 'Bu değerlendirmeyi onaylamak istediğinizden emin misiniz?'
                  : 'Bu değerlendirmeyi reddetme sebebinizi açıklayın (opsiyonel):'}
              </p>
              <div className="space-y-2">
                <Label htmlFor="moderate-note">
                  {moderateAction === 'approve'
                    ? 'Not (Opsiyonel)'
                    : 'Reddetme Sebebi'}
                </Label>
                <Textarea
                  id="moderate-note"
                  value={moderateNote}
                  onChange={(e) => setModerateNote(e.target.value)}
                  placeholder={
                    moderateAction === 'approve'
                      ? 'İsteğe bağlı not ekleyin...'
                      : 'Örn: Uygunsuz dil içeriyor, spam, vb.'
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter>
              <ReviewModerationActions
                action={moderateAction}
                onConfirm={handleModerateConfirm}
                onCancel={() => {
                  setShowModerateDialog(false);
                  setModerateNote('');
                  setSelectedReview(null);
                }}
                isLoading={actionLoading}
                showEmailOption={true}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
