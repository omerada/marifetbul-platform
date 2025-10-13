export interface BaseServiceConfig {
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  baseUrl?: string;
}

export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}

// Aliases for backward compatibility
export type ServiceResult<T = unknown> = OperationResult<T>;
export type ServiceOptions = BaseServiceConfig;

export function createSuccessResult<T>(
  data: T,
  metadata?: Record<string, unknown>
): OperationResult<T> {
  return {
    success: true,
    data,
    metadata,
  };
}

export function createErrorResult<T = unknown>(
  error: string,
  metadata?: Record<string, unknown>
): OperationResult<T> {
  return {
    success: false,
    error,
    metadata,
  };
}

export abstract class BaseService {
  protected config: BaseServiceConfig;

  constructor(config: BaseServiceConfig = {}) {
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000,
      ...config,
    };
  }

  protected async executeOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<OperationResult<T>> {
    let lastError: Error | unknown;

    for (
      let attempt = 1;
      attempt <= (this.config.retryAttempts || 3);
      attempt++
    ) {
      try {
        const startTime = Date.now();
        const data = await Promise.race([
          operation(),
          this.createTimeoutPromise(),
        ]);
        const executionTime = Date.now() - startTime;

        return {
          success: true,
          data: data as T,
          metadata: {
            operationName,
            attempt,
            executionTime,
          },
        };
      } catch (error) {
        lastError = error;
        console.warn(
          `Operation ${operationName} failed (attempt ${attempt}):`,
          error
        );

        if (attempt < (this.config.retryAttempts || 3)) {
          await this.delay(this.config.retryDelay || 1000);
        }
      }
    }

    return {
      success: false,
      error: lastError instanceof Error ? lastError.message : 'Unknown error',
      metadata: {
        operationName,
        totalAttempts: this.config.retryAttempts,
      },
    };
  }

  protected async simulateApiCall<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    // Simulate network delay
    await this.delay(Math.random() * 500 + 200);

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) {
      throw new Error('Simulated network error');
    }

    // TODO: Replace with real HTTP request implementation
    // Suggested: Use fetch() with proper authentication and error handling
    // This should be a real HTTP client with axios or fetch
    // Mock response for testing - REMOVE THIS AFTER BACKEND INTEGRATION
    const mockResponse = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      endpoint,
      method,
      body,
      headers,
    };

    return mockResponse as T;
  }

  protected async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  protected logError(operation: string, error: unknown): void {
    console.error(`[${this.constructor.name}] ${operation} failed:`, error);
  }

  protected logInfo(operation: string, message: string): void {
    console.info(`[${this.constructor.name}] ${operation}: ${message}`);
  }

  protected validateRequired(
    data: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missingFields = requiredFields.filter(
      (field) =>
        data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  protected sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  protected isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
