/**
 * Enhanced API Response Types
 * Provides comprehensive typing for API responses with better error handling and metadata
 */

// Base API Response Structure
export interface BaseApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  requestId: string;
  version: string;
}

// Enhanced API Response with Metadata
export interface EnhancedApiResponse<T = unknown> extends BaseApiResponse<T> {
  meta: {
    requestDuration: number;
    cacheHit: boolean;
    rateLimit: {
      remaining: number;
      resetAt: string;
      limit: number;
    };
    server: {
      region: string;
      instanceId: string;
    };
  };
}

// Paginated API Response
export interface PaginatedApiResponse<T = unknown> extends BaseApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    cursor?: {
      next?: string;
      prev?: string;
    };
  };
  meta: {
    filters?: Record<string, unknown>;
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
    aggregations?: Record<string, {
      count: number;
      sum?: number;
      avg?: number;
      min?: number;
      max?: number;
    }>;
  };
}

// Error API Response
export interface ErrorApiResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field?: string;
    trace?: string;
  };
  timestamp: string;
  requestId: string;
  version: string;
  meta?: {
    retryable: boolean;
    retryAfter?: number;
    documentation?: string;
  };
}

// Validation Error Response
export interface ValidationErrorResponse extends ErrorApiResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      fields: Array<{
        field: string;
        code: string;
        message: string;
        value?: unknown;
        constraints?: Record<string, string>;
      }>;
    };
  };
}

// Authentication Error Response
export interface AuthErrorResponse extends ErrorApiResponse {
  error: {
    code: 'AUTHENTICATION_ERROR' | 'AUTHORIZATION_ERROR' | 'TOKEN_EXPIRED';
    message: string;
    details?: {
      realm?: string;
      scope?: string;
      redirectUrl?: string;
    };
  };
}

// Rate Limit Error Response
export interface RateLimitErrorResponse extends ErrorApiResponse {
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
    details: {
      limit: number;
      remaining: number;
      resetAt: string;
      retryAfter: number;
    };
  };
}

// Business Logic Error Response
export interface BusinessLogicErrorResponse extends ErrorApiResponse {
  error: {
    code: string;
    message: string;
    details: {
      operation: string;
      resource?: string;
      constraints?: string[];
      suggestions?: string[];
    };
  };
}

// File Upload Response
export interface FileUploadResponse extends BaseApiResponse<{
  fileId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: Record<string, unknown>;
}> {
  meta: {
    processingStatus: 'completed' | 'processing' | 'failed';
    virusScanResult?: 'clean' | 'infected' | 'scanning';
    compressionApplied: boolean;
    originalSize?: number;
  };
}

// Batch Operation Response
export interface BatchOperationResponse<T = unknown> extends BaseApiResponse<{
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: {
      code: string;
      message: string;
    };
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
}> {
  // Additional batch-specific metadata
  meta?: {
    batchId: string;
    processedAt: string;
  };
}

// Search Response with Facets
export interface SearchResponse<T = unknown> extends PaginatedApiResponse<T> {
  meta: {
    query: string;
    searchTime: number;
    totalHits: number;
    maxScore: number;
    facets: Record<string, Array<{
      value: string;
      count: number;
      selected?: boolean;
    }>>;
    suggestions?: {
      text: string[];
      spelling: string[];
      completion: string[];
    };
    filters: Record<string, unknown>;
    sort: {
      field: string;
      order: 'asc' | 'desc';
    };
  };
}

// Analytics Response
export interface AnalyticsResponse<T = Record<string, unknown>> extends BaseApiResponse<T> {
  meta: {
    period: {
      start: string;
      end: string;
      interval: 'hour' | 'day' | 'week' | 'month' | 'year';
    };
    metrics: string[];
    dimensions: string[];
    filters: Record<string, unknown>;
    timezone: string;
    currency?: string;
  };
}

// Health Check Response
export interface HealthCheckResponse extends BaseApiResponse<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: string;
    details?: Record<string, unknown>;
  }>;
  uptime: number;
  version: string;
  environment: string;
}> {
  // Health check specific metadata
  meta?: {
    checkDuration: number;
    checkId: string;
  };
}

// WebSocket Response Types
export interface WebSocketResponse<T = unknown> {
  type: 'message' | 'notification' | 'status' | 'error';
  event: string;
  data: T;
  timestamp: string;
  id: string;
  channel?: string;
}

export interface WebSocketErrorResponse extends WebSocketResponse<{
  code: string;
  message: string;
  details?: Record<string, unknown>;
}> {
  type: 'error';
}

