'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  Star,
  Award,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useReputation } from '@/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ReputationScoreProps {
  userId?: string;
  showDetails?: boolean;
  className?: string;
}

export function ReputationScore({
  userId,
  showDetails = false,
  className,
}: ReputationScoreProps) {
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  const { reputationScore, isLoading, error, refresh } = useReputation(userId);

  const scoreMetrics = useMemo(() => {
    if (!reputationScore) return null;

    const score = reputationScore.overallScore;
    const maxScore = 100; // Overall score is 0-100
    const percentage = score;

    // Score level belirleme - ReputationScore.level kullan
    const level = reputationScore.level;
    let levelColor = 'gray';
    let badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive' =
      'outline';

    switch (level) {
      case 'diamond':
        levelColor = 'purple';
        badgeVariant = 'default';
        break;
      case 'platinum':
        levelColor = 'blue';
        badgeVariant = 'default';
        break;
      case 'gold':
        levelColor = 'yellow';
        badgeVariant = 'secondary';
        break;
      case 'silver':
        levelColor = 'gray';
        badgeVariant = 'secondary';
        break;
      case 'bronze':
        levelColor = 'orange';
        badgeVariant = 'outline';
        break;
    }

    return {
      score,
      maxScore,
      percentage,
      level: level.charAt(0).toUpperCase() + level.slice(1), // Capitalize
      levelColor,
      badgeVariant,
    };
  }, [reputationScore]);

  const trendDirection = useMemo(() => {
    if (
      !reputationScore ||
      !reputationScore.history ||
      !reputationScore.history.length
    )
      return null;

    // En son iki history kaydını karşılaştır
    const latest = reputationScore.history[0];
    if (!latest || latest.change === 0) return 'neutral';

    return latest.change > 0 ? 'up' : 'down';
  }, [reputationScore]);

  if (isLoading) {
    return (
      <Card className={`animate-pulse ${className}`}>
        <CardContent className="p-6">
          <div className="bg-muted h-20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (error || !reputationScore || !scoreMetrics) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center">
          <Shield className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
          <p className="text-muted-foreground mb-3 text-sm">
            Reputation verisi yüklenemedi
          </p>
          <Button size="sm" variant="outline" onClick={refresh}>
            Tekrar Dene
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { score, maxScore, percentage, level, badgeVariant } = scoreMetrics;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="text-primary h-5 w-5" />
            Reputation Skoru
          </CardTitle>

          {showDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="gap-1"
            >
              <Info className="h-4 w-4" />
              Detaylar
              <ChevronRight
                className={`h-4 w-4 transition-transform ${
                  showFullDetails ? 'rotate-90' : ''
                }`}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="space-y-3 text-center">
          <div className="relative">
            <div className="text-primary text-4xl font-bold">{score}</div>
            <div className="text-muted-foreground text-sm">/ {maxScore}</div>
          </div>

          {/* Progress Ring or Bar */}
          <div className="relative mx-auto h-24 w-24">
            <svg
              className="h-24 w-24 -rotate-90 transform"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted/30"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(percentage || 0) * 2.51} 251`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">
                {Math.round(percentage || 0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant={badgeVariant} className="font-medium">
              {level}
            </Badge>

            {trendDirection && trendDirection !== 'neutral' && (
              <div className="flex items-center gap-1">
                {trendDirection === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-xs ${
                    trendDirection === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {reputationScore.history && reputationScore.history.length > 0
                    ? Math.abs(reputationScore.history[0].change)
                    : 0}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 border-t pt-3">
          <div className="text-center">
            <div className="text-sm font-medium">
              {reputationScore.factors?.find((f) => f.name === 'reviews')
                ?.currentValue || 0}
            </div>
            <div className="text-muted-foreground text-xs">İnceleme</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm font-medium">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {(
                reputationScore.factors?.find((f) => f.name === 'rating')
                  ?.currentValue || 0
              ).toFixed(1)}
            </div>
            <div className="text-muted-foreground text-xs">Ort. Puan</div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium">
              {Math.round(
                (reputationScore.factors?.find((f) => f.name === 'completion')
                  ?.currentValue || 0) * 100
              )}
              %
            </div>
            <div className="text-muted-foreground text-xs">Tamamlama</div>
          </div>
        </div>

        {/* Badges Preview */}
        {reputationScore.badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Rozetler</h4>
            <div className="flex flex-wrap gap-1">
              {reputationScore.badges.slice(0, 3).map((badge) => {
                const badgeData =
                  typeof badge === 'string'
                    ? { id: badge, name: badge, description: badge }
                    : badge;
                return (
                  <Badge
                    key={badgeData.id}
                    variant="outline"
                    className="gap-1 text-xs"
                    title={badgeData.description}
                  >
                    <Award className="h-3 w-3" />
                    {badgeData.name}
                  </Badge>
                );
              })}

              {reputationScore.badges.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{reputationScore.badges.length - 3} daha
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        {showFullDetails && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">Skor Detayları</h4>

            <div className="space-y-3">
              {reputationScore.factors?.map((factor) => (
                <div
                  key={factor.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {factor.name === 'reviews' && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    {factor.name === 'completion' && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                    {factor.name === 'response_time' && (
                      <Clock className="h-4 w-4 text-blue-500" />
                    )}
                    {factor.name === 'rating' && (
                      <Users className="h-4 w-4 text-purple-500" />
                    )}

                    <span className="text-sm">{factor.description}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-16 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{
                          width: `${((factor.currentValue || 0) / (factor.maxValue || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-medium">
                      {(factor.currentValue || 0).toFixed(1)}/
                      {factor.maxValue || 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Improvement Suggestions */}
            {reputationScore.nextLevelRequirements &&
              reputationScore.nextLevelRequirements.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <h4 className="flex items-center gap-2 text-sm font-medium">
                    <Zap className="h-4 w-4 text-orange-500" />
                    Sonraki Seviye için Gereksinimler
                  </h4>
                  <div className="space-y-1">
                    {reputationScore.nextLevelRequirements
                      .slice(0, 3)
                      .map((requirement, index) => (
                        <div
                          key={index}
                          className="text-muted-foreground text-xs"
                        >
                          • {requirement.description} (
                          {requirement.currentProgress}/
                          {requirement.targetValue})
                        </div>
                      ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Action Button */}
        {!showFullDetails && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowFullDetails(true)}
          >
            Detaylı Analiz Gör
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
