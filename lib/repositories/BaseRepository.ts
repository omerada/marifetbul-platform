// ================================================
// REPOSITORY BASE CLASS
// ================================================
// Abstract base class for all repository implementations
// Provides standardized CRUD operations and caching

import { unifiedApiClient, ApiResponse, RequestConfig } from '../api/UnifiedApiClient';

export interface Repository<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  findAll(params?: Record<string, string | number | boolean>): Promise<T[]>;
  findById(id: string | number): Promise<T>;
  create(data: CreateData): Promise<T>;
  update(id: string | number, data: UpdateData): Promise<T>;
  delete(id: string | number): Promise<void>;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchOptions {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string | number | boolean>;
}

export abstract class BaseRepository<T, CreateData = Partial<T>, UpdateData = Partial<T>> 
  implements Repository<T, CreateData, UpdateData> {
  
  protected abstract readonly baseEndpoint: string;
  protected readonly cachePrefix: string;

  constructor(cachePrefix: string) {
    this.cachePrefix = cachePrefix;
  }

  // ================================================
  // CORE CRUD OPERATIONS
  // ================================================

  async findAll(params?: Record<string, string | number | boolean>): Promise<T[]> {
    const response = await unifiedApiClient.get<T[]>(this.baseEndpoint, params);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch items');
    }
    return response.data;
  }

  async findById(id: string | number): Promise<T> {
    const response = await unifiedApiClient.get<T>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch item');
    }
    return response.data;
  }

  async create(data: CreateData): Promise<T> {
    const response = await unifiedApiClient.post<T>(this.baseEndpoint, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to create item');
    }
    this.invalidateCache();
    return response.data;
  }

  async update(id: string | number, data: UpdateData): Promise<T> {
    const response = await unifiedApiClient.put<T>(`${this.baseEndpoint}/${id}`, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to update item');
    }
    this.invalidateCache();
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    const response = await unifiedApiClient.delete(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete item');
    }
    this.invalidateCache();
  }

  // ================================================
  // PAGINATION SUPPORT
  // ================================================

  async findPaginated(options: SearchOptions = {}): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, filters, ...params } = options;
    
    const queryParams = { 
      page, 
      limit, 
      ...params, 
      ...(filters ? Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [`filter_${key}`, String(value)])
      ) : {})
    };
    
    const response = await unifiedApiClient.get<PaginatedResult<T>>(
      `${this.baseEndpoint}/paginated`,
      queryParams
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch paginated items');
    }
    
    return response.data;
  }

  // ================================================
  // SEARCH FUNCTIONALITY
  // ================================================

  async search(options: SearchOptions): Promise<T[]> {
    const { filters, ...params } = options;
    
    const queryParams = { 
      ...params, 
      ...(filters ? Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [`filter_${key}`, String(value)])
      ) : {})
    };
    
    const response = await unifiedApiClient.get<T[]>(
      `${this.baseEndpoint}/search`,
      queryParams
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to search items');
    }
    
    return response.data;
  }

  async searchPaginated(options: SearchOptions): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, filters, ...params } = options;
    
    const queryParams = { 
      page, 
      limit, 
      ...params, 
      ...(filters ? Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [`filter_${key}`, String(value)])
      ) : {})
    };
    
    const response = await unifiedApiClient.get<PaginatedResult<T>>(
      `${this.baseEndpoint}/search/paginated`,
      queryParams
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to search paginated items');
    }
    
    return response.data;
  }

  // ================================================
  // BULK OPERATIONS
  // ================================================

  async bulkCreate(data: CreateData[]): Promise<T[]> {
    const response = await unifiedApiClient.post<T[]>(`${this.baseEndpoint}/bulk`, data);
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk create items');
    }
    this.invalidateCache();
    return response.data;
  }

  async bulkUpdate(updates: Array<{ id: string | number; data: UpdateData }>): Promise<T[]> {
    const response = await unifiedApiClient.put<T[]>(`${this.baseEndpoint}/bulk`, updates);
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk update items');
    }
    this.invalidateCache();
    return response.data;
  }

  async bulkDelete(ids: Array<string | number>): Promise<void> {
    const response = await unifiedApiClient.delete(`${this.baseEndpoint}/bulk`, {
      body: JSON.stringify({ ids }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.success) {
      throw new Error(response.message || 'Failed to bulk delete items');
    }
    this.invalidateCache();
  }

  // ================================================
  // CACHE MANAGEMENT
  // ================================================

  protected invalidateCache(): void {
    // Clear all cache entries for this repository
    unifiedApiClient.clearCache();
  }

  protected getCacheKey(suffix: string): string {
    return `${this.cachePrefix}:${suffix}`;
  }

  // ================================================
  // UTILITY METHODS
  // ================================================

  async exists(id: string | number): Promise<boolean> {
    try {
      await this.findById(id);
      return true;
    } catch {
      return false;
    }
  }

  async count(filters?: Record<string, string | number | boolean>): Promise<number> {
    const response = await unifiedApiClient.get<{ count: number }>(
      `${this.baseEndpoint}/count`,
      filters
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to count items');
    }
    
    return response.data.count;
  }

  // ================================================
  // ADVANCED QUERIES
  // ================================================

  protected async customQuery<R>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: unknown,
    config?: RequestConfig
  ): Promise<R> {
    const fullEndpoint = endpoint.startsWith('/') ? endpoint : `${this.baseEndpoint}/${endpoint}`;
    
    let response: ApiResponse<R>;
    
    switch (method) {
      case 'GET':
        response = await unifiedApiClient.get<R>(fullEndpoint, data as Record<string, string | number | boolean>);
        break;
      case 'POST':
        response = await unifiedApiClient.post<R>(fullEndpoint, data, config);
        break;
      case 'PUT':
        response = await unifiedApiClient.put<R>(fullEndpoint, data, config);
        break;
      case 'PATCH':
        response = await unifiedApiClient.patch<R>(fullEndpoint, data, config);
        break;
      case 'DELETE':
        response = await unifiedApiClient.delete<R>(fullEndpoint, config);
        break;
    }
    
    if (!response.success) {
      throw new Error(response.message || 'Custom query failed');
    }
    
    return response.data;
  }
}

