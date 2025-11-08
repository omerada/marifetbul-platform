// Infrastructure API index
export * from './client';

// Use canonical types from types/infrastructure/api
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from '@/types/infrastructure/api';

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
}

// Common API methods
export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// Hook patterns for API calls
export interface AsyncHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface MutationHookReturn<T, P = unknown> {
  mutate: (params: P) => Promise<T>;
  loading: boolean;
  error: string | null;
}

export interface PaginatedHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  total: number;
  currentPage: number;
}
