/**
 * ================================================
 * REVIEW MODERATION LIST COMPONENT
 * ================================================
 * Display list of reviews for admin moderation
 * Shows review details, flag count, and moderation actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Story 2.1: Admin Moderation Dashboard
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Star,
  User,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Review, ReviewStatus } from '@/types/business/review';

export interface ReviewModerationListProps {
  reviews: Review[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectReview: (reviewId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onModerate: (reviewId: string, action: 'approve' | 'reject') => void;
  onViewDetails: (review: Review) => void;
}

export function ReviewModerationList({
  reviews,
  isLoading = false,
  selectedIds,
  onSelectReview,
  onSelectAll,
  onModerate,
  onViewDetails,
}: ReviewModerationListProps) {
  const allSelected =
    reviews.length > 0 && selectedIds.length === reviews.length;

  const statusConfig = {
    [ReviewStatus.PENDING]: {
      icon: Clock,
      label: 'Beklemede',
      color: 'text-yellow-600 bg-yellow-50',
      badgeVariant: 'secondary' as const,
    },
    [ReviewStatus.APPROVED]: {
      icon: CheckCircle,
      label: 'Onaylandı',
      color: 'text-green-600 bg-green-50',
      badgeVariant: 'secondary' as const,
    },
    [ReviewStatus.REJECTED]: {
      icon: XCircle,
      label: 'Reddedildi',
      color: 'text-red-600 bg-red-50',
      badgeVariant: 'destructive' as const,
    },
    [ReviewStatus.FLAGGED]: {
      icon: AlertTriangle,
      label: 'Bayraklı',
      color: 'text-orange-600 bg-orange-50',
      badgeVariant: 'destructive' as const,
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="bg-muted h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="bg-muted h-4 w-1/4 rounded" />
                  <div className="bg-muted h-4 w-3/4 rounded" />
                  <div className="bg-muted h-4 w-1/2 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Flag className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-lg font-medium">İncelenecek yorum bulunamadı</p>
          <p className="text-muted-foreground">
            Seçili filtrelere uygun yorum bulunmamaktadır
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Selection Header */}
      {reviews.length > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 p-4">
            <Checkbox
              checked={allSelected}
              onChange={(e) => onSelectAll(e.target.checked)}
              aria-label="Tümünü seç"
            />
            <span className="text-muted-foreground text-sm">
              {selectedIds.length > 0
                ? `${selectedIds.length} yorum seçildi`
                : `${reviews.length} yorum listeleniyor`}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Review List */}
      {reviews.map((review) => {
        const status = statusConfig[review.status];
        const StatusIcon = status.icon;
        const isSelected = selectedIds.includes(review.id);
        const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
          addSuffix: true,
          locale: tr,
        });

        return (
          <Card
            key={review.id}
            className={cn(
              'transition-all hover:shadow-md',
              isSelected && 'ring-primary ring-2'
            )}
          >
            <CardContent className="p-6">
              <div className="flex gap-4">
                {/* Selection Checkbox */}
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) =>
                      onSelectReview(review.id, e.target.checked)
                    }
                    aria-label={`${review.reviewerName} yorumunu seç`}
                  />
                </div>

                {/* Reviewer Avatar */}
                <Avatar className="h-12 w-12">
                  {review.reviewerAvatar && (
                    <AvatarImage
                      src={review.reviewerAvatar}
                      alt={review.reviewerName}
                    />
                  )}
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>

                {/* Review Content */}
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{review.reviewerName}</h4>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Doğrulanmış Alım
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                        <Package className="h-3 w-3" />
                        <span>{review.packageTitle || review.packageName}</span>
                        <span>•</span>
                        <span>{timeAgo}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={status.badgeVariant}
                      className={cn('gap-1', status.color)}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-4 w-4',
                            star <= review.overallRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {review.overallRating.toFixed(1)}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="line-clamp-3 text-sm leading-relaxed">
                    {review.reviewText}
                  </p>

                  {/* Flag Count Warning */}
                  {review.flaggedCount > 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-orange-50 p-2 text-orange-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {review.flaggedCount} şikayet bildirimi
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(review)}
                    >
                      Detayları Gör
                    </Button>

                    {review.status === ReviewStatus.PENDING ||
                    review.status === ReviewStatus.FLAGGED ? (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => onModerate(review.id, 'approve')}
                          className="gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Onayla
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onModerate(review.id, 'reject')}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reddet
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
