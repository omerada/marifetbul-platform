// ================================================
// UNIFIED ASYNC UTILITIES
// ================================================
// Enhanced async utilities with comprehensive error handling and performance optimization

// ================================================
// DEBOUNCE UTILITIES
// ================================================

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  }) as T & { cancel: () => void };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

export function debounceAsync<
  T extends (...args: unknown[]) => Promise<unknown>,
>(func: T, delay: number): T & { cancel: () => void } {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<ReturnType<T>>((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result as ReturnType<T>);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeoutId = null;
          }
        }, delay);
      });
    }

    return pendingPromise;
  }) as T & { cancel: () => void };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    pendingPromise = null;
  };

  return debouncedFunction;
}

// ================================================
// THROTTLE UTILITIES
// ================================================

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let isThrottled = false;
  let timeoutId: NodeJS.Timeout | null = null;

  const throttledFunction = ((...args: Parameters<T>) => {
    if (!isThrottled) {
      func(...args);
      isThrottled = true;
      timeoutId = setTimeout(() => {
        isThrottled = false;
        timeoutId = null;
      }, delay);
    }
  }) as T & { cancel: () => void };

  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isThrottled = false;
  };

  return throttledFunction;
}

export function throttleAsync<
  T extends (...args: unknown[]) => Promise<unknown>,
>(func: T, delay: number): T & { cancel: () => void } {
  let isThrottled = false;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastPromise: Promise<ReturnType<T>> | null = null;

  const throttledFunction = ((...args: Parameters<T>) => {
    if (!isThrottled) {
      isThrottled = true;
      lastPromise = func(...args) as Promise<ReturnType<T>>;

      timeoutId = setTimeout(() => {
        isThrottled = false;
        timeoutId = null;
      }, delay);

      return lastPromise;
    }

    return lastPromise || Promise.resolve(undefined as ReturnType<T>);
  }) as T & { cancel: () => void };

  throttledFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    isThrottled = false;
    lastPromise = null;
  };

  return throttledFunction;
}

// ================================================
// RETRY UTILITIES
// ================================================

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  jitter?: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = true,
    retryCondition = () => true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      let delay = baseDelay * Math.pow(backoffMultiplier, attempt - 1);
      delay = Math.min(delay, maxDelay);

      // Add jitter to prevent thundering herd
      if (jitter) {
        delay = delay * (0.5 + Math.random() * 0.5);
      }

      onRetry?.(lastError, attempt);
      await sleep(delay);
    }
  }

  throw lastError!;
}

export async function retryWithCircuitBreaker<T>(
  fn: () => Promise<T>,
  options: RetryOptions & {
    circuitBreakerThreshold?: number;
    circuitBreakerTimeout?: number;
  } = {}
): Promise<T> {
  // Simple circuit breaker implementation
  const {
    circuitBreakerThreshold = 5,
    circuitBreakerTimeout = 60000,
    ...retryOptions
  } = options;

  // In a real implementation, this would be stored globally or in a service
  const circuitState = {
    failures: 0,
    lastFailure: 0,
    isOpen: false,
  };

  if (circuitState.isOpen) {
    const timeSinceLastFailure = Date.now() - circuitState.lastFailure;
    if (timeSinceLastFailure < circuitBreakerTimeout) {
      throw new Error('Circuit breaker is open');
    } else {
      // Reset circuit breaker
      circuitState.isOpen = false;
      circuitState.failures = 0;
    }
  }

  try {
    const result = await retry(fn, retryOptions);
    // Reset on success
    circuitState.failures = 0;
    return result;
  } catch (error) {
    circuitState.failures++;
    circuitState.lastFailure = Date.now();

    if (circuitState.failures >= circuitBreakerThreshold) {
      circuitState.isOpen = true;
    }

    throw error;
  }
}

// ================================================
// TIMEOUT UTILITIES
// ================================================

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

export function withAbortController<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs?: number
): Promise<T> & { abort: () => void } {
  const controller = new AbortController();

  let promise = fn(controller.signal);

  if (timeoutMs) {
    promise = withTimeout(
      promise,
      timeoutMs,
      'Operation aborted due to timeout'
    );
  }

  const abortablePromise = promise as Promise<T> & { abort: () => void };
  abortablePromise.abort = () => controller.abort();

  return abortablePromise;
}

// ================================================
// BATCH PROCESSING UTILITIES
// ================================================

