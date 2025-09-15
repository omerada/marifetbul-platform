'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  MoreHorizontal,
  Clock,
  Users,
  DollarSign,
  Award,
} from 'lucide-react';
import type { ReviewData } from '@/types';
import { useReviews } from '@/hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ReviewCardProps {
  review: ReviewData;
  showReplyButton?: boolean;
  onReply?: (reviewId: string) => void;
}

const categoryIcons = {
  communication: MessageSquare,
  quality: Star,
  timing: Clock,
  professionalism: Users,
  value: DollarSign,
};

const categoryLabels = {
  communication: 'İletişim',
  quality: 'Kalite',
  timing: 'Zamanlama',
  professionalism: 'Profesyonellik',
  value: 'Değer',
};

export function ReviewCard({
  review,
  showReplyButton = false,
  onReply,
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false);
  const { markHelpful } = useReviews();

  const handleMarkHelpful = async () => {
    await markHelpful(review.id);
  };

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: tr,
    });
  };

  const truncateComment = (comment: string, maxLength: number = 200) => {
    if (comment.length <= maxLength) return comment;
    return comment.substring(0, maxLength) + '...';
  };

  const commentToShow = showFullComment
    ? review.comment
    : truncateComment(review.comment);

  const shouldShowReadMore = review.comment.length > 200;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={review.reviewer?.avatar || ''}
                alt={review.reviewer?.firstName || 'Reviewer'}
              />
              <AvatarFallback>
                {review.reviewer?.firstName?.[0] || 'R'}
                {review.reviewer?.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">
                  {review.reviewer?.firstName} {review.reviewer?.lastName}
                </h4>
                <Badge variant="secondary" className="text-xs">
                  {review.reviewer?.userType === 'employer'
                    ? 'İşveren'
                    : 'Freelancer'}
                </Badge>
                {review.verifiedPurchase && (
                  <Badge variant="outline" className="text-xs text-green-600">
                    <Award className="mr-1 h-3 w-3" />
                    Doğrulanmış
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'fill-current text-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-sm font-medium">
                    {review.rating}/5
                  </span>
                </div>

                <span className="text-muted-foreground text-xs">•</span>
                <time className="text-muted-foreground text-xs">
                  {formatDate(review.createdAt)}
                </time>
              </div>

              {review.projectTitle && (
                <p className="text-muted-foreground text-xs">
                  <strong>Proje:</strong> {review.projectTitle}
                  {review.projectCategory && ` • ${review.projectCategory}`}
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Category Ratings */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {review.categories &&
            typeof review.categories === 'object' &&
            Object.entries(review.categories).map(([category, rating]) => {
              const Icon =
                categoryIcons[category as keyof typeof categoryIcons];
              const label =
                categoryLabels[category as keyof typeof categoryLabels];

              if (!rating || rating === 0) return null;

              return (
                <div key={category} className="flex items-center gap-2">
                  <Icon className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground text-xs">{label}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${
                          star <= rating
                            ? 'fill-current text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs">{rating}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {commentToShow}
          </p>

          {shouldShowReadMore && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowFullComment(!showFullComment)}
            >
              {showFullComment ? 'Daha az göster' : 'Devamını oku'}
            </Button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t pt-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-2"
              onClick={handleMarkHelpful}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs">
                Faydalı ({review.helpfulCount || 0})
              </span>
            </Button>

            {showReplyButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2"
                onClick={() => onReply?.(review.id)}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Yanıtla</span>
              </Button>
            )}
          </div>

          {!review.isPublic && (
            <Badge variant="outline" className="text-xs">
              Özel
            </Badge>
          )}
        </div>

        {/* Reply */}
        {review.reply && (
          <div className="bg-muted/50 border-primary/20 ml-6 rounded-lg border-l-2 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={review.reply?.user?.avatar || ''}
                  alt={review.reply?.user?.firstName || 'User'}
                />
                <AvatarFallback className="text-xs">
                  {review.reply?.user?.firstName?.[0] || 'U'}
                  {review.reply?.user?.lastName?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">
                {review.reply?.user?.firstName} {review.reply?.user?.lastName}
              </span>
              <Badge variant="outline" className="text-xs">
                Yanıt
              </Badge>
              <time className="text-muted-foreground text-xs">
                {formatDate(review.reply.createdAt)}
              </time>
            </div>
            <p className="text-xs leading-relaxed">{review.reply.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
