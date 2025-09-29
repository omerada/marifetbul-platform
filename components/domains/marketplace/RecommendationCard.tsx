'use client';

import React, { useState, useCallback } from 'react';
import { useRecommendations } from '@/hooks';
import {
  Recommendation,
  RecommendationFeedback,
  Freelancer,
  Job,
  ServicePackage,
} from '@/types';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  X,
  RefreshCw,
  Sparkles,
  TrendingUp,
  MapPin,
  DollarSign,
  User,
  Briefcase,
  Eye,
  Heart,
  Share2,
} from 'lucide-react';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFeedback?: (feedback: RecommendationFeedback) => void;
  onDismiss?: (item: Freelancer | Job | ServicePackage) => void;
  onView?: (item: Freelancer | Job | ServicePackage) => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onFeedback,
  onDismiss,
  onView,
  className = '',
}) => {
  const [feedbackGiven, setFeedbackGiven] = useState<
    'positive' | 'negative' | null
  >(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFeedback = useCallback(
    (type: 'positive' | 'negative') => {
      const feedback: RecommendationFeedback = {
        recommendationId: 'rec_' + Date.now(), // Generate temp ID
        userId: 'user_1', // Should come from auth context
        feedback: type === 'positive' ? 'like' : 'dislike',
        timestamp: new Date().toISOString(),
      };

      setFeedbackGiven(type);
      onFeedback?.(feedback);
    },
    [onFeedback]
  );

  const handleView = useCallback(() => {
    if (recommendation.item) {
      onView?.(recommendation.item as Job | Freelancer | ServicePackage);
    }
  }, [recommendation.item, onView]);

  const handleDismiss = useCallback(() => {
    if (recommendation.item) {
      onDismiss?.(recommendation.item as Job | Freelancer | ServicePackage);
    }
  }, [recommendation.item, onDismiss]);

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'skill_match':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'location_proximity':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'rating_similarity':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'price_range':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
  };

  // Type guard fonksiyonları
  const isFreelancer = (item: unknown): item is Freelancer => {
    return typeof item === 'object' && item !== null && 'firstName' in item;
  };

  const isJob = (item: unknown): item is Job => {
    return typeof item === 'object' && item !== null && 'employerId' in item;
  };

  const isServicePackage = (item: unknown): item is ServicePackage => {
    return typeof item === 'object' && item !== null && 'providerId' in item;
  };

  const getItemType = () => {
    if (!recommendation.item) return 'package';
    if (isFreelancer(recommendation.item)) return 'freelancer';
    if (isJob(recommendation.item)) return 'job';
    return 'package';
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'freelancer':
        return <User className="h-4 w-4" />;
      case 'job':
        return <Briefcase className="h-4 w-4" />;
      case 'service':
        return <Star className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getItemTitle = () => {
    if (!recommendation.item) return 'Bilinmiyor';

    if (isFreelancer(recommendation.item)) {
      return `${recommendation.item.firstName} ${recommendation.item.lastName}`;
    }

    if (isJob(recommendation.item)) {
      return recommendation.item.title;
    }

    if (isServicePackage(recommendation.item)) {
      return recommendation.item.title;
    }

    return 'Bilinmiyor';
  };

  const getReasonType = () => {
    if (!recommendation.reason) return 'general';
    if (typeof recommendation.reason === 'string') return 'general';
    return recommendation.reason.type || 'general';
  };

  const getReasonDescription = () => {
    if (!recommendation.reason) return '';
    if (typeof recommendation.reason === 'string') return recommendation.reason;
    return recommendation.reason.description || '';
  };

  const getItemDescription = () => {
    if (!recommendation.item) return '';

    if (isFreelancer(recommendation.item)) {
      return recommendation.item.bio || '';
    }

    if (isJob(recommendation.item)) {
      return recommendation.item.description || '';
    }

    if (isServicePackage(recommendation.item)) {
      return recommendation.item.description || '';
    }

    return '';
  };

  const formatBudget = (budget: unknown) => {
    if (budget && typeof budget === 'object') {
      const budgetObj = budget as {
        min?: number;
        max?: number;
        amount?: number;
        currency?: string;
      };
      if (budgetObj.min && budgetObj.max) {
        return `${budgetObj.min} - ${budgetObj.max} ${budgetObj.currency || 'TL'}`;
      } else if (budgetObj.amount) {
        return `${budgetObj.amount} ${budgetObj.currency || 'TL'}`;
      }
    }
    return 'Bütçe belirtilmemiş';
  };

  const itemType = getItemType();

  return (
    <Card
      className={`recommendation-card relative transition-all duration-200 hover:shadow-lg ${
        isHovered ? 'ring-primary/20 ring-2' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className="absolute top-2 right-2 z-10 h-6 w-6 p-0 opacity-60 hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </Button>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Recommendation Score Badge */}
          <div className="bg-primary/10 flex items-center gap-1 rounded-full px-2 py-1">
            {getReasonIcon(getReasonType())}
            <span className="text-primary text-xs font-medium">
              {Math.round(recommendation.score * 100)}% eşleşme
            </span>
          </div>

          {/* Item Type */}
          <Badge variant="outline" className="flex items-center gap-1">
            {getItemTypeIcon(itemType)}
            <span className="capitalize">{itemType}</span>
          </Badge>
        </div>

        <CardTitle className="text-lg">{getItemTitle()}</CardTitle>

        {/* Subtitle/Description */}
        {getItemDescription() && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {getItemDescription()}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Item Details */}
        <div className="mb-4 space-y-3">
          {/* Freelancer specific info */}
          {itemType === 'freelancer' && isFreelancer(recommendation.item) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  {(recommendation.item as Freelancer).rating || 'N/A'}
                </span>
                <span className="text-muted-foreground text-xs">
                  (değerlendirme)
                </span>
              </div>
              {(recommendation.item as Freelancer).hourlyRate && (
                <div className="flex items-center gap-1 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  {formatBudget((recommendation.item as Freelancer).hourlyRate)}
                </div>
              )}
            </div>
          )}

          {/* Job specific info */}
          {itemType === 'job' && isJob(recommendation.item) ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">İş İlanı</span>
              </div>
              {(recommendation.item as Job).budget && (
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">
                    {formatBudget((recommendation.item as Job).budget)}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          {/* Package specific info */}
          {itemType === 'package' && isServicePackage(recommendation.item) ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground h-4 w-4" />
                <span className="text-sm">Hizmet Paketi</span>
              </div>
              {(recommendation.item as ServicePackage).price && (
                <div className="flex items-center gap-1 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  {formatBudget((recommendation.item as ServicePackage).price)}
                </div>
              )}
            </div>
          ) : null}

          {/* Location */}
          {recommendation.item &&
          typeof recommendation.item === 'object' &&
          'location' in recommendation.item &&
          (recommendation.item as Record<string, unknown>).location ? (
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-4 w-4" />
              <span className="text-sm">
                {typeof (recommendation.item as Record<string, unknown>)
                  .location === 'string'
                  ? String(
                      (recommendation.item as Record<string, unknown>).location
                    )
                  : (
                      (recommendation.item as Record<string, unknown>)
                        .location as { city?: string }
                    )?.city || 'Konum belirtilmemiş'}
              </span>
            </div>
          ) : null}

          {/* Skills/Tags */}
          {recommendation.item &&
          typeof recommendation.item === 'object' &&
          'skills' in recommendation.item &&
          Array.isArray(
            (recommendation.item as Record<string, unknown>).skills
          ) &&
          ((recommendation.item as Record<string, unknown>).skills as unknown[])
            .length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {(
                (recommendation.item as Record<string, unknown>)
                  .skills as string[]
              )
                .slice(0, 3)
                .map((skill: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              {(
                (recommendation.item as Record<string, unknown>)
                  .skills as string[]
              ).length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +
                  {(
                    (recommendation.item as Record<string, unknown>)
                      .skills as string[]
                  ).length - 3}{' '}
                  daha
                </Badge>
              )}
            </div>
          ) : null}
        </div>

        {/* Recommendation Reason */}
        <div className="bg-muted/50 mb-4 rounded-lg p-3">
          <div className="text-muted-foreground mb-1 text-xs font-medium">
            Öneri Sebebi:
          </div>
          <div className="text-sm">{getReasonDescription()}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={handleView} className="flex-1" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Görüntüle
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="px-3"
            title="Favorilere ekle"
          >
            <Heart className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" className="px-3" title="Paylaş">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Feedback Section */}
        {feedbackGiven === null && (
          <div className="mt-4 border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                Bu öneri yararlı mı?
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('positive')}
                  className="h-8 w-8 p-0"
                  title="Yararlı"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('negative')}
                  className="h-8 w-8 p-0"
                  title="Yararlı değil"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Given */}
        {feedbackGiven && (
          <div className="mt-4 border-t pt-3">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {feedbackGiven === 'positive' ? (
                <>
                  <ThumbsUp className="h-3 w-3 text-green-500" />
                  <span>Geri bildiriminiz kaydedildi</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="h-3 w-3 text-red-500" />
                  <span>Geri bildiriminiz kaydedildi</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Recommendation List Component
interface RecommendationListProps {
  className?: string;
  limit?: number;
  category?: string;
  onRefresh?: () => void;
}

export const RecommendationList: React.FC<RecommendationListProps> = ({
  className = '',
  limit = 10,
  onRefresh,
}) => {
  const {
    recommendations,
    isLoading,
    error,
    refreshRecommendations,
    provideFeedback,
    dismissRecommendation,
  } = useRecommendations();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshRecommendations('jobs'); // Default to jobs
      onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }, [refreshRecommendations, onRefresh]);

  const handleFeedback = useCallback(
    (feedback: RecommendationFeedback) => {
      provideFeedback(feedback);
    },
    [provideFeedback]
  );

  const handleDismiss = useCallback(
    (item: Freelancer | Job | ServicePackage) => {
      // Find recommendation by item and dismiss it
      const rec = recommendations.find((r) => r.item === item);
      if (rec) {
        dismissRecommendation(); // Temp ID - should be proper rec ID
      }
    },
    [recommendations, dismissRecommendation]
  );

  const handleView = useCallback((item: Freelancer | Job | ServicePackage) => {
    // Navigate to item detail page
    console.log('Viewing item:', item);
  }, []);

  const displayedRecommendations = recommendations.slice(0, limit);

  if (isLoading && recommendations.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-muted h-6 w-16 rounded-full" />
                <div className="bg-muted h-6 w-20 rounded" />
              </div>
              <div className="bg-muted h-6 w-3/4 rounded" />
              <div className="bg-muted h-4 w-full rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="bg-muted h-4 w-1/2 rounded" />
                <div className="bg-muted h-4 w-1/3 rounded" />
                <div className="bg-muted h-8 w-full rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-2">
            Öneriler yüklenirken bir hata oluştu
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (displayedRecommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Sparkles className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
          <div className="text-muted-foreground mb-2">
            Henüz öneri bulunmuyor
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            Profilinizi tamamlayın ve arama geçmişinizi oluşturun
          </p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Önerileri Yenile
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Size Özel Öneriler</h3>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
          />
          Yenile
        </Button>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {displayedRecommendations.map((recommendation, index) => (
          <RecommendationCard
            key={index}
            recommendation={recommendation}
            onFeedback={handleFeedback}
            onDismiss={handleDismiss}
            onView={handleView}
          />
        ))}
      </div>

      {/* Load More */}
      {recommendations.length > limit && (
        <div className="text-center">
          <Button variant="outline" onClick={() => console.log('Load more')}>
            Daha Fazla Öneri Göster
          </Button>
        </div>
      )}
    </div>
  );
};
