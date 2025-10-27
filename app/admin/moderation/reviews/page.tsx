/**
 * ================================================
 * ADMIN REVIEW MODERATION PAGE
 * ================================================
 * Admin interface for moderating and managing reviews
 * Handles flagged reviews, pending approvals, and moderation actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useEffect, useState } from 'react';
import { Flag, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { useAdminReviews } from '@/hooks/business/useAdminReviews';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ReviewCard } from '@/components/shared/ReviewCard';
import UnifiedSkeleton from '@/components/ui/UnifiedLoadingSystem';
import { Pagination } from '@/components/ui/Pagination';
import { ReviewStatus } from '@/types/business/review';
import type { Review } from '@/types/business/review';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';

export default function AdminReviewModerationPage() {
  const {
    reviews,
    stats,
    pagination,
    isLoading,
    error,
    fetchPendingReviews,
    fetchFlaggedReviews,
    fetchStats,
    approveReview,
    rejectReview,
    deleteReview,
    clearError,
  } = useAdminReviews({
    onSuccess: () => {
      loadReviews();
    },
  });

  const [currentTab, setCurrentTab] = useState<'pending' | 'flagged'>(
    'pending'
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Load reviews on mount and tab/page change
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, currentPage]);

  const loadReviews = () => {
    if (currentTab === 'pending') {
      fetchPendingReviews(currentPage, 10);
    } else {
      fetchFlaggedReviews(currentPage, 10);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // Backend uses 0-indexed pages
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    const newTab = value as 'pending' | 'flagged';
    setCurrentTab(newTab);
    setCurrentPage(0);
  };

  // Handle view details
  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailDialog(true);
  };

  // Handle approve review
  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      await approveReview(reviewId);
    } catch {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  // Handle reject review with dialog
  const handleRejectClick = (review: Review) => {
    setSelectedReview(review);
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReview || !rejectReason.trim()) return;

    setActionLoading(selectedReview.id);
    try {
      await rejectReview(selectedReview.id, rejectReason.trim());
      setShowRejectDialog(false);
      setRejectReason('');
      setSelectedReview(null);
    } catch {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete review
  const handleDelete = async (reviewId: string) => {
    if (
      !window.confirm(
        'Bu değerlendirmeyi kalıcı olarak silmek istediğinizden emin misiniz?'
      )
    ) {
      return;
    }

    setActionLoading(reviewId);
    try {
      await deleteReview(reviewId);
    } catch {
      // Error handled in hook
    } finally {
      setActionLoading(null);
    }
  };

  // Get stats
  const pendingCount = stats?.pendingReviews || 0;
  const flaggedCount = stats?.flaggedReviews || 0;
  const approvedCount = stats?.approvedReviews || 0;
  const rejectedCount = stats?.rejectedReviews || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Değerlendirme Moderasyonu
        </h1>
        <p className="mt-2 text-gray-600">
          Bekleyen ve şikayet edilen değerlendirmeleri yönetin
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="mt-1 text-xs text-gray-500">Onay bekliyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Şikayetli</CardTitle>
            <Flag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedCount}</div>
            <p className="mt-1 text-xs text-gray-500">İnceleme gerekiyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onaylanan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCount}</div>
            <p className="mt-1 text-xs text-gray-500">Toplam onaylanmış</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reddedilen</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="mt-1 text-xs text-gray-500">Toplam reddedilmiş</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="pending"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            Bekleyen ({pendingCount})
          </TabsTrigger>
          <TabsTrigger
            value="flagged"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
          >
            Şikayetli ({flaggedCount})
          </TabsTrigger>
        </TabsList>

        {/* Pending Reviews Tab */}
        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <UnifiedSkeleton variant="skeleton" className="h-4 w-1/3" />
                    <UnifiedSkeleton
                      variant="skeleton"
                      className="h-20 w-full"
                    />
                    <div className="flex gap-2">
                      <UnifiedSkeleton
                        variant="skeleton"
                        className="h-10 w-24"
                      />
                      <UnifiedSkeleton
                        variant="skeleton"
                        className="h-10 w-24"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <Eye className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Bekleyen değerlendirme yok
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Tüm değerlendirmeler onaylandı veya reddedildi
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <Badge
                        variant={
                          review.status === ReviewStatus.PENDING
                            ? 'outline'
                            : review.status === ReviewStatus.APPROVED
                              ? 'default'
                              : 'destructive'
                        }
                      >
                        {review.status === ReviewStatus.PENDING && 'Bekliyor'}
                        {review.status === ReviewStatus.APPROVED && 'Onaylandı'}
                        {review.status === ReviewStatus.REJECTED &&
                          'Reddedildi'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(review)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </Button>
                  </div>

                  <ReviewCard
                    review={review}
                    showActions={false}
                    className="border-0 p-0 shadow-none"
                  />

                  {review.status === ReviewStatus.PENDING && (
                    <div className="mt-4 flex gap-3 border-t pt-4">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(review)}
                        disabled={actionLoading === review.id}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reddet
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(review.id)}
                        disabled={actionLoading === review.id}
                        className="gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Sil
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Flagged Reviews Tab */}
        <TabsContent value="flagged" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="space-y-3">
                    <UnifiedSkeleton variant="skeleton" className="h-4 w-1/3" />
                    <UnifiedSkeleton
                      variant="skeleton"
                      className="h-20 w-full"
                    />
                    <div className="flex gap-2">
                      <UnifiedSkeleton
                        variant="skeleton"
                        className="h-10 w-24"
                      />
                      <UnifiedSkeleton
                        variant="skeleton"
                        className="h-10 w-24"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <Flag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Şikayetli değerlendirme yok
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Şu anda şikayet edilen değerlendirme bulunmuyor
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        <Flag className="mr-1 h-3 w-3" />
                        {review.flaggedCount || 0} Şikayet
                      </Badge>
                      <Badge
                        variant={
                          review.status === ReviewStatus.APPROVED
                            ? 'default'
                            : 'outline'
                        }
                      >
                        {review.status === ReviewStatus.PENDING && 'Bekliyor'}
                        {review.status === ReviewStatus.APPROVED && 'Onaylandı'}
                        {review.status === ReviewStatus.REJECTED &&
                          'Reddedildi'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(review)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detaylar
                    </Button>
                  </div>

                  <ReviewCard
                    review={review}
                    showActions={false}
                    className="border-0 p-0 shadow-none"
                  />

                  <div className="mt-4 flex gap-3 border-t pt-4">
                    {review.status === ReviewStatus.APPROVED && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectClick(review)}
                        disabled={actionLoading === review.id}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reddet
                      </Button>
                    )}
                    {review.status === ReviewStatus.REJECTED && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={actionLoading === review.id}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Onayla
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(review.id)}
                      disabled={actionLoading === review.id}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Sil
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {!isLoading &&
        reviews.length > 0 &&
        pagination &&
        pagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={pagination.currentPage + 1}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      {/* Review Detail Dialog */}
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

              {/* Moderation Info */}
              {selectedReview.moderatorNote && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-900">
                    Moderatör Notu
                  </h4>
                  <p className="text-sm text-gray-700">
                    {selectedReview.moderatorNote}
                  </p>
                </div>
              )}

              {/* Flag Info */}
              {selectedReview.flaggedCount &&
                selectedReview.flaggedCount > 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <h4 className="mb-2 font-medium text-red-900">
                      Şikayet Bilgisi ({selectedReview.flaggedCount})
                    </h4>
                    <p className="text-sm text-red-800">
                      Bu değerlendirme {selectedReview.flaggedCount} kez şikayet
                      edildi.
                    </p>
                  </div>
                )}

              {/* Actions */}
              <div className="flex gap-3 border-t pt-4">
                {selectedReview.status === ReviewStatus.PENDING && (
                  <>
                    <Button
                      onClick={() => {
                        handleApprove(selectedReview.id);
                        setShowDetailDialog(false);
                      }}
                      disabled={actionLoading === selectedReview.id}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Onayla
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleRejectClick(selectedReview);
                        setShowDetailDialog(false);
                      }}
                      disabled={actionLoading === selectedReview.id}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reddet
                    </Button>
                  </>
                )}
                {selectedReview.status === ReviewStatus.APPROVED && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRejectClick(selectedReview);
                      setShowDetailDialog(false);
                    }}
                    disabled={actionLoading === selectedReview.id}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reddet
                  </Button>
                )}
                {selectedReview.status === ReviewStatus.REJECTED && (
                  <Button
                    onClick={() => {
                      handleApprove(selectedReview.id);
                      setShowDetailDialog(false);
                    }}
                    disabled={actionLoading === selectedReview.id}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Onayla
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => {
                    handleDelete(selectedReview.id);
                    setShowDetailDialog(false);
                  }}
                  disabled={actionLoading === selectedReview.id}
                  className="gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Reason Dialog */}
      {showRejectDialog && selectedReview && (
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Değerlendirmeyi Reddet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Bu değerlendirmeyi reddetme sebebinizi açıklayın:
              </p>
              <div className="space-y-2">
                <Label htmlFor="reject-reason">Reddetme Sebebi *</Label>
                <Textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Örn: Uygunsuz dil içeriyor, spam, vb."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                  setSelectedReview(null);
                }}
              >
                İptal
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={
                  !rejectReason.trim() || actionLoading === selectedReview.id
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Reddet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
