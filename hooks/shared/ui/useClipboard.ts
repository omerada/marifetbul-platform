/**
 * ================================================
 * USE CLIPBOARD HOOK
 * ================================================
 * Reusable clipboard functionality for copy-to-clipboard features
 *
 * Features:
 * - Copy text to clipboard with fallback for older browsers
 * - Auto-reset copied state after timeout
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Duplicate Cleanup
 */

import { useState, useCallback } from 'react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface UseClipboardOptions {
  /**
   * Duration (ms) to show "copied" state
   * @default 2000
   */
  timeout?: number;

  /**
   * Callback on successful copy
   */
  onSuccess?: () => void;

  /**
   * Callback on copy error
   */
  onError?: (error: Error) => void;
}

interface UseClipboardReturn {
  /**
   * Whether text was recently copied
   */
  isCopied: boolean;

  /**
   * Copy text to clipboard
   */
  copy: (text: string) => Promise<boolean>;

  /**
   * Manually reset copied state
   */
  reset: () => void;
}

// ================================================
// HOOK
// ================================================

/**
 * Hook for clipboard operations
 *
 * @example
 * ```tsx
 * const { copy, isCopied } = useClipboard({
 *   onSuccess: () => toast.success('Copied!'),
 * });
 *
 * <button onClick={() => copy(text)}>
 *   {isCopied ? 'Copied!' : 'Copy'}
 * </button>
 * ```
 */
export function useClipboard(
  options: UseClipboardOptions = {}
): UseClipboardReturn {
  const { timeout = 2000, onSuccess, onError } = options;
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        // Modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          setIsCopied(true);
          onSuccess?.();

          // Auto-reset after timeout
          setTimeout(() => setIsCopied(false), timeout);

          return true;
        }

        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand('copy');
        textArea.remove();

        if (success) {
          setIsCopied(true);
          onSuccess?.();
          setTimeout(() => setIsCopied(false), timeout);
          return true;
        }

        throw new Error('execCommand copy failed');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Copy failed');
        logger.error('Clipboard copy failed', err instanceof Error ? err : new Error(String(err)));
        onError?.(err);
        return false;
      }
    },
    [timeout, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setIsCopied(false);
  }, []);

  return { isCopied, copy, reset };
}
