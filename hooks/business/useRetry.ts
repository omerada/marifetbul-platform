/**
 * ================================================
 * RETRY HOOK
 * ================================================
 * Provides retry logic for failed operations
 * Handles exponential backoff and error recovery
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';

// ================================================
// TYPES
// ================================================

export interface UseRetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Initial delay in milliseconds
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Exponential backoff multiplier
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * Maximum delay in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelay?: number;

  /**
   * Function to determine if error is retryable
   */
  isRetryable?: (error: Error) => boolean;

  /**
   * Callback when retry starts
   */
  onRetry?: (attempt: number, error: Error) => void;

  /**
   * Callback when all retries fail
   */
  onMaxRetriesReached?: (error: Error) => void;
}

export interface UseRetryResult<T> {
  /**
   * Execute function with retry logic
   */
  execute: (fn: () => Promise<T>) => Promise<T>;

  /**
   * Whether operation is currently executing
   */
  isExecuting: boolean;

  /**
   * Current retry attempt (0 if not retrying)
   */
  currentAttempt: number;

  /**
   * Last error encountered
   */
  error: Error | null;

  /**
   * Reset retry state
   */
  reset: () => void;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  multiplier: number,
  maxDelay: number
): number {
  const delay = initialDelay * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Default retry check - retry on network errors
 */
function defaultIsRetryable(error: Error): boolean {
  // Retry on network errors
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return true;
  }

  // Retry on timeout errors
  if (error.message.includes('timeout')) {
    return true;
  }

  // Retry on 5xx server errors
  if ('status' in error && typeof error.status === 'number') {
    return error.status >= 500 && error.status < 600;
  }

  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ================================================
// HOOK
// ================================================

/**
 * Hook for retry logic with exponential backoff
 *
 * @example
 * ```tsx
 * const { execute, isExecuting, currentAttempt } = useRetry({
 *   maxAttempts: 3,
 *   initialDelay: 1000,
 * });
 *
 * const handleSubmit = async () => {
 *   try {
 *     const result = await execute(async () => {
 *       return await apiClient.post('/api/data', data);
 *     });
 *     console.log('Success:', result);
 *   } catch (error) {
 *     console.error('All retries failed:', error);
 *   }
 * };
 * ```
 */
export function useRetry<T = unknown>(
  options: UseRetryOptions = {}
): UseRetryResult<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 30000,
    isRetryable = defaultIsRetryable,
    onRetry,
    onMaxRetriesReached,
  } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setIsExecuting(false);
    setCurrentAttempt(0);
    setError(null);
  }, []);

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      setIsExecuting(true);
      setCurrentAttempt(0);
      setError(null);

      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
          setCurrentAttempt(attempt + 1);

          // Execute the function
          const result = await fn();

          // Success - reset and return
          setIsExecuting(false);
          setCurrentAttempt(0);
          setError(null);
          return result;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          setError(lastError);

          // Check if error is retryable
          if (!isRetryable(lastError)) {
            break;
          }

          // Check if we have more attempts
          if (attempt < maxAttempts - 1) {
            // Calculate delay
            const delay = calculateDelay(
              attempt,
              initialDelay,
              backoffMultiplier,
              maxDelay
            );

            // Notify retry
            onRetry?.(attempt + 1, lastError);

            // Wait before next attempt
            await sleep(delay);
          }
        }
      }

      // All retries failed
      setIsExecuting(false);
      const finalError = lastError || new Error('Operation failed');
      onMaxRetriesReached?.(finalError);

      throw finalError;
    },
    [
      maxAttempts,
      initialDelay,
      backoffMultiplier,
      maxDelay,
      isRetryable,
      onRetry,
      onMaxRetriesReached,
    ]
  );

  return {
    execute,
    isExecuting,
    currentAttempt,
    error,
    reset,
  };
}

export default useRetry;
