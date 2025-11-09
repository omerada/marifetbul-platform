'use client';

/**
 * MessageReactions Component
 *
 * Displays reactions on a message with:
 * - Grouped emoji counts
 * - User reaction highlighting
 * - Reaction picker on hover/click
 * - Toggle reactions
 *
 * @sprint Sprint 1 - Story 1.3
 */

'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Smile, Plus } from 'lucide-react';
import {
  toggleMessageReaction,
  type ReactionSummary,
} from '@/lib/api/messaging';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';
import type { MessageReaction } from '@/types/business/features/messaging';

interface MessageReactionsProps {
  /** Message ID */
  messageId: string;
  /** Simple reactions from message (will be converted to summary) */
  reactions?: MessageReaction[];
  /** Current user ID */
  currentUserId: string;
  /** Whether message is from current user */
  isOwnMessage: boolean;
}

// Popular emoji reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

/**
 * Convert simple reactions to summary format
 */
function convertToSummary(
  reactions: MessageReaction[],
  currentUserId: string
): ReactionSummary[] {
  const grouped = reactions.reduce(
    (acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          userIds: [],
          hasReacted: false,
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].userIds.push(reaction.userId);
      if (reaction.userId === currentUserId) {
        acc[reaction.emoji].hasReacted = true;
      }
      return acc;
    },
    {} as Record<string, ReactionSummary>
  );

  return Object.values(grouped);
}

/**
 * MessageReactions Component
 */
export function MessageReactions({
  messageId,
  reactions = [],
  currentUserId,
  isOwnMessage,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Convert simple reactions to summary format
  const reactionSummary = useMemo(
    () => convertToSummary(reactions, currentUserId),
    [reactions, currentUserId]
  );

  const [localReactions, setLocalReactions] =
    useState<ReactionSummary[]>(reactionSummary);

  // Update local reactions when props change
  useEffect(() => {
    setLocalReactions(convertToSummary(reactions, currentUserId));
  }, [reactions, currentUserId]);

  // Calculate if current user has reacted
  const hasUserReacted = useMemo(
    () => localReactions.some((r) => r.userIds.includes(currentUserId)),
    [localReactions, currentUserId]
  );

  // Handle reaction toggle
  const handleReactionToggle = useCallback(
    async (emoji: string) => {
      if (isUpdating) return;

      setIsUpdating(true);

      try {
        // Optimistic update
        const existingReaction = localReactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          // Check if user already reacted with this emoji
          const userReacted = existingReaction.userIds.includes(currentUserId);

          if (userReacted) {
            // Remove user's reaction
            setLocalReactions((prev) =>
              prev
                .map((r) =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count - 1,
                        userIds: r.userIds.filter((id) => id !== currentUserId),
                        hasReacted: false,
                      }
                    : r
                )
                .filter((r) => r.count > 0)
            );
          } else {
            // Add user's reaction
            setLocalReactions((prev) =>
              prev.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      userIds: [...r.userIds, currentUserId],
                      hasReacted: true,
                    }
                  : r
              )
            );
          }
        } else {
          // New reaction
          setLocalReactions((prev) => [
            ...prev,
            {
              emoji,
              count: 1,
              userIds: [currentUserId],
              hasReacted: true,
            },
          ]);
        }

        // API call
        await toggleMessageReaction(messageId, emoji);

        logger.info('MessageReactions', { messageId, emoji,  });

        setShowPicker(false);
      } catch (error) {
        logger.error('MessageReactions: Failed to toggle reaction', undefined, {
          error,
        });
        toast.error('Reaksiyon eklenemedi');

        // Revert optimistic update
        setLocalReactions(convertToSummary(reactions, currentUserId));
      } finally {
        setIsUpdating(false);
      }
    },
    [messageId, currentUserId, localReactions, reactions, isUpdating]
  );

  // Show reactions if any exist
  const hasReactions = localReactions.length > 0;

  return (
    <div
      className={`flex items-center gap-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      {/* Existing Reactions */}
      {hasReactions && (
        <div className="flex flex-wrap gap-1">
          {localReactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => handleReactionToggle(reaction.emoji)}
              disabled={isUpdating}
              className={`group relative flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all ${
                reaction.hasReacted
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              } ${isUpdating ? 'opacity-50' : ''}`}
              title={`${reaction.count} kişi ${reaction.emoji} ile tepki verdi`}
            >
              <span className="text-sm">{reaction.emoji}</span>
              <span className="font-medium">{reaction.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add Reaction Button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
            showPicker
              ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300'
          }`}
          title="Reaksiyon ekle"
        >
          {hasUserReacted ? (
            <Smile className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>

        {/* Reaction Picker Popup */}
        {showPicker && (
          <div
            className={`absolute bottom-full mb-2 ${
              isOwnMessage ? 'right-0' : 'left-0'
            } z-10 flex gap-1 rounded-lg bg-white p-2 shadow-lg ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReactionToggle(emoji)}
                disabled={isUpdating}
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all hover:scale-110 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isUpdating ? 'opacity-50' : ''
                }`}
                title={`${emoji} ile tepki ver`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
