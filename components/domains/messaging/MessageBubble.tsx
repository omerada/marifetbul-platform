/**
 * MessageBubble Component
 *
 * Individual message bubble with:
 * - Status indicators (sending, sent, delivered, read)
 * - Timestamp display
 * - User avatar
 * - Message reactions (future)
 * - Edit/delete options (future)
 *
 * @sprint Sprint 1 - Story 1.4
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CheckCheck, Clock, User } from 'lucide-react';
import type { Message } from '@/types/business/features/messaging';
import { MessageReactions } from './MessageReactions';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  currentUserId: string;
}

/**
 * Get status icon based on message status
 */
function getStatusIcon(message: Message, isOwnMessage: boolean) {
  if (!isOwnMessage) return null;

  // Check if message is being sent (temporary ID)
  if (message.id.startsWith('temp-')) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="h-3 w-3 animate-pulse" />
        <span>Gönderiliyor...</span>
      </div>
    );
  }

  // Read status
  if (message.isRead) {
    return (
      <div className="flex items-center gap-1 text-xs text-blue-500">
        <CheckCheck className="h-3.5 w-3.5" />
        <span>Okundu</span>
      </div>
    );
  }

  // Delivered status (not read yet)
  return (
    <div className="flex items-center gap-1 text-xs text-gray-400">
      <CheckCheck className="h-3.5 w-3.5" />
      <span>İletildi</span>
    </div>
  );
}

/**
 * MessageBubble Component
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  currentUserId,
}: MessageBubbleProps) {
  const statusIcon = getStatusIcon(message, isOwnMessage);

  return (
    <div
      className={`flex items-end gap-2 ${
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar ? (
            <Image
              src={message.sender.avatar}
              alt={message.sender.firstName || 'User'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex max-w-[70%] flex-col gap-1 ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900'
          } ${
            message.isEdited ? 'border-2 border-dashed border-yellow-400' : ''
          }`}
        >
          <p className="text-sm break-words whitespace-pre-wrap">
            {message.content}
          </p>
          {message.isEdited && (
            <p className="mt-1 text-xs opacity-70">(düzenlendi)</p>
          )}
        </div>

        {/* Timestamp and Status */}
        {(showTimestamp || statusIcon) && (
          <div
            className={`flex items-center gap-2 px-1 ${
              isOwnMessage ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {showTimestamp && (
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(message.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            )}
            {statusIcon}
          </div>
        )}

        {/* Message Reactions */}
        <MessageReactions
          messageId={message.id}
          reactions={message.reactions}
          currentUserId={currentUserId}
          isOwnMessage={isOwnMessage}
        />
      </div>
    </div>
  );
});
