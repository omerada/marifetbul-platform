// API utility types

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  interceptors?: ApiInterceptors;
}

export interface ApiInterceptors {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
}

export interface RequestInterceptor {
  onFulfilled?: (config: RequestConfig) => RequestConfig;
  onRejected?: (error: unknown) => Promise<unknown>;
}

export interface ResponseInterceptor {
  onFulfilled?: (response: ApiResponse) => ApiResponse;
  onRejected?: (error: unknown) => Promise<unknown>;
}

export interface RequestConfig {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  data?: unknown;
  timeout?: number;
  signal?: AbortSignal;
}

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  originalError?: Error;
}

// Use canonical PaginatedResponse from infrastructure/api
export type {
  PaginatedResponse,
  PaginationMeta,
} from '@/types/infrastructure/api';

export interface ApiEndpoint {
  path: string;
  method: HttpMethod;
  requiresAuth?: boolean;
  rateLimit?: RateLimit;
  cache?: CacheConfig;
  validation?: EndpointValidation;
}

export interface RateLimit {
  requests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface CacheConfig {
  ttl: number; // seconds
  key?: string;
  tags?: string[];
  invalidateOn?: string[];
}

export interface EndpointValidation {
  params?: ValidationSchema;
  query?: ValidationSchema;
  body?: ValidationSchema;
  headers?: ValidationSchema;
}

export interface ValidationSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    enum?: unknown[];
  };
}

export interface ApiClient {
  get<T>(url: string, config?: Partial<RequestConfig>): Promise<ApiResponse<T>>;
  post<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>>;
  put<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>>;
  patch<T>(
    url: string,
    data?: unknown,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>>;
  delete<T>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<ApiResponse<T>>;
}

export interface RequestQueue {
  add<T>(request: () => Promise<T>): Promise<T>;
  clear(): void;
  pause(): void;
  resume(): void;
  size(): number;
}

export interface ApiMetrics {
  endpoint: string;
  method: HttpMethod;
  responseTime: number;
  status: number;
  size: number;
  timestamp: string;
  error?: string;
}

export interface ApiHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  dependencies: DependencyHealth[];
}

export interface DependencyHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  error?: string;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeat?: boolean;
  heartbeatInterval?: number;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface UploadConfig {
  endpoint: string;
  method?: HttpMethod;
  multiple?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  chunkSize?: number;
  concurrent?: boolean;
  onProgress?: (progress: number) => void;
  onComplete?: (response: unknown) => void;
  onError?: (error: ApiError) => void;
}