export async function batchAsync<T, R>(
  items: T[],
  batchSize: number,
  fn: (batch: T[]) => Promise<R[]>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 1, onProgress } = options;
  const results: R[] = [];
  const batches: T[][] = [];

  // Create batches
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  if (concurrency === 1) {
    // Sequential processing
    for (let i = 0; i < batches.length; i++) {
      const batchResults = await fn(batches[i]);
      results.push(...batchResults);
      onProgress?.(i + 1, batches.length);
    }
  } else {
    // Concurrent processing
    const semaphore = new Semaphore(concurrency);
    const promises = batches.map(async (batch, index) => {
      await semaphore.acquire();
      try {
        const batchResults = await fn(batch);
        onProgress?.(index + 1, batches.length);
        return batchResults;
      } finally {
        semaphore.release();
      }
    });

    const allResults = await Promise.all(promises);
    allResults.forEach((batchResults) => results.push(...batchResults));
  }

  return results;
}

export async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const semaphore = new Semaphore(limit);

  const promises = tasks.map(async (task) => {
    await semaphore.acquire();
    try {
      return await task();
    } finally {
      semaphore.release();
    }
  });

  return Promise.all(promises);
}

// ================================================
// UTILITY CLASSES
// ================================================

class Semaphore {
  private permits: number;
  private waitQueue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    this.permits++;
    if (this.waitQueue.length > 0) {
      const resolve = this.waitQueue.shift()!;
      this.permits--;
      resolve();
    }
  }
}

// ================================================
// PROMISE UTILITIES
// ================================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function delay(ms: number): Promise<void> {
  return sleep(ms);
}

export function promisify<T extends unknown[], R>(
  fn: (...args: [...T, (error: Error | null, result?: R) => void]) => void
): (...args: T) => Promise<R> {
  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      fn(...args, (error: Error | null, result?: R) => {
        if (error) {
          reject(error);
        } else {
          resolve(result as R);
        }
      });
    });
  };
}

export async function promiseAllSettled<T>(
  promises: Promise<T>[]
): Promise<
  Array<
    { status: 'fulfilled'; value: T } | { status: 'rejected'; reason: unknown }
  >
> {
  return Promise.allSettled(promises);
}

export async function promiseMap<T, R>(
  items: T[],
  mapper: (item: T, index: number) => Promise<R>,
  concurrency = Infinity
): Promise<R[]> {
  if (concurrency === Infinity) {
    return Promise.all(items.map(mapper));
  }

  return parallelLimit(
    items.map((item, index) => () => mapper(item, index)),
    concurrency
  );
}

// ================================================
// ERROR HANDLING UTILITIES
// ================================================

export async function catchAsync<T>(
  promise: Promise<T>
): Promise<[Error | null, T | null]> {
  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    return [error as Error, null];
  }
}

export function asyncTryCatch<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<[Error | null, R | null]> {
  return async (...args: T) => {
    try {
      const result = await fn(...args);
      return [null, result];
    } catch (error) {
      return [error as Error, null];
    }
  };
}

// ================================================
// CACHING UTILITIES
// ================================================

export function memoizeAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    maxSize?: number;
    ttl?: number;
    keyGenerator?: (...args: T) => string;
  } = {}
): (...args: T) => Promise<R> {
  const {
    maxSize = 100,
    ttl = Infinity,
    keyGenerator = (...args) => JSON.stringify(args),
  } = options;

  const cache = new Map<string, { value: Promise<R>; timestamp: number }>();

  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }

    // Clean up expired entries
    if (cache.size >= maxSize) {
      const now = Date.now();
      for (const [cacheKey, entry] of cache.entries()) {
        if (now - entry.timestamp >= ttl) {
          cache.delete(cacheKey);
        }
      }

      // If still at capacity, remove oldest entry
      if (cache.size >= maxSize) {
        const entries = Array.from(cache.entries());
        if (entries.length > 0) {
          const [firstKey] = entries[0];
          cache.delete(firstKey);
        }
      }
    }

    const promise = fn(...args);
    cache.set(key, { value: promise, timestamp: Date.now() });

    return promise;
  };
}

// ================================================
// DEFAULT EXPORT
// ================================================

export const AsyncUtils = {
  // Debounce utilities
  debounce,
  debounceAsync,

  // Throttle utilities
  throttle,
  throttleAsync,

  // Retry utilities
  retry,
  retryWithCircuitBreaker,

  // Timeout utilities
  withTimeout,
  withAbortController,

  // Batch processing
  batchAsync,
  parallelLimit,

  // Promise utilities
  sleep,
  delay,
  promisify,
  promiseAllSettled,
  promiseMap,

  // Error handling
  catchAsync,
  asyncTryCatch,

  // Caching
  memoizeAsync,
};
