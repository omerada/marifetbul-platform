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
import { User } from 'lucide-react';
import type { Message } from '@/types/business/features/messaging';
import { MessageReactions } from './MessageReactions';
import { MessageAttachment } from './MessageAttachment';
import {
  MessageStatusIndicator,
  getMessageStatus,
} from './MessageStatusIndicator';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  showStatus?: boolean; // NEW: Show delivery/read status
  currentUserId: string;
}

/**
 * MessageBubble Component
 */
export const MessageBubble = memo(function MessageBubble({
  message,
  isOwnMessage,
  showAvatar = true,
  showTimestamp = true,
  showStatus = true,
  currentUserId,
}: MessageBubbleProps) {
  const messageStatus = getMessageStatus(message);

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
          {/* Message Text */}
          {message.content && (
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`space-y-2 ${message.content ? 'mt-2' : ''}`}>
              {message.attachments.map((attachment) => (
                <MessageAttachment
                  key={attachment.id}
                  attachment={attachment}
                  isOwnMessage={isOwnMessage}
                />
              ))}
            </div>
          )}

          {/* Edited Label */}
          {message.isEdited && (
            <p className="mt-1 text-xs opacity-70">(düzenlendi)</p>
          )}
        </div>

        {/* Timestamp and Status */}
        {(showTimestamp || (showStatus && isOwnMessage)) && (
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

            {/* Status indicator for own messages */}
            {showStatus && isOwnMessage && (
              <MessageStatusIndicator
                status={messageStatus}
                timestamp={message.sentAt}
                showText={true}
                compact={false}
              />
            )}
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
