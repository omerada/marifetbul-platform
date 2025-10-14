'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  BookOpen,
  Clock,
  User,
  Calendar,
  Tag,
  Eye,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  XCircle,
  Copy,
  Facebook,
  Twitter,
} from 'lucide-react';
import { useHelpCenter } from '@/hooks';
import { cn } from '@/lib/utils';
import type { HelpArticle } from '@/types';
import { logger } from '@/lib/shared/utils/logger';

interface ArticleViewerProps {
  article: HelpArticle;
  onBack?: () => void;
  showRelated?: boolean;
  className?: string;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({
  article,
  onBack,
  showRelated = true,
  className,
}) => {
  const router = useRouter();
  const { rateArticle } = useHelpCenter();
  const [userRating, setUserRating] = React.useState<number | null>(null);
  const [isHelpful, setIsHelpful] = React.useState<boolean | null>(null);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = React.useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleRating = async (rating: number) => {
    try {
      await rateArticle({
        articleId: article.id,
        rating,
        isHelpful: rating >= 4,
      });
      setUserRating(rating);
    } catch (error) {
      logger.error(
        'Rating failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleHelpful = async (helpful: boolean) => {
    try {
      // API call would go here
      setIsHelpful(helpful);
    } catch (error) {
      logger.error(
        'Helpful vote failed',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const title = article.title;

    switch (platform) {
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopiedToClipboard(true);
          setTimeout(() => setCopiedToClipboard(false), 2000);
        } catch (error) {
          logger.error(
            'Copy failed',
            error instanceof Error ? error : new Error(String(error))
          );
        }
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
          '_blank'
        );
        break;
    }
    setShowShareMenu(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRatingStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        onClick={interactive ? () => handleRating(index + 1) : undefined}
        disabled={!interactive}
        className={cn(
          'h-5 w-5 transition-colors',
          interactive ? 'cursor-pointer hover:text-yellow-400' : '',
          index < Math.floor(rating)
            ? 'fill-current text-yellow-400'
            : 'text-gray-300'
        )}
      >
        <Star className="h-full w-full" />
      </button>
    ));
  };

  return (
    <div className={cn('mx-auto max-w-4xl', className)}>
      {/* Header */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          {/* Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri Dön
            </button>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                >
                  <Share2 className="h-4 w-4" />
                  Paylaş
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute top-full right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Copy className="h-4 w-4" />
                      {copiedToClipboard ? 'Kopyalandı!' : 'Linki Kopyala'}
                      {copiedToClipboard && (
                        <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook&apos;ta Paylaş
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Twitter className="h-4 w-4" />
                      Twitter&apos;da Paylaş
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Article Info */}
          <div className="mb-6">
            {/* Tags & Category */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {article.featured && (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  ⭐ Öne Çıkan
                </span>
              )}
              {article.category && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                  <Tag className="mr-1 h-3 w-3" />
                  {typeof article.category === 'string'
                    ? article.category
                    : article.category.name}
                </span>
              )}
              {article.tags &&
                article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {typeof article.author === 'string'
                  ? article.author
                  : article.author.name}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(
                  article.publishedAt ||
                    article.createdAt ||
                    new Date().toISOString()
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.estimatedReadTime} dakika okuma
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views} görüntüleme
              </div>
              {article.rating && article.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  {article.rating.toFixed(1)} ({article.ratingCount || 0}{' '}
                  değerlendirme)
                </div>
              )}
            </div>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="mb-6 border-l-4 border-blue-400 bg-blue-50 p-4">
              <p className="font-medium text-blue-900">{article.excerpt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div
            className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>

      {/* Actions & Feedback */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <div className="text-center">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Bu makale size yardımcı oldu mu?
            </h3>

            {/* Helpful Buttons */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <button
                onClick={() => handleHelpful(true)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-6 py-3 transition-all',
                  isHelpful === true
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                <ThumbsUp className="h-5 w-5" />
                Evet, yararlı
                {isHelpful === true && <CheckCircle className="h-4 w-4" />}
              </button>
              <button
                onClick={() => handleHelpful(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-6 py-3 transition-all',
                  isHelpful === false
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                )}
              >
                <ThumbsDown className="h-5 w-5" />
                Hayır, yararlı değil
                {isHelpful === false && <XCircle className="h-4 w-4" />}
              </button>
            </div>

            {/* Rating */}
            <div className="border-t pt-6">
              <h4 className="mb-3 text-base font-medium text-gray-900">
                Bu makaleyi değerlendirin
              </h4>
              <div className="mb-2 flex items-center justify-center gap-1">
                {getRatingStars(userRating || 0, true)}
              </div>
              <p className="text-sm text-gray-600">
                {userRating
                  ? `${userRating} yıldız verdiniz`
                  : 'Yıldıza tıklayarak değerlendirin'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {showRelated &&
        article.relatedArticles &&
        article.relatedArticles.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <BookOpen className="h-5 w-5" />
                İlgili Makaleler
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {article.relatedArticles.slice(0, 4).map((relatedId) => (
                  <button
                    key={relatedId}
                    onClick={() => router.push(`/help/article/${relatedId}`)}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:bg-gray-50"
                  >
                    <BookOpen className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900">
                        İlgili Makale #{relatedId}
                      </div>
                      <div className="text-sm text-gray-600">
                        Bu konuyla ilgili daha fazla bilgi
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* Click outside to close share menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
};

export default ArticleViewer;