// Streaming Response Types
export interface StreamingResponse<T = unknown> {
  chunk: T;
  metadata: {
    sequence: number;
    isLast: boolean;
    totalSize?: number;
    chunkSize: number;
    mimeType?: string;
  };
  timestamp: string;
}

// Export Response Type Utilities
export type ApiResponse<T = unknown> = 
  | BaseApiResponse<T> 
  | ErrorApiResponse;

export type EnhancedResponse<T = unknown> = 
  | EnhancedApiResponse<T> 
  | ErrorApiResponse;

export type PaginatedResponse<T = unknown> = 
  | PaginatedApiResponse<T> 
  | ErrorApiResponse;

// Type Guards for API Responses
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is BaseApiResponse<T> => 
  response.success === true;

export const isErrorResponse = (response: ApiResponse): response is ErrorApiResponse => 
  response.success === false;

export const isValidationErrorResponse = (response: ErrorApiResponse): response is ValidationErrorResponse => 
  response.error.code === 'VALIDATION_ERROR';

export const isAuthErrorResponse = (response: ErrorApiResponse): response is AuthErrorResponse => 
  response.error.code.includes('AUTH') || response.error.code === 'TOKEN_EXPIRED';

export const isRateLimitErrorResponse = (response: ErrorApiResponse): response is RateLimitErrorResponse => 
  response.error.code === 'RATE_LIMIT_EXCEEDED';

export const isBusinessLogicErrorResponse = (response: ErrorApiResponse): response is BusinessLogicErrorResponse => 
  !['VALIDATION_ERROR', 'AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR', 'TOKEN_EXPIRED', 'RATE_LIMIT_EXCEEDED'].includes(response.error.code);

export const isPaginatedResponse = <T>(response: ApiResponse<T[] | T>): response is PaginatedApiResponse<T> => 
  isSuccessResponse(response) && 'pagination' in response;

export const isEnhancedResponse = <T>(response: ApiResponse<T>): response is EnhancedApiResponse<T> => 
  isSuccessResponse(response) && 'meta' in response && 
  typeof response.meta === 'object' && response.meta !== null &&
  'requestDuration' in response.meta;

// Response Transformation Utilities
export const extractResponseData = <T>(response: ApiResponse<T>): T => {
  if (isSuccessResponse(response)) {
    return response.data;
  }
  throw new Error(`API Error: ${response.error.message}`);
};

export const extractPaginatedData = <T>(response: PaginatedResponse<T>): {
  data: T[];
  pagination: PaginatedApiResponse<T>['pagination'];
} => {
  if (isPaginatedResponse(response)) {
    return {
      data: response.data,
      pagination: response.pagination,
    };
  }
  throw new Error('Response is not a paginated response');
};

export const createSuccessResponse = <T>(
  data: T,
  options?: {
    message?: string;
    requestId?: string;
    version?: string;
    meta?: Record<string, unknown>;
  }
): BaseApiResponse<T> => ({
  data,
  success: true,
  message: options?.message,
  timestamp: new Date().toISOString(),
  requestId: options?.requestId || crypto.randomUUID(),
  version: options?.version || '1.0.0',
  ...options?.meta,
});

export const createErrorResponse = (
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    field?: string;
  },
  options?: {
    requestId?: string;
    version?: string;
    retryable?: boolean;
  }
): ErrorApiResponse => ({
  success: false,
  error,
  timestamp: new Date().toISOString(),
  requestId: options?.requestId || crypto.randomUUID(),
  version: options?.version || '1.0.0',
  ...(options?.retryable !== undefined && {
    meta: {
      retryable: options.retryable,
    },
  }),
});

export const createPaginatedResponse = <T>(
  data: T[],
  pagination: PaginatedApiResponse<T>['pagination'],
  options?: {
    message?: string;
    requestId?: string;
    version?: string;
    meta?: PaginatedApiResponse<T>['meta'];
  }
): PaginatedApiResponse<T> => ({
  data,
  success: true,
  message: options?.message,
  timestamp: new Date().toISOString(),
  requestId: options?.requestId || crypto.randomUUID(),
  version: options?.version || '1.0.0',
  pagination,
  meta: options?.meta || {},
});

// API Response Validation Schema Types
export interface ResponseValidationSchema {
  data: {
    type: 'object' | 'array' | 'string' | 'number' | 'boolean';
    properties?: Record<string, {
      type: string;
      required?: boolean;
      format?: string;
      enum?: unknown[];
    }>;
    items?: {
      type: string;
      properties?: Record<string, unknown>;
    };
  };
  meta?: {
    type: 'object';
    properties: Record<string, {
      type: string;
      required?: boolean;
    }>;
  };
}
