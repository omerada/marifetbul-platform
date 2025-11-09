'use client';

/**
 * ================================================
 * FOLLOWING MODAL COMPONENT
 * ================================================
 * Modal displaying list of users being followed with infinite scroll
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-10-26
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFollowingList } from '@/hooks/business/useFollowingList';
import { Dialog } from '@/components/ui/Dialog';
import { Avatar } from '@/components/ui/Avatar';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { FollowButton } from './FollowButton';
import { Input } from '@/components/ui/Input';
import { Search, X, UserCheck } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@/types/core/base';

interface FollowingModalProps {
  userId: string;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for displaying following list with search and infinite scroll
 *
 * @example
 * ```tsx
 * <FollowingModal
 *   userId="123"
 *   username="john_doe"
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 * />
 * ```
 */
export function FollowingModal({
  userId,
  username,
  isOpen,
  onClose,
}: FollowingModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    following,
    pagination,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useFollowingList({
    userId,
    pageSize: 20,
    enabled: isOpen,
  });

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen || !observerTarget.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);

    return () => observer.disconnect();
  }, [isOpen, hasMore, isLoading, loadMore]);

  // Filter following by search query
  const filteredFollowing = following.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(query) ||
      user.fullName?.toLowerCase().includes(query) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
    );
  });

  const handleFollowChange = useCallback(() => {
    // Refetch the list when a follow state changes
    refetch();
  }, [refetch]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div
        className="flex h-[600px] max-h-[80vh] flex-col"
        data-testid="following-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <UserCheck size={20} />
            <h2 className="text-lg font-semibold">
              {username ? `${username} Takip Ediyor` : 'Takip Edilenler'}
            </h2>
          </div>
          <UnifiedButton
            onClick={onClose}
            variant="ghost"
            size="sm"
            leftIcon={<X size={18} />}
            aria-label="Kapat"
          />
        </div>

        {/* Search */}
        <div className="border-b p-4">
          <div className="relative">
            <Search
              size={18}
              className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2"
            />
            <Input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="text-destructive py-8 text-center">
              <p>Takip listesi yüklenirken hata oluştu</p>
              <UnifiedButton
                onClick={refetch}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Tekrar Dene
              </UnifiedButton>
            </div>
          )}

          {!error && filteredFollowing.length === 0 && !isLoading && (
            <div className="text-muted-foreground py-8 text-center">
              <UserCheck size={48} className="mx-auto mb-2 opacity-50" />
              <p>
                {searchQuery
                  ? 'Aradığınız kullanıcı bulunamadı'
                  : 'Henüz kimse takip edilmiyor'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredFollowing.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                currentUserId={userId}
                onFollowChange={handleFollowChange}
              />
            ))}
          </div>

          {/* Loading indicator and observer target */}
          {hasMore && !isLoading && (
            <div
              ref={observerTarget}
              className="flex h-10 items-center justify-center"
            >
              <span className="text-muted-foreground text-sm">
                Daha fazla yükle...
              </span>
            </div>
          )}

          {isLoading && (
            <div className="py-4 text-center">
              <div className="border-primary mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </div>

        {/* Footer */}
        {pagination && pagination.total !== undefined && (
          <div className="text-muted-foreground border-t p-4 text-center text-sm">
            {pagination.total} kullanıcı takip ediliyor
          </div>
        )}
      </div>
    </Dialog>
  );
}

// User card component
interface UserCardProps {
  user: User;
  currentUserId: string;
  onFollowChange: () => void;
}

function UserCard({ user, currentUserId, onFollowChange }: UserCardProps) {
  const isCurrentUser = user.id === currentUserId;

  return (
    <div
      className="hover:bg-accent flex items-center justify-between rounded-lg p-3 transition-colors"
      data-testid="user-card"
    >
      <Link
        href={`/profile/${user.username || user.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar
          src={user.avatarUrl || user.avatar || user.profilePictureUrl}
          alt={
            user.fullName ||
            user.username ||
            `${user.firstName} ${user.lastName}` ||
            'User'
          }
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {user.fullName ||
              user.username ||
              `${user.firstName} ${user.lastName}`}
          </p>
          {user.username && (
            <p className="text-muted-foreground truncate text-sm">
              @{user.username}
            </p>
          )}
          {user.title && (
            <p className="text-muted-foreground truncate text-xs">
              {user.title}
            </p>
          )}
        </div>
      </Link>

      {!isCurrentUser && (
        <FollowButton
          userId={user.id}
          username={user.username}
          size="sm"
          variant="outline"
          onFollowChange={onFollowChange}
        />
      )}
    </div>
  );
}
