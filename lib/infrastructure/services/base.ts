/**
 * Base Service Class
 * Provides common functionality for all domain services
 * Handles error management, logging, and validation
 */
import { logger } from '@/lib/shared/utils/logger';

export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Standard error handling for service operations
   */
  protected handleError(operation: string, error: unknown): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const serviceError = new ServiceError(
      `${this.serviceName}.${operation}`,
      errorMessage,
      error
    );

    // Log error for monitoring
    logger.error(`[${this.serviceName}] ${operation} failed`, serviceError);

    throw serviceError;
  }

  /**
   * Execute operation with standard error handling and logging
   */
  protected async executeOperation<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      logger.debug(`[${this.serviceName}] Starting ${operation}`);
      const result = await fn();
      logger.debug(`[${this.serviceName}] Completed ${operation}`);
      return result;
    } catch (error) {
      this.handleError(operation, error);
    }
  }

  /**
   * Validate input data using Zod schema
   */
  protected validateInput<T>(
    operation: string,
    data: unknown,
    schema: { parse: (data: unknown) => T }
  ): T {
    try {
      return schema.parse(data);
    } catch (error) {
      this.handleError(`${operation}:validation`, error);
    }
  }
}

/**
 * Custom Service Error Class
 * Provides structured error information for service layer
 */
export class ServiceError extends Error {
  constructor(
    public readonly service: string,
    message: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ServiceError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      service: this.service,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Service Result Type
 * Standardizes return types for service operations
 */
export type ServiceResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Helper function to create success result
 */
export const createSuccessResult = <T>(data: T): ServiceResult<T> => ({
  success: true,
  data,
});

/**
 * Helper function to create error result
 */
export const createErrorResult = <T>(
  error: string,
  code?: string
): ServiceResult<T> => ({
  success: false,
  error,
  code,
});

/**
 * Pagination options for service operations
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated result type
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Cache configuration for service operations
 */
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
  enabled?: boolean; // Enable/disable caching
}

/**
 * Service operation context
 * Provides additional context for service operations
 */
export interface ServiceContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  traceId?: string;
}

/**
 * Service operation options
 */
export interface ServiceOptions {
  context?: ServiceContext;
  cache?: CacheConfig;
  timeout?: number;
  retries?: number;
}
