// ================================================
// API HOOKS - STANDARDIZED API INTERACTION PATTERNS
// ================================================
// Unified hooks for all API interactions using consistent patterns

import {
  useAsyncOperation,
  useMutation,
  usePagination,
  type AsyncHookReturn,
  type MutationHookReturn,
  type PaginatedHookReturn,
} from '../base';
import { apiClient } from '../../lib/api/UnifiedApiClient';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'freelancer' | 'client' | 'admin';
  skills: string[];
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number; currency: string };
  duration: string;
  skills: string[];
  clientId: string;
  status: 'active' | 'in_progress' | 'completed' | 'cancelled';
  isRemote: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  category: string;
  sellerId: string;
  pricing: { type: string; price: number; currency: string }[];
  rating: number;
  reviewsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
  location?: string;
  isRemote?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface AnalyticsData {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  period: string;
}

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalPackages: number;
  revenue: number;
  growthRate: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  confirmPassword: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// ================================================
// AUTH HOOKS
// ================================================
// NOTE: Main auth hooks moved to /hooks/shared/useAuth.tsx
// These are kept for API-specific auth operations only

/**
 * @deprecated Use useAuth from '/hooks/shared/useAuth' instead
 * Basic API auth operations - kept for legacy compatibility
 */
export function useApiAuth() {
  const login = useMutation<LoginResponse, AuthCredentials>(
    async (credentials) => {
      return await apiClient.post<LoginResponse>('/auth/login', credentials);
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
      },
    }
  );

  const register = useMutation<LoginResponse, RegisterData>(
    async (data) => {
      return await apiClient.post<LoginResponse>('/auth/register', data);
    },
    {
      onSuccess: (data) => {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('refresh_token', data.refreshToken);
      },
    }
  );

  const logout = useMutation<void, void>(
    async () => {
      await apiClient.post('/auth/logout');
    },
    {
      onSuccess: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
      },
    }
  );

  return { login, register, logout };
}

/**
 * @deprecated Use useCurrentUser from '/hooks/shared/useAuth' instead
 * Current user API hook - kept for legacy compatibility
 */
export function useApiCurrentUser(): AsyncHookReturn<User> {
  return useAsyncOperation(
    async () => {
      return await apiClient.get<User>('/auth/me');
    },
    {
      enabled: !!localStorage.getItem('auth_token'),
    }
  );
}

// ================================================
// USER HOOKS
// ================================================

export function useUserProfile(userId: string): AsyncHookReturn<User> {
  return useAsyncOperation(
    async () => {
      return await apiClient.get<User>(`/users/${userId}`);
    },
    {
      dependencies: [userId],
      enabled: !!userId,
    }
  );
}

export function useUpdateUserProfile(): MutationHookReturn<
  User,
  Partial<User> & { id: string }
> {
  return useMutation(async (userData) => {
    const { id, ...updateData } = userData;
    return await apiClient.put<User>(`/users/${id}`, updateData);
  });
}

export function useUserSearch(
  filters: SearchFilters,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedHookReturn<User> {
  const { pageSize = 10 } = options;

  return usePagination(async (page: number, limit: number) => {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = Array.isArray(value)
          ? value.join(',')
          : String(value);
      }
    });

    const response = await apiClient.get<{ users: User[]; total: number }>(
      '/users',
      queryParams
    );
    return {
      items: response.users,
      total: response.total,
    };
  }, pageSize);
}

// ================================================
// JOB HOOKS
// ================================================

export function useJob(jobId: string): AsyncHookReturn<Job> {
  return useAsyncOperation(
    async () => {
      return await apiClient.get<Job>(`/jobs/${jobId}`);
    },
    {
      dependencies: [jobId],
      enabled: !!jobId,
    }
  );
}

export function useJobsSearch(
  filters: SearchFilters,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedHookReturn<Job> {
  const { pageSize = 10 } = options;

  return usePagination(async (page: number, limit: number) => {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = Array.isArray(value)
          ? value.join(',')
          : String(value);
      }
    });

    const response = await apiClient.get<{ jobs: Job[]; total: number }>(
      '/jobs',
      queryParams
    );
    return {
      items: response.jobs,
      total: response.total,
    };
  }, pageSize);
}

export function useCreateJob(): MutationHookReturn<
  Job,
  Omit<Job, 'id' | 'createdAt' | 'updatedAt'>
> {
  return useMutation(async (jobData) => {
    return await apiClient.post<Job>('/jobs', jobData);
  });
}

export function useUpdateJob(): MutationHookReturn<
  Job,
  Partial<Job> & { id: string }
> {
  return useMutation(async (jobData) => {
    const { id, ...updateData } = jobData;
    return await apiClient.put<Job>(`/jobs/${id}`, updateData);
  });
}

export function useDeleteJob(): MutationHookReturn<void, string> {
  return useMutation(async (jobId) => {
    await apiClient.delete(`/jobs/${jobId}`);
  });
}

// ================================================
// PACKAGE HOOKS
// ================================================

export function usePackage(packageId: string): AsyncHookReturn<Package> {
  return useAsyncOperation(
    async () => {
      return await apiClient.get<Package>(`/packages/${packageId}`);
    },
    {
      dependencies: [packageId],
      enabled: !!packageId,
    }
  );
}

export function usePackagesSearch(
  filters: SearchFilters,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedHookReturn<Package> {
  const { pageSize = 10 } = options;

  return usePagination(async (page: number, limit: number) => {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = Array.isArray(value)
          ? value.join(',')
          : String(value);
      }
    });

    const response = await apiClient.get<{
      packages: Package[];
      total: number;
    }>('/packages', queryParams);
    return {
      items: response.packages,
      total: response.total,
    };
  }, pageSize);
}

