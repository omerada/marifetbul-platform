// Unified Type System - Enhanced Types Only
// This file provides enhanced type definitions for new features

// Enhanced search types
export interface UnifiedSearchFilters {
  query?: string;
  categories?: string[];
  location?: {
    city?: string;
    country?: string;
    radius?: number;
  };
  budget?: {
    min?: number;
    max?: number;
  };
  experience?: ('beginner' | 'intermediate' | 'expert')[];
  skills?: string[];
  rating?: number;
  availability?: boolean;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'recent';
}

export interface UnifiedSearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  filters: UnifiedSearchFilters;
  suggestions?: string[];
  facets?: Record<string, { value: string; count: number }[]>;
}

// Enhanced notification types
export interface UnifiedNotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

// Enhanced location types
export interface UnifiedLocationData {
  lat: number;
  lng: number;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  formattedAddress: string;
}

// Consolidated loading state interface
export interface UnifiedLoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
  variant: 'spinner' | 'skeleton' | 'progress' | 'overlay';
  size?: 'sm' | 'md' | 'lg';
}

// Form state management
export interface UnifiedFormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Keep compatibility with existing imports by re-exporting legacy types
// These will be gradually phased out as we update imports across the codebase
export * from './performance';
export * from './seo';
export * from './social';

// Add new consolidated types to prevent conflicts
export type Currency = 'TRY' | 'USD' | 'EUR';
export type UserRole = 'user' | 'admin' | 'moderator' | 'super_admin';
export type UserType = 'freelancer' | 'employer' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'expert';
export type JobStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'canceled'
  | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Common utility types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PriceRange {
  min: number;
  max: number;
  currency?: Currency;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

// Error handling types
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponseType<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Pagination helper types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// File handling types
export interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}
