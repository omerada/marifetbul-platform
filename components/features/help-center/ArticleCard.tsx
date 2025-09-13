'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Eye,
  Star,
  ThumbsUp,
  User,
  Calendar,
  Tag,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HelpArticle } from '@/types';

interface ArticleCardProps {
  article: HelpArticle;
  variant?: 'default' | 'compact' | 'featured';
  showCategory?: boolean;
  showAuthor?: boolean;
  showStats?: boolean;
  showActions?: boolean;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
  showCategory = true,
  showAuthor = true,
  showStats = true,
  showActions = false,
  className,
}) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/help/article/${article.slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} ay önce`;
    return `${Math.ceil(diffDays / 365)} yıl önce`;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={cn(
          'h-3 w-3',
          index < Math.floor(rating)
            ? 'fill-current text-yellow-400'
            : 'text-gray-300'
        )}
      />
    ));
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'group block w-full rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {article.featured && (
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600"></div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 font-medium text-gray-900 transition-colors group-hover:text-blue-600">
              {article.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {article.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(article.updatedAt)}
              </span>
              {article.rating > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-400" />
                  {article.rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'featured') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'group block w-full rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 text-left transition-all hover:shadow-lg',
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                ⭐ Öne Çıkan
              </span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                {article.estimatedReadTime} dk
              </span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {article.title}
            </h3>
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">
              {article.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {article.ratingCount} değerlendirme
                </span>
              </div>
              {article.rating > 0 && (
                <div className="flex items-center gap-1">
                  {getRatingStars(article.rating)}
                  <span className="ml-1 text-sm text-gray-600">
                    ({article.rating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-lg',
        className
      )}
    >
      <button onClick={handleClick} className="w-full p-6 text-left">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              {article.featured && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                  ⭐ Öne Çıkan
                </span>
              )}
              {showCategory && article.category && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                  <Tag className="mr-1 h-3 w-3" />
                  {article.category.name}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                {article.estimatedReadTime} dk
              </span>
            </div>
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {article.title}
            </h3>
          </div>
          {article.rating > 0 && (
            <div className="flex flex-shrink-0 items-center gap-1">
              {getRatingStars(article.rating)}
              <span className="ml-1 text-sm text-gray-600">
                ({article.rating.toFixed(1)})
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <p className="mb-4 line-clamp-3 text-sm text-gray-600">
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{article.tags.length - 3} etiket daha
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {showStats && (
              <>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {article.ratingCount}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {showAuthor && article.author && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {article.author.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.updatedAt)}
            </span>
          </div>
        </div>
      </button>

      {/* Actions */}
      {showActions && (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 rounded-md px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-blue-50 hover:text-blue-600">
                <BookOpen className="h-4 w-4" />
                Oku
              </button>
              <button className="flex items-center gap-1 rounded-md px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-green-50 hover:text-green-600">
                <ThumbsUp className="h-4 w-4" />
                Yararlı
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {article.estimatedReadTime} dk okuma
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCard;
