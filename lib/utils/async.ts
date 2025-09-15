/**
 * Async utilities
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Debounce async function - returns a promise
 */
export function debounceAsync<
  T extends (...args: unknown[]) => Promise<unknown>,
>(func: T, wait: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let resolveCallback: ((value: ReturnType<T>) => void) | null = null;
  let rejectCallback: ((reason: Error) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        if (rejectCallback) {
          rejectCallback(new Error('Debounced'));
        }
      }

      resolveCallback = resolve;
      rejectCallback = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          if (resolveCallback) {
            resolveCallback(result as ReturnType<T>);
          }
        } catch (error) {
          if (rejectCallback) {
            rejectCallback(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      }, wait);
    });
  };
}

/**
 * Throttle function - limits execution to once per wait milliseconds
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= wait) {
      lastCallTime = now;
      func(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(
        () => {
          lastCallTime = Date.now();
          timeoutId = null;
          func(...args);
        },
        wait - (now - lastCallTime)
      );
    }
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry async operation with exponential backoff
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      lastError = errorObj;

      if (attempt === retries || !shouldRetry(errorObj)) {
        throw errorObj;
      }

      const waitTime = delay * Math.pow(backoffMultiplier, attempt);
      await sleep(waitTime);
    }
  }

  throw lastError;
}

/**
 * Create a promise that resolves/rejects after a timeout
 */
export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError: Error = new Error('Operation timed out')
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(timeoutError), ms);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Batch async operations with concurrency limit
 */
export async function batchAsync<T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    delay?: number;
  } = {}
): Promise<R[]> {
  const { batchSize = 5, delay = 0 } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => operation(item))
    );

    results.push(...batchResults);

    if (delay > 0 && i + batchSize < items.length) {
      await sleep(delay);
    }
  }

  return results;
}
