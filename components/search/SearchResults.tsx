'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import {
  MapPin,
  Clock,
  Star,
  Eye,
  MessageCircle,
  Heart,
  Share2,
  ExternalLink,
  DollarSign,
  User,
  Calendar,
  Award,
  Zap,
  Shield,
  TrendingUp,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { SearchResult } from '@/types/search';

interface SearchResultCardProps {
  result: SearchResult;
  variant?: 'default' | 'compact' | 'detailed';
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onContact?: (id: string) => void;
  onView?: (id: string) => void;
  isFavorited?: boolean;
  className?: string;
}

interface SearchResultListProps {
  results: SearchResult[];
  variant?: 'default' | 'compact' | 'detailed';
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onContact?: (id: string) => void;
  onView?: (id: string) => void;
  favoritedIds?: string[];
  className?: string;
  showFeaturedFirst?: boolean;
  showUrgentFirst?: boolean;
}

// Helper functions
const formatBudget = (budget: SearchResult['budget']): string => {
  if (budget.min === budget.max) {
    return `${budget.min} ${budget.currency}`;
  }
  return `${budget.min} - ${budget.max} ${budget.currency}`;
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Az önce';
  if (diffInHours < 24) return `${diffInHours} saat önce`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} hafta önce`;

  return date.toLocaleDateString('tr-TR');
};

const getLevelColor = (level: string): string => {
  switch (level) {
    case 'En İyi':
      return 'bg-purple-100 text-purple-800';
    case 'Uzman':
      return 'bg-blue-100 text-blue-800';
    case 'Orta':
      return 'bg-green-100 text-green-800';
    case 'Başlangıç':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Individual result card component
export function SearchResultCard({
  result,
  variant = 'default',
  onFavorite,
  onShare,
  onContact,
  onView,
  isFavorited = false,
  className,
}: SearchResultCardProps) {
  const handleCardClick = () => {
    onView?.(result.id);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(result.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(result.id);
  };

  const handleContact = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(result.id);
  };

  if (variant === 'compact') {
    return (
      <Card
        className={cn(
          'cursor-pointer border-l-4 transition-shadow hover:shadow-md',
          result.featured && 'border-l-yellow-500',
          result.urgent && 'border-l-red-500',
          !result.featured && !result.urgent && 'border-l-transparent',
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold">
                  {result.title}
                </h3>
                {result.verified && (
                  <Shield className="h-4 w-4 flex-shrink-0 text-blue-500" />
                )}
                {result.featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Award className="mr-1 h-3 w-3" />
                    Öne Çıkan
                  </Badge>
                )}
                {result.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    <Zap className="mr-1 h-3 w-3" />
                    Acil
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {result.location}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatBudget(result.budget)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(result.postedAt)}
                </span>
              </div>
            </div>

            <div className="ml-4 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="p-1"
              >
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isFavorited && 'fill-red-500 text-red-500'
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="p-1"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card
        className={cn(
          'cursor-pointer border-l-4 transition-all duration-200 hover:shadow-lg',
          result.featured && 'border-l-yellow-500 bg-yellow-50',
          result.urgent && 'border-l-red-500 bg-red-50',
          !result.featured && !result.urgent && 'border-l-transparent',
          className
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-bold">{result.title}</h3>
                {result.verified && (
                  <Shield className="h-5 w-5 text-blue-500" />
                )}
              </div>

              <div className="mb-3 flex items-center gap-3">
                {result.featured && (
                  <Badge variant="secondary">
                    <Award className="mr-1 h-3 w-3" />
                    Öne Çıkan
                  </Badge>
                )}
                {result.urgent && (
                  <Badge variant="destructive">
                    <Zap className="mr-1 h-3 w-3" />
                    Acil
                  </Badge>
                )}
                <Badge variant="outline">{result.category}</Badge>
                <Badge variant="outline">
                  {result.type === 'job'
                    ? 'İş'
                    : result.type === 'service'
                      ? 'Hizmet'
                      : 'Freelancer'}
                </Badge>
              </div>

              <p className="mb-4 line-clamp-3 text-gray-700">
                {result.description}
              </p>

              {/* Skills */}
              <div className="mb-4 flex flex-wrap gap-1">
                {result.skills.slice(0, 5).map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {result.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{result.skills.length - 5} daha
                  </Badge>
                )}
              </div>

              {/* Employer/Freelancer Info */}
              {result.employer && (
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={result.employer.avatar}
                      alt={result.employer.name}
                    />
                    <AvatarFallback>
                      {result.employer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {result.employer.name}
                      </span>
                      {result.employer.verified && (
                        <Shield className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{result.employer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}

              {result.freelancer && (
                <div className="mb-4 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={result.freelancer.avatar}
                      alt={result.freelancer.name}
                    />
                    <AvatarFallback>
                      {result.freelancer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {result.freelancer.name}
                      </span>
                      <Badge
                        className={cn(
                          'text-xs',
                          getLevelColor(result.freelancer.level)
                        )}
                      >
                        {result.freelancer.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      {result.freelancer.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <span>{result.freelancer.hourlyRate} TRY/saat</span>
                      <span>•</span>
                      <span>{result.freelancer.availability}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="ml-4 flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleFavorite}>
                  <Heart
                    className={cn(
                      'h-4 w-4',
                      isFavorited && 'fill-red-500 text-red-500'
                    )}
                  />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCardClick}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatBudget(result.budget)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{result.rating.toFixed(1)}</span>
                  <span>({result.reviews})</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {result.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeAgo(result.postedAt)}
              </span>
              {result.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Son: {formatTimeAgo(result.deadline)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {result.metrics.views}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {result.metrics.applications}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {result.metrics.responseTime}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <User className="mr-1 h-3 w-3" />
                {result.type === 'job'
                  ? 'İş İlanı'
                  : result.type === 'service'
                    ? 'Hizmet'
                    : 'Freelancer'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {result.category}
              </Badge>
            </div>

            <Button onClick={handleContact} className="ml-auto">
              <MessageCircle className="mr-2 h-4 w-4" />
              İletişim Kur
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        'cursor-pointer border-l-4 transition-shadow hover:shadow-md',
        result.featured && 'border-l-yellow-500',
        result.urgent && 'border-l-red-500',
        !result.featured && !result.urgent && 'border-l-transparent',
        className
      )}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="truncate font-semibold">{result.title}</h3>
              {result.verified && (
                <Shield className="h-4 w-4 flex-shrink-0 text-blue-500" />
              )}
            </div>

            <div className="mb-2 flex items-center gap-2">
              {result.featured && (
                <Badge variant="secondary" className="text-xs">
                  <Award className="mr-1 h-3 w-3" />
                  Öne Çıkan
                </Badge>
              )}
              {result.urgent && (
                <Badge variant="destructive" className="text-xs">
                  <Zap className="mr-1 h-3 w-3" />
                  Acil
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {result.category}
              </Badge>
            </div>

            <p className="mb-3 line-clamp-2 text-sm text-gray-700">
              {result.description}
            </p>

            <div className="mb-3 flex flex-wrap gap-1">
              {result.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {result.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{result.skills.length - 3}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {result.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTimeAgo(result.postedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {result.rating.toFixed(1)} ({result.reviews})
              </span>
            </div>
          </div>

          <div className="ml-4 flex flex-col items-end gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={handleFavorite}>
                <Heart
                  className={cn(
                    'h-4 w-4',
                    isFavorited && 'fill-red-500 text-red-500'
                  )}
                />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-right">
              <div className="font-bold text-green-600">
                {formatBudget(result.budget)}
              </div>
              <Button size="sm" onClick={handleContact} className="mt-2">
                İletişim
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Search results list component
export function SearchResultList({
  results,
  variant = 'default',
  onFavorite,
  onShare,
  onContact,
  onView,
  favoritedIds = [],
  className,
  showFeaturedFirst = true,
  showUrgentFirst = true,
}: SearchResultListProps) {
  // Sort results
  const sortedResults = [...results];

  if (showFeaturedFirst || showUrgentFirst) {
    sortedResults.sort((a, b) => {
      if (showUrgentFirst && a.urgent !== b.urgent) {
        return b.urgent ? 1 : -1;
      }
      if (showFeaturedFirst && a.featured !== b.featured) {
        return b.featured ? 1 : -1;
      }
      return 0;
    });
  }

  if (results.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <div className="mb-4 text-gray-500">
          <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
          <h3 className="mb-2 text-lg font-semibold">Sonuç bulunamadı</h3>
          <p>Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {sortedResults.map((result) => (
        <SearchResultCard
          key={result.id}
          result={result}
          variant={variant}
          onFavorite={onFavorite}
          onShare={onShare}
          onContact={onContact}
          onView={onView}
          isFavorited={favoritedIds.includes(result.id)}
        />
      ))}
    </div>
  );
}
