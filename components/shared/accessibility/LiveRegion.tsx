'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * LiveRegion - ARIA live region for dynamic content announcements
 *
 * Announces dynamic content changes to screen readers without disrupting user flow.
 *
 * Usage:
 * ```tsx
 * <LiveRegion message="5 new packages found" />
 * <LiveRegion message="Error: Please try again" role="alert" />
 * ```
 *
 * @see https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19
 */

interface LiveRegionProps {
  /**
   * Message to announce to screen readers
   */
  message: string;

  /**
   * ARIA live region politeness level
   * - 'polite': Wait for natural pause (default)
   * - 'assertive': Interrupt immediately
   */
  politeness?: 'polite' | 'assertive';

  /**
   * ARIA role for the live region
   * - 'status': Status updates
   * - 'alert': Important messages
   * - 'log': Chat/log messages
   */
  role?: 'status' | 'alert' | 'log';

  /**
   * Whether to announce entire region when any part changes
   */
  atomic?: boolean;

  /**
   * Which changes to announce ('additions', 'removals', 'text', 'all')
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all';

  /**
   * Auto-clear message after delay (milliseconds)
   */
  clearAfter?: number;

  /**
   * Additional CSS classes
   */
  className?: string;
}

export function LiveRegion({
  message,
  politeness = 'polite',
  role = 'status',
  atomic = true,
  relevant = 'all',
  clearAfter,
  className,
}: LiveRegionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    setCurrentMessage(message);

    if (clearAfter && message) {
      const timer = setTimeout(() => {
        setCurrentMessage('');
      }, clearAfter);

      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
    >
      {currentMessage}
    </div>
  );
}

/**
 * useAnnounce - Hook for announcing messages to screen readers
 *
 * Usage:
 * ```tsx
 * const announce = useAnnounce();
 *
 * const handleSearch = () => {
 *   const results = searchPackages();
 *   announce(`Found ${results.length} packages`);
 * };
 * ```
 */
export function useAnnounce(politeness: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = useState('');

  const announce = (newMessage: string, clearAfter = 5000) => {
    setMessage(newMessage);

    if (clearAfter) {
      setTimeout(() => setMessage(''), clearAfter);
    }
  };

  const LiveRegionComponent = () => (
    <LiveRegion message={message} politeness={politeness} clearAfter={5000} />
  );

  return { announce, LiveRegion: LiveRegionComponent };
}

/**
 * StatusMessage - Visible status message with screen reader announcement
 *
 * Shows message visually AND announces to screen readers.
 *
 * Usage:
 * ```tsx
 * <StatusMessage type="success" message="Package saved successfully" />
 * <StatusMessage type="error" message="Failed to load packages" />
 * ```
 */
interface StatusMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  autoClose?: number;
  className?: string;
}

export function StatusMessage({
  type,
  message,
  onClose,
  autoClose = 5000,
  className,
}: StatusMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'rounded-md border px-4 py-3',
          styles[type],
          'flex items-center justify-between',
          className
        )}
      >
        <span>{message}</span>
        {onClose && (
          <button
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            aria-label="Close message"
            className="ml-4 text-current opacity-70 hover:opacity-100"
          >
            ×
          </button>
        )}
      </div>
      <LiveRegion message={message} role="status" clearAfter={autoClose} />
    </>
  );
}

export default LiveRegion;
