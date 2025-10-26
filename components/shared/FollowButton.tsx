/**
 * ================================================
 * FOLLOW BUTTON COMPONENT
 * ================================================
 * Button component for follow/unfollow functionality
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

'use client';

import { useFollow } from '@/hooks/business/useFollow';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { UserPlus, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  userId: string;
  username?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showIcon?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

/**
 * Follow/Unfollow button with optimistic updates
 *
 * @example
 * ```tsx
 * <FollowButton
 *   userId="123"
 *   username="john_doe"
 *   variant="default"
 *   showIcon={true}
 * />
 * ```
 */
export function FollowButton({
  userId,
  username,
  variant = 'primary',
  size = 'md',
  className,
  showIcon = true,
  onFollowChange,
}: FollowButtonProps) {
  const { isFollowing, isLoading, toggleFollow } = useFollow({
    userId,
    onFollowChange,
  });

  return (
    <UnifiedButton
      onClick={toggleFollow}
      disabled={isLoading}
      loading={isLoading}
      variant={isFollowing ? 'outline' : variant}
      size={size}
      leftIcon={
        showIcon && !isLoading ? (
          isFollowing ? (
            <UserMinus size={16} />
          ) : (
            <UserPlus size={16} />
          )
        ) : undefined
      }
      className={cn(
        'group transition-all',
        isFollowing && 'hover:border-red-500 hover:bg-red-500 hover:text-white',
        className
      )}
      aria-label={
        isFollowing
          ? `${username ? `${username} hesabını` : 'Kullanıcıyı'} takipten çıkar`
          : `${username ? `${username} hesabını` : 'Kullanıcıyı'} takip et`
      }
      data-testid="follow-button"
    >
      {isLoading ? (
        'İşleniyor...'
      ) : (
        <>
          <span className="group-hover:hidden">
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </span>
          {isFollowing && (
            <span className="hidden group-hover:inline">Takipten Çık</span>
          )}
        </>
      )}
    </UnifiedButton>
  );
}
