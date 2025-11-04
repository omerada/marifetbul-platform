/**
 * MessageThread Component
 *
 * Message thread display with:
 * - Message list with virtualization
 * - Auto-scroll to bottom on new messages
 * - Typing indicator display
 * - Load more (pagination)
 * - Date separators
 *
 * @sprint Sprint 1 - Story 1.4
 */

'use client';

import { useEffect, useRef, memo } from 'react';
import { formatDate, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Message } from '@/types/business/features/messaging';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Loader2 } from 'lucide-react';

interface MessageThreadProps {
  /** Array of messages to display */
  messages: Message[];
  /** Current user ID to determine message ownership */
  currentUserId: string;
  /** Whether messages are loading */
  isLoading?: boolean;
  /** Whether to show typing indicator */
  isTyping?: boolean;
  /** Name of user who is typing */
  typingUserName?: string;
  /** Whether there are more messages to load */
  hasMore?: boolean;
  /** Callback to load more messages */
  onLoadMore?: () => void;
  /** Auto-scroll to bottom on new messages */
  autoScroll?: boolean;
}

/**
 * Get date separator text
 */
function getDateSeparator(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);

  if (isSameDay(messageDate, now)) {
    return 'Bugün';
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(messageDate, yesterday)) {
    return 'Dün';
  }

  return formatDate(messageDate, 'dd MMMM yyyy', { locale: tr });
}

/**
 * MessageThread Component
 */
export const MessageThread = memo(function MessageThread({
  messages,
  currentUserId,
  isLoading = false,
  isTyping = false,
  typingUserName,
  hasMore = false,
  onLoadMore,
  autoScroll = true,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Group messages by date
  const messagesByDate = messages.reduce(
    (acc, message) => {
      const date = new Date(message.createdAt);
      const dateKey = formatDate(date, 'yyyy-MM-dd');

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(message);

      return acc;
    },
    {} as Record<string, Message[]>
  );

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Mesajlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">Henüz mesaj yok</p>
          <p className="mt-1 text-xs">İlk mesajı göndererek başlayın</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-gray-50 p-4">
      {/* Load More Button */}
      {hasMore && (
        <div className="mb-4 text-center">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </span>
            ) : (
              'Daha fazla mesaj yükle'
            )}
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      <div className="space-y-4">
        {Object.entries(messagesByDate).map(([dateKey, dateMessages]) => (
          <div key={dateKey}>
            {/* Date Separator */}
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-white px-4 py-1 text-xs font-medium text-gray-500 shadow-sm">
                {getDateSeparator(new Date(dateMessages[0].createdAt))}
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3">
              {dateMessages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId;
                const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                const showAvatar =
                  !prevMessage || prevMessage.senderId !== message.senderId;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={isOwnMessage}
                    showAvatar={showAvatar}
                    showTimestamp={true}
                    currentUserId={currentUserId}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      {isTyping && (
        <div className="mt-4 flex items-start gap-2">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300">
            <div className="h-4 w-4 rounded-full bg-gray-500" />
          </div>
          <div className="mt-1">
            <TypingIndicator userName={typingUserName} size="sm" />
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
});