export function useCreatePackage(): MutationHookReturn<
  Package,
  Omit<Package, 'id' | 'createdAt' | 'updatedAt'>
> {
  return useMutation(async (packageData) => {
    return await apiClient.post<Package>('/packages', packageData);
  });
}

export function useUpdatePackage(): MutationHookReturn<
  Package,
  Partial<Package> & { id: string }
> {
  return useMutation(async (packageData) => {
    const { id, ...updateData } = packageData;
    return await apiClient.put<Package>(`/packages/${id}`, updateData);
  });
}

export function useDeletePackage(): MutationHookReturn<void, string> {
  return useMutation(async (packageId) => {
    await apiClient.delete(`/packages/${packageId}`);
  });
}

// ================================================
// FAVORITES HOOKS
// ================================================

export function useFavorites(
  userId: string
): AsyncHookReturn<{ jobs: Job[]; packages: Package[] }> {
  return useAsyncOperation(
    async () => {
      return await apiClient.get<{ jobs: Job[]; packages: Package[] }>(
        `/users/${userId}/favorites`
      );
    },
    {
      dependencies: [userId],
      enabled: !!userId,
    }
  );
}

export function useToggleFavorite(): MutationHookReturn<
  void,
  { type: 'job' | 'package'; id: string }
> {
  return useMutation(async ({ type, id }) => {
    await apiClient.post(`/favorites/${type}/${id}/toggle`);
  });
}

// ================================================
// MESSAGING HOOKS
// ================================================

export function useConversations(): AsyncHookReturn<Conversation[]> {
  return useAsyncOperation(async () => {
    return await apiClient.get<Conversation[]>('/messages/conversations');
  });
}

export function useConversationMessages(
  conversationId: string,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedHookReturn<Message> {
  const { pageSize = 20 } = options;

  return usePagination(async (page: number, limit: number) => {
    const queryParams = {
      page: page.toString(),
      limit: limit.toString(),
    };

    const response = await apiClient.get<{
      messages: Message[];
      total: number;
    }>(`/messages/conversations/${conversationId}/messages`, queryParams);
    return {
      items: response.messages,
      total: response.total,
    };
  }, pageSize);
}

export function useSendMessage(): MutationHookReturn<
  Message,
  { conversationId: string; content: string }
> {
  return useMutation(async ({ conversationId, content }) => {
    return await apiClient.post<Message>(
      `/messages/conversations/${conversationId}/messages`,
      {
        content,
      }
    );
  });
}

// ================================================
// NOTIFICATION HOOKS
// ================================================

export function useNotifications(): AsyncHookReturn<Notification[]> {
  return useAsyncOperation(async () => {
    return await apiClient.get<Notification[]>('/notifications');
  });
}

export function useMarkNotificationRead(): MutationHookReturn<void, string> {
  return useMutation(async (notificationId) => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  });
}

export function useMarkAllNotificationsRead(): MutationHookReturn<void, void> {
  return useMutation(async () => {
    await apiClient.put('/notifications/read-all');
  });
}

// ================================================
// FILE UPLOAD HOOKS
// ================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function useFileUpload(): MutationHookReturn<UploadResponse, File> {
  return useMutation(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return await apiClient.post<UploadResponse>('/upload', formData);
  });
}

// ================================================
// ANALYTICS HOOKS
// ================================================

export function useAnalytics(
  dateRange: { start: string; end: string },
  options: { enabled?: boolean } = {}
): AsyncHookReturn<AnalyticsData> {
  const { enabled = true } = options;

  return useAsyncOperation(
    async () => {
      const queryParams = {
        start: dateRange.start,
        end: dateRange.end,
      };
      return await apiClient.get<AnalyticsData>('/analytics', queryParams);
    },
    {
      dependencies: [dateRange.start, dateRange.end],
      enabled: enabled && !!dateRange.start && !!dateRange.end,
    }
  );
}

// ================================================
// ADMIN HOOKS
// ================================================

export function useAdminStats(): AsyncHookReturn<AdminStats> {
  return useAsyncOperation(async () => {
    return await apiClient.get<AdminStats>('/admin/stats');
  });
}

export function useAdminUsers(
  filters: SearchFilters,
  options: { pageSize?: number; enabled?: boolean } = {}
): PaginatedHookReturn<User> {
  const { pageSize = 20 } = options;

  return usePagination(async (page: number, limit: number) => {
    const queryParams: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams[key] = Array.isArray(value)
          ? value.join(',')
          : String(value);
      }
    });

    const response = await apiClient.get<{ users: User[]; total: number }>(
      '/admin/users',
      queryParams
    );
    return {
      items: response.users,
      total: response.total,
    };
  }, pageSize);
}

// ================================================
// EXPORTS
// ================================================

const ApiHooks = {
  // Auth (deprecated - use shared/useAuth instead)
  useApiAuth,
  useApiCurrentUser,

  // Users
  useUserProfile,
  useUpdateUserProfile,
  useUserSearch,

  // Jobs
  useJob,
  useJobsSearch,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,

  // Packages
  usePackage,
  usePackagesSearch,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,

  // Favorites
  useFavorites,
  useToggleFavorite,

  // Messaging
  useConversations,
  useConversationMessages,
  useSendMessage,

  // Notifications
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,

  // File Upload
  useFileUpload,

  // Analytics
  useAnalytics,

  // Admin
  useAdminStats,
  useAdminUsers,
};

export default ApiHooks;
