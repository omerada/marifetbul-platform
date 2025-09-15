'use client';

import React, { useState, useCallback } from 'react';
import { Heart, Bookmark, Share2, Copy, Check } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useSocialShare } from '@/hooks';
import { useClipboard } from '@/hooks/shared/ui';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface InteractionData {
  id: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
}

export interface InteractionButtonsProps {
  data: InteractionData;
  onLike?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onShare?: (id: string) => void;
  variant?: 'default' | 'floating' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
  initialStates?: {
    isLiked?: boolean;
    isBookmarked?: boolean;
  };
}

export interface SocialShareButtonProps {
  data: {
    url: string;
    title: string;
    description?: string;
    image?: string;
  };
  variant?: 'dropdown' | 'inline' | 'modal';
  size?: 'sm' | 'md' | 'lg';
  showCopyLink?: boolean;
  className?: string;
}

// ================================================
// INTERACTION BUTTONS COMPONENT
// ================================================

export const InteractionButtons = React.memo<InteractionButtonsProps>(
  ({
    data,
    onLike,
    onBookmark,
    onShare,
    variant = 'default',
    size = 'md',
    showLabels = false,
    className,
    initialStates = {},
  }) => {
    const [isLiked, setIsLiked] = useState(initialStates.isLiked || false);
    const [isBookmarked, setIsBookmarked] = useState(
      initialStates.isBookmarked || false
    );

    const handleLike = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        onLike?.(data.id);
      },
      [isLiked, onLike, data.id]
    );

    const handleBookmark = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
        onBookmark?.(data.id);
      },
      [isBookmarked, onBookmark, data.id]
    );

    const handleShare = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare?.(data.id);
      },
      [onShare, data.id]
    );

    const buttonVariants = {
      default:
        'rounded-lg border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50',
      floating:
        'rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md',
      compact: 'rounded border-none bg-transparent hover:bg-gray-100',
    };

    const sizeVariants = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    const iconSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const baseClasses = cn(
      'transition-all duration-200',
      buttonVariants[variant],
      sizeVariants[size]
    );

    const likeClasses = cn(
      baseClasses,
      isLiked
        ? 'bg-red-500 text-white hover:bg-red-600'
        : 'text-gray-600 hover:bg-red-50 hover:text-red-500'
    );

    const bookmarkClasses = cn(
      baseClasses,
      isBookmarked
        ? 'bg-blue-500 text-white hover:bg-blue-600'
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-500'
    );

    const shareClasses = cn(baseClasses, 'text-gray-600 hover:bg-gray-50');

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <button
          onClick={handleLike}
          className={likeClasses}
          aria-label={isLiked ? 'Beğeniyi kaldır' : 'Beğen'}
        >
          <Heart className={cn(iconSizes[size], isLiked && 'fill-current')} />
          {showLabels && <span className="ml-1 text-xs">Beğen</span>}
        </button>

        <button
          onClick={handleBookmark}
          className={bookmarkClasses}
          aria-label={isBookmarked ? 'Kayderileni kaldır' : 'Kaydet'}
        >
          <Bookmark
            className={cn(iconSizes[size], isBookmarked && 'fill-current')}
          />
          {showLabels && <span className="ml-1 text-xs">Kaydet</span>}
        </button>

        <button
          onClick={handleShare}
          className={shareClasses}
          aria-label="Paylaş"
        >
          <Share2 className={iconSizes[size]} />
          {showLabels && <span className="ml-1 text-xs">Paylaş</span>}
        </button>
      </div>
    );
  }
);

InteractionButtons.displayName = 'InteractionButtons';

// ================================================
// SOCIAL SHARE BUTTON COMPONENT
// ================================================

export const SocialShareButton = React.memo<SocialShareButtonProps>(
  ({
    data,
    variant = 'dropdown',
    size = 'md',
    showCopyLink = true,
    className,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { share } = useSocialShare();
    const { copy, copied } = useClipboard();

    const handleCopyLink = useCallback(async () => {
      await copy(data.url);
    }, [copy, data.url]);

    const handleShare = useCallback(
      async (platform: string) => {
        await share(
          platform as 'facebook' | 'twitter' | 'linkedin' | 'whatsapp',
          data
        );
        setIsOpen(false);
      },
      [share, data]
    );

    const platforms = [
      { id: 'facebook', name: 'Facebook', color: 'bg-[#1877F2]' },
      { id: 'twitter', name: 'Twitter', color: 'bg-[#1DA1F2]' },
      { id: 'linkedin', name: 'LinkedIn', color: 'bg-[#0A66C2]' },
      { id: 'whatsapp', name: 'WhatsApp', color: 'bg-[#25D366]' },
    ];

    if (variant === 'dropdown') {
      return (
        <div className={cn('relative', className)}>
          <Button
            variant="outline"
            size={size}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Paylaş
          </Button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleShare(platform.id)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <div className={cn('h-4 w-4 rounded', platform.color)} />
                    {platform.name}
                  </button>
                ))}
                {showCopyLink && (
                  <button
                    onClick={handleCopyLink}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      );
    }

    return null;
  }
);

SocialShareButton.displayName = 'SocialShareButton';

// ================================================
// EXPORTS
// ================================================

const InteractionComponents = {
  InteractionButtons,
  SocialShareButton,
};

export default InteractionComponents;
