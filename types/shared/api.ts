// Shared API types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | number[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: FilterOptions;
  sort?: SortOptions;
}
