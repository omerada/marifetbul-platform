/**
 * ================================================
 * REVIEW VOTING COMPONENT
 * ================================================
 * Component for users to vote on reviews (helpful/not helpful)
 * Supports optimistic UI updates and vote toggling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1: Review System Completion - Story 1.2
 */

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { cn } from '@/lib/utils';
import { VoteType } from '@/types/business/review';

export interface ReviewVotingProps {
  reviewId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  userVote?: VoteType;
  onVote: (reviewId: string, voteType: VoteType) => Promise<void>;
  onRemoveVote: (reviewId: string) => Promise<void>;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReviewVoting({
  reviewId,
  helpfulCount: initialHelpfulCount,
  notHelpfulCount: initialNotHelpfulCount,
  userVote: initialUserVote,
  onVote,
  onRemoveVote,
  disabled = false,
  className,
  size = 'md',
}: ReviewVotingProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(
    initialNotHelpfulCount
  );
  const [userVote, setUserVote] = useState(initialUserVote);

  const handleVote = async (voteType: VoteType) => {
    if (disabled || isVoting) return;

    setIsVoting(true);

    // Store previous state for rollback on error
    const prevHelpfulCount = helpfulCount;
    const prevNotHelpfulCount = notHelpfulCount;
    const prevUserVote = userVote;

    try {
      // Optimistic UI update
      if (userVote === voteType) {
        // User clicked same vote - remove it
        setUserVote(undefined);
        if (voteType === VoteType.HELPFUL) {
          setHelpfulCount((prev) => Math.max(0, prev - 1));
        } else {
          setNotHelpfulCount((prev) => Math.max(0, prev - 1));
        }
        await onRemoveVote(reviewId);
      } else {
        // User voted or changed vote
        setUserVote(voteType);

        // Adjust counts
        if (prevUserVote === VoteType.HELPFUL) {
          setHelpfulCount((prev) => Math.max(0, prev - 1));
        } else if (prevUserVote === VoteType.NOT_HELPFUL) {
          setNotHelpfulCount((prev) => Math.max(0, prev - 1));
        }

        if (voteType === VoteType.HELPFUL) {
          setHelpfulCount((prev) => prev + 1);
        } else {
          setNotHelpfulCount((prev) => prev + 1);
        }

        await onVote(reviewId, voteType);
      }
    } catch (error) {
      // Rollback on error
      setHelpfulCount(prevHelpfulCount);
      setNotHelpfulCount(prevNotHelpfulCount);
      setUserVote(prevUserVote);
      console.error('Failed to vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const buttonSize = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
  }[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Helpful Vote */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => handleVote(VoteType.HELPFUL)}
        disabled={disabled || isVoting}
        className={cn(
          'gap-1.5 transition-colors',
          userVote === VoteType.HELPFUL &&
            'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
        )}
        aria-label="Mark as helpful"
      >
        {isVoting && userVote === VoteType.HELPFUL ? (
          <Loader2 className={cn(iconSize, 'animate-spin')} />
        ) : (
          <ThumbsUp
            className={cn(
              iconSize,
              userVote === VoteType.HELPFUL && 'fill-current'
            )}
          />
        )}
        <span className="text-xs font-medium">{helpfulCount}</span>
      </Button>

      {/* Not Helpful Vote */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={() => handleVote(VoteType.NOT_HELPFUL)}
        disabled={disabled || isVoting}
        className={cn(
          'gap-1.5 transition-colors',
          userVote === VoteType.NOT_HELPFUL &&
            'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
        )}
        aria-label="Mark as not helpful"
      >
        {isVoting && userVote === VoteType.NOT_HELPFUL ? (
          <Loader2 className={cn(iconSize, 'animate-spin')} />
        ) : (
          <ThumbsDown
            className={cn(
              iconSize,
              userVote === VoteType.NOT_HELPFUL && 'fill-current'
            )}
          />
        )}
        <span className="text-xs font-medium">{notHelpfulCount}</span>
      </Button>

      {/* Helpful Label (optional, for larger sizes) */}
      {size === 'lg' && (
        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
          Bu değerlendirme faydalı mıydı?
        </span>
      )}
    </div>
  );
}

/**
 * Simple voting display (read-only)
 */
export interface ReviewVotingDisplayProps {
  helpfulCount: number;
  notHelpfulCount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ReviewVotingDisplay({
  helpfulCount,
  notHelpfulCount,
  className,
  size = 'md',
}: ReviewVotingDisplayProps) {
  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <div className={cn('flex items-center gap-3 text-gray-600', className)}>
      <div className="flex items-center gap-1">
        <ThumbsUp className={iconSize} />
        <span className="text-xs font-medium">{helpfulCount}</span>
      </div>
      <div className="flex items-center gap-1">
        <ThumbsDown className={iconSize} />
        <span className="text-xs font-medium">{notHelpfulCount}</span>
      </div>
    </div>
  );
}
