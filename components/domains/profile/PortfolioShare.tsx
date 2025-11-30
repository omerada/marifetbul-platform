'use client';

import React from 'react';
import { Share2, Copy, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { PortfolioItem } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';

interface PortfolioShareProps {
  portfolio: PortfolioItem;
  userId?: string;
}

export function PortfolioShare({ portfolio, userId }: PortfolioShareProps) {
  const [copied, setCopied] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  // Generate public portfolio URL
  const portfolioUrl = React.useMemo(() => {
    if (typeof window === 'undefined') return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/profile/${userId}?portfolio=${portfolio.id}`;
  }, [userId, portfolio.id]);

  // Copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      logger.info('Portfolio link copied to clipboard', { portfolioId: portfolio.id,  });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Failed to copy portfolio link', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Social media share handlers
  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(portfolioUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    logger.info('Portfolio shared on Facebook', { portfolioId: portfolio.id });
  };

  const handleTwitterShare = () => {
    const text = `Check out my project: ${portfolio.title}`;
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(portfolioUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    logger.info('Portfolio shared on Twitter', { portfolioId: portfolio.id });
  };

  const handleLinkedinShare = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(portfolioUrl)}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
    logger.info('Portfolio shared on LinkedIn', { portfolioId: portfolio.id });
  };

  // Native share API (mobile support)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: portfolio.title,
          text: portfolio.description,
          url: portfolioUrl,
        });
        logger.info('Portfolio shared via native API', { portfolioId: portfolio.id,  });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== 'AbortError') {
          logger.error('Native share failed', error instanceof Error ? error : new Error(String(error)));
        }
      }
    } else {
      // Fallback to menu
      setShowShareMenu(!showShareMenu);
    }
  };

  return (
    <div className="relative">
      {/* Main Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center space-x-2"
      >
        <Share2 className="h-4 w-4" />
        <span>Paylaş</span>
      </Button>

      {/* Share Menu - Desktop Fallback */}
      {showShareMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowShareMenu(false)}
          />

          {/* Share Menu */}
          <div className="absolute top-12 right-0 z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Portfolyo Öğesini Paylaş
            </h3>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="mb-2 flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-gray-100"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5 text-gray-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                </p>
                <p className="truncate text-xs text-gray-500">{portfolioUrl}</p>
              </div>
            </button>

            <div className="my-3 border-t border-gray-200" />

            {/* Social Media Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleFacebookShare}
                className="flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-blue-50"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Facebook&apos;ta Paylaş
                </span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-sky-50"
              >
                <Twitter className="h-5 w-5 text-sky-600" />
                <span className="text-sm font-medium text-gray-900">
                  Twitter&apos;da Paylaş
                </span>
              </button>

              <button
                onClick={handleLinkedinShare}
                className="flex w-full items-center space-x-3 rounded-lg p-2 text-left transition-colors hover:bg-blue-50"
              >
                <Linkedin className="h-5 w-5 text-blue-700" />
                <span className="text-sm font-medium text-gray-900">
                  LinkedIn&apos;de Paylaş
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
