/**
 * Retry Manager with Exponential Backoff
 * Handles automatic retries for failed API requests
 * - Exponential backoff with jitter
 * - Configurable retry conditions
 * - Circuit breaker pattern
 * - Request timeout handling
 */

interface RetryConfig {
  maxRetries?: number; // Maximum number of retry attempts (default: 3)
  initialDelay?: number; // Initial delay in ms (default: 1000)
  maxDelay?: number; // Maximum delay in ms (default: 30000)
  backoffMultiplier?: number; // Backoff multiplier (default: 2)
  jitter?: boolean; // Add random jitter (default: true)
  timeout?: number; // Request timeout in ms (default: 30000)
  shouldRetry?: (error: unknown) => boolean; // Custom retry condition
}

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export class RetryManager {
  private defaultConfig: Required<RetryConfig> = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
    timeout: 30000,
    shouldRetry: this.defaultShouldRetry,
  };

  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly circuitBreakerThreshold = 5; // Open circuit after 5 failures
  private readonly circuitBreakerTimeout = 60000; // Try again after 1 minute

  /**
   * Default retry condition - retry on network errors and 5xx status codes
   */
  private defaultShouldRetry(error: unknown): boolean {
    if (error instanceof Error) {
      // Network errors
      if (
        error.message.includes('fetch') ||
        error.message.includes('network') ||
        error.message.includes('timeout')
      ) {
        return true;
      }
    }

    // Check for HTTP error response
    if (typeof error === 'object' && error !== null) {
      const httpError = error as { status?: number };
      // Retry on 5xx server errors and 429 rate limit
      if (
        httpError.status &&
        (httpError.status >= 500 || httpError.status === 429)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  private calculateDelay(
    attempt: number,
    config: Required<RetryConfig>
  ): number {
    const exponentialDelay = Math.min(
      config.initialDelay * Math.pow(config.backoffMultiplier, attempt),
      config.maxDelay
    );

    if (!config.jitter) {
      return exponentialDelay;
    }

    // Add jitter (random value between 0 and exponentialDelay)
    return Math.random() * exponentialDelay;
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get circuit breaker state for endpoint
   */
  private getCircuitState(endpoint: string): CircuitBreakerState {
    const existing = this.circuitBreakers.get(endpoint);
    if (existing) return existing;

    const newState: CircuitBreakerState = {
      failures: 0,
      lastFailureTime: 0,
      state: 'closed',
    };
    this.circuitBreakers.set(endpoint, newState);
    return newState;
  }

  /**
   * Check if circuit breaker allows request
   */
  private canAttemptRequest(endpoint: string): boolean {
    const circuit = this.getCircuitState(endpoint);

    if (circuit.state === 'closed') {
      return true;
    }

    if (circuit.state === 'open') {
      const timeSinceFailure = Date.now() - circuit.lastFailureTime;
      if (timeSinceFailure > this.circuitBreakerTimeout) {
        circuit.state = 'half-open';
        return true;
      }
      return false;
    }

    // half-open - allow one request
    return true;
  }

  /**
   * Record request success
   */
  private recordSuccess(endpoint: string): void {
    const circuit = this.getCircuitState(endpoint);
    circuit.failures = 0;
    circuit.state = 'closed';
  }

  /**
   * Record request failure
   */
  private recordFailure(endpoint: string): void {
    const circuit = this.getCircuitState(endpoint);
    circuit.failures++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failures >= this.circuitBreakerThreshold) {
      circuit.state = 'open';
    }
  }

  /**
   * Wrap promise with timeout
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    endpoint: string,
    config?: Partial<RetryConfig>
  ): Promise<T> {
    const finalConfig = { ...this.defaultConfig, ...config };
    let lastError: unknown;

    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
      // Check circuit breaker
      if (!this.canAttemptRequest(endpoint)) {
        throw new Error(
          `Circuit breaker open for ${endpoint}. Too many failures.`
        );
      }

      try {
        // Execute with timeout
        const result = await this.withTimeout(fn(), finalConfig.timeout);
        this.recordSuccess(endpoint);
        return result;
      } catch (error) {
        lastError = error;
        this.recordFailure(endpoint);

        // Don't retry if it's the last attempt
        if (attempt === finalConfig.maxRetries) {
          break;
        }

        // Check if we should retry this error
        if (!finalConfig.shouldRetry(error)) {
          throw error;
        }

        // Calculate and apply delay
        const delay = this.calculateDelay(attempt, finalConfig);
        await this.sleep(delay);
      }
    }

    // All retries exhausted
    throw lastError;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats() {
    const stats: Record<string, CircuitBreakerState> = {};
    this.circuitBreakers.forEach((state, endpoint) => {
      stats[endpoint] = { ...state };
    });
    return stats;
  }

  /**
   * Reset circuit breaker for endpoint
   */
  resetCircuit(endpoint: string): void {
    this.circuitBreakers.delete(endpoint);
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuits(): void {
    this.circuitBreakers.clear();
  }
}

// Singleton instance
export const retryManager = new RetryManager();

// Retry configuration presets
export const RetryPresets = {
  FAST: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 5000,
    timeout: 10000,
  },
  STANDARD: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    timeout: 30000,
  },
  AGGRESSIVE: {
    maxRetries: 5,
    initialDelay: 2000,
    maxDelay: 60000,
    timeout: 60000,
  },
  NO_RETRY: {
    maxRetries: 0,
    initialDelay: 0,
    maxDelay: 0,
    timeout: 30000,
  },
} as const;

export default retryManager;
