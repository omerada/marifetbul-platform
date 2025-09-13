'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Eye,
  Clock,
  User,
  Calendar,
  Tag,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { HelpArticle } from '@/types';

interface ArticleCardProps {
  article: HelpArticle;
  showExcerpt?: boolean;
  showCategory?: boolean;
  showRating?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  onRate?: (rating: number) => void;
}

export function ArticleCard({
  article,
  showExcerpt = true,
  showCategory = true,
  showRating = true,
  variant = 'default',
  onRate,
}: ArticleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/help/articles/${article.slug}`);
  };

  const handleRate = (rating: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRate) {
      onRate(rating);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (variant === 'compact') {
    return (
      <Card
        className="group cursor-pointer p-4 transition-all hover:shadow-md"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {article.featured && (
            <div className="flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
                <Star className="h-3 w-3 text-yellow-600" />
              </div>
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-blue-600">
              {article.title}
            </h3>

            {showExcerpt && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                {article.excerpt}
              </p>
            )}

            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{article.views}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{article.estimatedReadTime} dk</span>
              </div>

              {showRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span>{article.rating}</span>
                </div>
              )}
            </div>
          </div>

          <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card
        className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
        onClick={handleClick}
      >
        <div className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-3 w-3 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-yellow-600">
              Öne Çıkan
            </span>
          </div>

          <h3 className="mb-3 text-xl font-bold text-gray-900 group-hover:text-blue-600">
            {article.title}
          </h3>

          {showExcerpt && (
            <p className="mb-4 line-clamp-3 text-gray-600">{article.excerpt}</p>
          )}

          {showCategory && article.category && (
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                <Tag className="mr-1 h-3 w-3" />
                {article.category.name}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.views} görüntülenme</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{article.estimatedReadTime} dk okuma</span>
              </div>
            </div>

            {showRating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="font-medium">{article.rating}</span>
                <span className="text-gray-500">({article.ratingCount})</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg"
      onClick={handleClick}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            {article.featured && (
              <div className="mb-2 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-600">
                  Öne Çıkan
                </span>
              </div>
            )}

            <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
              {article.title}
            </h3>

            {showExcerpt && (
              <p className="line-clamp-2 text-gray-600">{article.excerpt}</p>
            )}
          </div>
        </div>

        {showCategory && article.category && (
          <div className="mb-4">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              <Tag className="mr-1 h-3 w-3" />
              {article.category.name}
            </span>
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{article.author.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(article.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.views}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.estimatedReadTime} dk</span>
            </div>

            {showRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{article.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating Actions */}
        {onRate && (
          <div className="mt-4 flex items-center gap-2 border-t pt-4">
            <span className="text-sm text-gray-600">
              Bu makale yararlı mıydı?
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleRate(5, e)}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="h-3 w-3" />
                Evet
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => handleRate(1, e)}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="h-3 w-3" />
                Hayır
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
