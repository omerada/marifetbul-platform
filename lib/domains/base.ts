import logger from '@/lib/infrastructure/monitoring/logger';

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
        logger.warn(
          `Operation ${operationName} failed (attempt ${attempt})`,
          error instanceof Error ? error : new Error(String(error))
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

  protected async executeWithRetry<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: unknown;
      headers?: Record<string, string>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    for (
      let attempt = 1;
      attempt <= (this.config.retryAttempts || 3);
      attempt++
    ) {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(
            `HTTP Error: ${response.status} ${response.statusText}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        this.logError(`Request to ${endpoint}`, error);

        if (attempt < (this.config.retryAttempts || 3)) {
          await this.delay(this.config.retryDelay || 1000);
        } else {
          throw error;
        }
      }
    }

    throw new Error(`Failed after ${this.config.retryAttempts} attempts`);
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
    logger.error(
      `[${this.constructor.name}] ${operation} failed`,
      error instanceof Error ? error : new Error(String(error))
    );
  }

  protected logInfo(operation: string, message: string): void {
    logger.info(`[${this.constructor.name}] ${operation}: ${message}`);
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
