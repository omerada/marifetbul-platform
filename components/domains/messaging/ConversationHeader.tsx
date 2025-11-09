'use client';

/**
 * ConversationHeader Component
 *
 * Conversation header with:
 * - Participant info
 * - Online status
 * - Back button
 * - Actions menu
 *
 * @sprint Sprint 1 - Story 1.4
 */

'use client';

import { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, User, Circle } from 'lucide-react';
import type { Conversation } from '@/types/business/features/messaging';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';
import { MessageSearch } from './MessageSearch';
import { ContextBadge } from './ContextBadge';
import { ContextQuickActions } from './ContextQuickActions';

interface ConversationHeaderProps {
  /** Conversation data */
  conversation: Conversation;
  /** Whether to show back button */
  showBackButton?: boolean;
  /** Callback when back button is clicked */
  onBack?: () => void;
  /** Callback when search result is navigated to */
  onSearchNavigate?: (messageId: string) => void;
  /** Current user role in context (for quick actions) */
  userRole?: 'buyer' | 'seller' | 'employer' | 'freelancer';
  /** Show context quick actions */
  showQuickActions?: boolean;
}

/**
 * ConversationHeader Component
 */
export const ConversationHeader = memo(function ConversationHeader({
  conversation,
  showBackButton = true,
  onBack,
  onSearchNavigate,
  userRole,
  showQuickActions = true,
}: ConversationHeaderProps) {
  const router = useRouter();
  const otherParticipant = conversation.participants[0];
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Get online status from store
  const onlineUsers = useMessagingStore((state) => state.onlineUsers);
  const isOnline = useMemo(
    () => onlineUsers.includes(otherParticipant?.id || ''),
    [onlineUsers, otherParticipant?.id]
  );

  // Handle back button
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/messages');
    }
  };

  return (
    <>
      <div className="border-b border-gray-200 bg-white shadow-sm">
        {/* Main Header Row */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex-shrink-0 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
              aria-label="Geri dön"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Participant Avatar */}
          <div className="relative flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
              {otherParticipant?.avatar ? (
                <Image
                  src={otherParticipant.avatar}
                  alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-gray-600" />
              )}
            </div>

            {/* Online Badge */}
            {isOnline && (
              <div className="absolute right-0 bottom-0 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-green-500">
                <Circle className="h-1.5 w-1.5 fill-current text-green-500" />
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h2>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </p>
          </div>

          {/* Search Button */}
          <MessageSearch
            conversationId={conversation.id}
            onResultNavigate={onSearchNavigate}
            isExpanded={isSearchExpanded}
            onToggle={() => setIsSearchExpanded(!isSearchExpanded)}
          />

          {/* Actions Menu */}
          <button
            className="flex-shrink-0 rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Menü"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Context Row */}
        {conversation.contextType && conversation.contextId && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Context Badge */}
              <ContextBadge
                contextType={conversation.contextType}
                title={conversation.contextData?.title}
                contextId={conversation.contextId}
                showLink={true}
                onClick={() => {
                  const paths: Record<string, string> = {
                    ORDER: `/orders/${conversation.contextId}`,
                    PROPOSAL: `/proposals/${conversation.contextId}`,
                    JOB: `/jobs/${conversation.contextId}`,
                    PACKAGE: `/packages/${conversation.contextId}`,
                  };
                  if (conversation.contextType) {
                    router.push(paths[conversation.contextType]);
                  }
                }}
              />

              {/* Quick Actions */}
              {showQuickActions && userRole && (
                <ContextQuickActions
                  context={{
                    type: conversation.contextType,
                    id: conversation.contextId,
                    title: conversation.contextData?.title || '',
                    additionalData: conversation.contextData,
                  }}
                  userRole={userRole}
                  compact={true}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar (when expanded) */}
      {isSearchExpanded && (
        <MessageSearch
          conversationId={conversation.id}
          onResultNavigate={onSearchNavigate}
          isExpanded={true}
          onToggle={() => setIsSearchExpanded(false)}
        />
      )}
    </>
  );
});
