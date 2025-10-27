/**
 * TypingIndicator Component
 *
 * Displays an animated typing indicator for real-time chat.
 * Shows when another user is typing in a conversation.
 *
 * @sprint Sprint 1 - Story 1.3
 */

'use client';

import { memo } from 'react';

interface TypingIndicatorProps {
  /** Display name of user who is typing */
  userName?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * TypingIndicator Component
 *
 * @example
 * ```tsx
 * <TypingIndicator userName="Ahmet Yılmaz" size="md" />
 * ```
 */
export const TypingIndicator = memo(function TypingIndicator({
  userName,
  size = 'md',
  className = '',
}: TypingIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-base gap-2',
  };

  const dotSizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2',
  };

  return (
    <div
      className={`flex items-center text-blue-600 ${sizeClasses[size]} ${className}`}
    >
      {userName && <span className="font-medium">{userName}</span>}
      <span className={userName ? '' : 'font-medium'}>
        {userName ? 'yazıyor' : 'Yazıyor'}
      </span>
      <span className="flex gap-1">
        <span
          className={`inline-block animate-bounce rounded-full bg-blue-600 ${dotSizeClasses[size]} [animation-delay:-0.3s]`}
        ></span>
        <span
          className={`inline-block animate-bounce rounded-full bg-blue-600 ${dotSizeClasses[size]} [animation-delay:-0.15s]`}
        ></span>
        <span
          className={`inline-block animate-bounce rounded-full bg-blue-600 ${dotSizeClasses[size]}`}
        ></span>
      </span>
    </div>
  );
});
