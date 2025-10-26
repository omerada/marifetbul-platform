/**
 * ================================================
 * FOLLOW STATS COMPONENT
 * ================================================
 * Displays follower/following counts with clickable cards
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

'use client';

import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowStatsProps {
  followerCount: number;
  followingCount: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * Follow statistics component with interactive cards
 *
 * @example
 * ```tsx
 * <FollowStats
 *   followerCount={120}
 *   followingCount={50}
 *   onFollowersClick={() => setShowFollowersModal(true)}
 *   onFollowingClick={() => setShowFollowingModal(true)}
 * />
 * ```
 */
export function FollowStats({
  followerCount,
  followingCount,
  onFollowersClick,
  onFollowingClick,
  className,
  variant = 'default',
}: FollowStatsProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn('flex items-center gap-4 text-sm', className)}
        data-testid="follow-stats"
      >
        <button
          onClick={onFollowersClick}
          className="hover:text-primary flex items-center gap-1.5 transition-colors"
          aria-label={`${followerCount} takipçi`}
        >
          <Users size={16} className="text-muted-foreground" />
          <span className="font-semibold">{formatCount(followerCount)}</span>
          <span className="text-muted-foreground">Takipçi</span>
        </button>
        <button
          onClick={onFollowingClick}
          className="hover:text-primary flex items-center gap-1.5 transition-colors"
          aria-label={`${followingCount} takip edilen`}
        >
          <span className="font-semibold">{formatCount(followingCount)}</span>
          <span className="text-muted-foreground">Takip</span>
        </button>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-4', className)} data-testid="follow-stats">
      <button
        onClick={onFollowersClick}
        className={cn(
          'flex flex-col items-center justify-center',
          'bg-card rounded-lg border p-4',
          'hover:bg-accent transition-colors',
          'min-w-[100px]'
        )}
        aria-label={`${followerCount} takipçi`}
      >
        <div className="mb-1 flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          <span className="text-2xl font-bold">
            {formatCount(followerCount)}
          </span>
        </div>
        <span className="text-muted-foreground text-sm">Takipçi</span>
      </button>

      <button
        onClick={onFollowingClick}
        className={cn(
          'flex flex-col items-center justify-center',
          'bg-card rounded-lg border p-4',
          'hover:bg-accent transition-colors',
          'min-w-[100px]'
        )}
        aria-label={`${followingCount} takip edilen`}
      >
        <div className="mb-1 flex items-center gap-2">
          <Users size={18} className="text-muted-foreground" />
          <span className="text-2xl font-bold">
            {formatCount(followingCount)}
          </span>
        </div>
        <span className="text-muted-foreground text-sm">Takip</span>
      </button>
    </div>
  );
}
