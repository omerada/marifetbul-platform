'use client';

/**
 * ================================================
 * REVIEW CARD COMPONENT
 * ================================================
 * Display component for a single review with all details
 * Supports voting, flagging, seller response, and image gallery
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Review System Sprint
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Flag, CheckCircle, MoreVertical, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { RatingStars } from './RatingStars';
import {
  SellerResponseForm,
  ReviewVoting,
  ReviewFlagModal,
} from '@/components/domains/reviews';
import type { Review } from '@/types/business/review';
import { VoteType } from '@/types/business/review';

interface ReviewCardProps {
  review: Review;
  onVote?: (reviewId: string, voteType: VoteType) => Promise<void>;
  onRemoveVote?: (reviewId: string) => Promise<void>;
  onFlag?: (reviewId: string) => void;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onReply?: (reviewId: string) => void;
  showPackageInfo?: boolean;
  showActions?: boolean;
  showVoting?: boolean;
  className?: string;
}

export function ReviewCard({
  review,
  onVote,
  onRemoveVote,
  onFlag,
  onEdit,
  onDelete,
  onReply,
  showPackageInfo = false,
  showActions = true,
  showVoting = true,
  className,
}: ReviewCardProps) {
  const [localReview, setLocalReview] = useState(review);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const { success } = useToast();

  const timeAgo = formatDistanceToNow(new Date(localReview.createdAt), {
    addSuffix: true,
    locale: tr,
  });

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-6',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={localReview.reviewerAvatar || '/images/default-avatar.png'}
              alt={localReview.reviewerName}
            />
            <AvatarFallback>
              {localReview.reviewerName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {localReview.reviewerName}
              </h4>
              {localReview.isVerifiedPurchase && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  Doğrulanmış Alım
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{timeAgo}</p>
          </div>
        </div>

        {/* Actions Dropdown */}
        {showActions && (onEdit || onDelete || onFlag) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && localReview.canEdit && (
                <DropdownMenuItem onClick={() => onEdit(localReview)}>
                  Düzenle
                </DropdownMenuItem>
              )}
              {onDelete && localReview.canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(localReview.id)}
                  className="text-red-600"
                >
                  Sil
                </DropdownMenuItem>
              )}
              {onFlag && (
                <DropdownMenuItem onClick={() => setShowFlagModal(true)}>
                  <Flag className="mr-2 h-4 w-4" />
                  Şikayet Et
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Package Info */}
      {showPackageInfo && localReview.packageTitle && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Paket:</span>{' '}
            {localReview.packageTitle}
          </p>
        </div>
      )}

      {/* Ratings */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-4">
          <RatingStars
            value={localReview.overallRating}
            readonly
            size="lg"
            showValue
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">İletişim:</span>
            <RatingStars
              value={localReview.communicationRating}
              readonly
              size="sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Kalite:</span>
            <RatingStars value={localReview.qualityRating} readonly size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Teslimat:</span>
            <RatingStars
              value={localReview.deliveryRating}
              readonly
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <p className="leading-relaxed text-gray-700">
          {localReview.reviewText}
        </p>
      </div>

      {/* Images */}
      {localReview.images && localReview.images.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {localReview.images.map((image) => (
            <div
              key={image.id}
              className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg"
            >
              <Image
                src={image.thumbnailUrl || image.imageUrl}
                alt={image.filename}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Seller Response */}
      {localReview.responseText && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="mb-2 flex items-start gap-2">
            <MessageSquare className="mt-0.5 h-4 w-4 text-blue-600" />
            <div className="flex-1">
              <p className="mb-1 text-sm font-semibold text-blue-900">
                Satıcı Yanıtı
              </p>
              <p className="text-sm text-gray-700">
                {localReview.responseText}
              </p>
              {localReview.respondedAt && (
                <p className="mt-2 text-xs text-gray-500">
                  {formatDistanceToNow(new Date(localReview.respondedAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reply Button (for sellers) */}
      {!localReview.responseText && onReply && localReview.canRespond && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReply(localReview.id)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Yanıtla
          </Button>
        </div>
      )}

      {/* Footer - Voting and Status */}
      {showVoting && onVote && onRemoveVote && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
          <ReviewVoting
            reviewId={localReview.id}
            helpfulCount={localReview.helpfulCount}
            notHelpfulCount={localReview.notHelpfulCount}
            userVote={localReview.userVote}
            onVote={onVote}
            onRemoveVote={onRemoveVote}
          />

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {localReview.status === 'PENDING' && (
              <Badge variant="secondary">Onay Bekliyor</Badge>
            )}
            {localReview.status === 'FLAGGED' && (
              <Badge variant="destructive">Şikayetli</Badge>
            )}
          </div>
        </div>
      )}

      {/* Seller Response */}
      {localReview.canRespond && (
        <div className="mt-4">
          <SellerResponseForm
            review={localReview}
            onSuccess={(updatedReview) => {
              setLocalReview(updatedReview);
            }}
          />
        </div>
      )}

      {/* Display Existing Seller Response (if user can't respond but response exists) */}
      {!localReview.canRespond &&
        localReview.sellerResponse &&
        localReview.sellerResponse.responseText && (
          <div className="mt-4">
            <SellerResponseForm review={localReview} />
          </div>
        )}

      {/* Flag Review Modal */}
      {onFlag && (
        <ReviewFlagModal
          open={showFlagModal}
          onOpenChange={setShowFlagModal}
          reviewId={localReview.id}
          reviewerName={localReview.reviewerName}
          onSuccess={() => {
            // Notify user about successful flag
            success(
              'Başarılı',
              'Yorumunuz bildirildi. İnceleme sürecimiz başlatıldı.'
            );
          }}
        />
      )}
    </div>
  );
}
