'use client';

import React, { useState, useCallback } from 'react';
import { Heart, Bookmark, Share2 } from 'lucide-react';
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

// SocialShareButton moved to shared/social/SocialShare.tsx
// Use: import { SocialShare } from '@/components/shared/social/SocialShare'

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
