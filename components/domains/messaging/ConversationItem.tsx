'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import {
  MessageSquare,
  ShoppingCart,
  FileText,
  Briefcase,
  Box,
  User,
  Circle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  Conversation,
  ContextType,
} from '@/types/business/features/messaging';
import { ConversationContextMenu } from './ConversationContextMenu';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';

/**
 * Get icon component for context type
 */
function getContextIcon(contextType?: ContextType) {
  switch (contextType) {
    case 'ORDER':
      return ShoppingCart;
    case 'PROPOSAL':
      return FileText;
    case 'JOB':
      return Briefcase;
    case 'PACKAGE':
      return Box;
    default:
      return MessageSquare;
  }
}

/**
 * Get color classes for context type
 */
function getContextColor(contextType?: ContextType) {
  switch (contextType) {
    case 'ORDER':
      return 'bg-blue-100 text-blue-700';
    case 'PROPOSAL':
      return 'bg-purple-100 text-purple-700';
    case 'JOB':
      return 'bg-green-100 text-green-700';
    case 'PACKAGE':
      return 'bg-amber-100 text-amber-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

interface ConversationItemProps {
  conversation: Conversation;
  isArchived: boolean;
  onClick: (conversationId: string) => void;
  onArchive: (conversationId: string) => void;
  onUnarchive: (conversationId: string) => void;
  onDelete: (conversationId: string) => void;
}

/**
 * Optimized conversation list item component.
 * Memoized to prevent unnecessary re-renders.
 * Features real-time updates via WebSocket:
 * - Online/offline status badge
 * - Typing indicator
 * - Unread count updates
 * - Last message preview updates
 */
export const ConversationItem = memo(function ConversationItem({
  conversation,
  isArchived,
  onClick,
  onArchive,
  onUnarchive,
  onDelete,
}: ConversationItemProps) {
  const otherParticipant = conversation.participants[0];
  const ContextIcon = getContextIcon(conversation.contextType);
  const contextColor = getContextColor(conversation.contextType);

  // Real-time updates from store
  const onlineUsers = useMessagingStore((state) => state.onlineUsers);
  const typingUsers = useMessagingStore(
    (state) => state.typingUsers[conversation.id] || []
  );

  // Check if other participant is online
  const isOnline = useMemo(
    () => onlineUsers.includes(otherParticipant?.id || ''),
    [onlineUsers, otherParticipant?.id]
  );

  // Check if other participant is typing
  const isTyping = useMemo(
    () => typingUsers.some((userId) => userId === otherParticipant?.id),
    [typingUsers, otherParticipant?.id]
  );

  return (
    <Card
      className={`cursor-pointer p-4 transition-all hover:shadow-md ${
        conversation.unreadCount > 0
          ? 'border-blue-200 bg-blue-50'
          : 'hover:bg-gray-50'
      }`}
      onClick={() => onClick(conversation.id)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
            {otherParticipant?.avatar ? (
              <Image
                src={otherParticipant.avatar}
                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-gray-600" />
            )}
          </div>
          {/* Online Status Badge */}
          {isOnline && (
            <div className="absolute right-0 bottom-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-green-500">
              <Circle className="h-2 w-2 fill-current text-green-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h3>
            <div className="flex items-center gap-2">
              {conversation.lastMessage && (
                <span className="ml-2 flex-shrink-0 text-xs text-gray-500">
                  {formatDistanceToNow(
                    new Date(conversation.lastMessage.createdAt),
                    { addSuffix: true, locale: tr }
                  )}
                </span>
              )}
              <ConversationContextMenu
                conversationId={conversation.id}
                isArchived={isArchived}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
                onDelete={onDelete}
              />
            </div>
          </div>

          {/* Context Badge */}
          {conversation.contextType && (
            <div className="mb-2 flex items-center gap-2">
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${contextColor}`}
              >
                <ContextIcon className="h-3 w-3" />
                <span>
                  {conversation.contextType === 'ORDER' && 'Sipariş'}
                  {conversation.contextType === 'PROPOSAL' && 'Teklif'}
                  {conversation.contextType === 'JOB' && 'İş İlanı'}
                  {conversation.contextType === 'PACKAGE' && 'Paket'}
                </span>
              </div>
              {conversation.contextData?.title && (
                <span className="truncate text-xs text-gray-600">
                  {conversation.contextData.title}
                </span>
              )}
            </div>
          )}

          {/* Last Message Preview */}
          {conversation.lastMessage && !isTyping && (
            <p className="line-clamp-2 text-sm text-gray-600">
              {conversation.lastMessage.content}
            </p>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <span className="font-medium">yazıyor</span>
              <span className="flex gap-1">
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"></span>
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"></span>
                <span className="inline-block h-1 w-1 animate-bounce rounded-full bg-blue-600"></span>
              </span>
            </div>
          )}

          {/* Unread Badge */}
          {conversation.unreadCount > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                {conversation.unreadCount}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
});