// ================================================
// SPECIALIZED REPOSITORY TYPES
// ================================================

export abstract class ReadOnlyRepository<T> {
  protected abstract readonly baseEndpoint: string;

  async findAll(params?: Record<string, string | number | boolean>): Promise<T[]> {
    const response = await unifiedApiClient.get<T[]>(this.baseEndpoint, params);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch items');
    }
    return response.data;
  }

  async findById(id: string | number): Promise<T> {
    const response = await unifiedApiClient.get<T>(`${this.baseEndpoint}/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch item');
    }
    return response.data;
  }

  async search(options: SearchOptions): Promise<T[]> {
    const { filters, ...params } = options;
    
    const queryParams = { 
      ...params, 
      ...(filters ? Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [`filter_${key}`, String(value)])
      ) : {})
    };
    
    const response = await unifiedApiClient.get<T[]>(
      `${this.baseEndpoint}/search`,
      queryParams
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to search items');
    }
    
    return response.data;
  }
}

export abstract class CacheableRepository<T, CreateData = Partial<T>, UpdateData = Partial<T>> 
  extends BaseRepository<T, CreateData, UpdateData> {
  
  private cache = new Map<string, { data: T; expiresAt: number }>();
  private cacheTime: number;

  constructor(cachePrefix: string, cacheTimeMs: number = 5 * 60 * 1000) {
    super(cachePrefix);
    this.cacheTime = cacheTimeMs;
  }

  override async findById(id: string | number): Promise<T> {
    const cacheKey = this.getCacheKey(`item:${id}`);
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    
    const item = await super.findById(id);
    this.cache.set(cacheKey, {
      data: item,
      expiresAt: Date.now() + this.cacheTime,
    });
    
    return item;
  }

  protected override invalidateCache(): void {
    super.invalidateCache();
    this.cache.clear();
  }
}

export default BaseRepository;