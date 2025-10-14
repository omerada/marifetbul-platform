// ================================================
// REPOSITORY TYPE DEFINITIONS
// ================================================
// Type-safe definitions for Repository pattern
// Used by BaseRepository.ts

/**
 * Base entity interface - all entities should have an ID
 */
export interface BaseEntity {
  id: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * User entity type
 */
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  role: 'freelancer' | 'employer' | 'admin';
  avatar?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * User creation DTO
 */
export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: 'freelancer' | 'employer';
  phone?: string;
}

/**
 * User update DTO
 */
export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * Job entity type
 */
export interface Job extends BaseEntity {
  title: string;
  description: string;
  employerId: string;
  categoryId: string;
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  budget?: number;
  deadline?: string | Date;
  skills?: string[];
  applicantsCount?: number;
}

/**
 * Job creation DTO
 */
export interface CreateJobDTO {
  title: string;
  description: string;
  employerId: string;
  categoryId?: string;
  budget?: number;
  deadline?: string;
  skills?: string[];
}

/**
 * Job update DTO
 */
export interface UpdateJobDTO {
  title?: string;
  description?: string;
  status?: Job['status'];
  budget?: number;
  deadline?: string;
  skills?: string[];
}

/**
 * Package entity type
 */
export interface Package extends BaseEntity {
  title: string;
  description: string;
  price: number;
  freelancerId: string;
  categoryId?: string;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  status?: 'active' | 'paused' | 'draft';
  rating?: number;
  ordersCount?: number;
}

/**
 * Package creation DTO
 */
export interface CreatePackageDTO {
  title: string;
  description: string;
  price: number;
  freelancerId: string;
  deliveryTime: number;
  revisions: number;
  features: string[];
  categoryId?: string;
}

/**
 * Package update DTO
 */
export interface UpdatePackageDTO {
  title?: string;
  description?: string;
  price?: number;
  deliveryTime?: number;
  revisions?: number;
  features?: string[];
  status?: Package['status'];
}

/**
 * Query parameters for repositories
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
  include?: string[];
  fields?: string[];
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  meta?: {
    totalCount: number;
    filters: Record<string, unknown>;
    searchQuery?: string;
  };
}

/**
 * Single entity response wrapper
 */
export interface SingleResponse<T> {
  data: T;
  meta?: {
    lastModified?: string;
    etag?: string;
  };
}
