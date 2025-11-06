import type { User } from '@/types';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  phone?: string;
  website?: string;
  avatar?: string;
}

export class AuthService {
  /**
   * Login user
   */
  static async login(
    credentials: LoginRequest
  ): Promise<{ user: User; token?: string }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; token?: string }>
    >('/auth/login', credentials);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Login failed');
    }

    return response.data;
  }

  /**
   * Register new user
   */
  static async register(
    userData: RegisterRequest
  ): Promise<{ user: User; token?: string }> {
    const response = await apiClient.post<
      ApiResponse<{ user: User; token?: string }>
    >('/auth/register', userData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Registration failed');
    }

    return response.data;
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>('/auth/logout');

    if (!response.success) {
      throw new Error(response.message || 'Logout failed');
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to get current user',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    updates: UpdateProfileRequest
  ): Promise<User | null> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        '/auth/profile',
        updates
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to update profile',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Change password
   */
  static async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.put<ApiResponse<void>>(
        '/auth/password',
        {
          oldPassword,
          newPassword,
        }
      );

      return response.success;
    } catch (error) {
      logger.error(
        'Failed to change password',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/forgot-password',
        {
          email,
        }
      );

      return response.success;
    } catch (error) {
      logger.error(
        'Failed to request password reset',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/reset-password',
        {
          token,
          newPassword,
        }
      );

      return response.success;
    } catch (error) {
      logger.error(
        'Failed to reset password',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/verify-email',
        {
          token,
        }
      );

      return response.success;
    } catch (error) {
      logger.error(
        'Failed to verify email',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(): Promise<boolean> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/auth/resend-verification'
      );

      return response.success;
    } catch (error) {
      logger.error(
        'Failed to resend verification',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }
}

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to fetch user',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(
    query: string,
    userType?: 'freelancer' | 'employer',
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    if (userType) {
      params.append('userType', userType);
    }

    const response = await apiClient.get<
      ApiResponse<{ users: User[]; total: number }>
    >(`/users/search?${params.toString()}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to search users');
    }

    return response.data;
  }

  /**
   * Get user's public profile
   */
  static async getPublicProfile(id: string): Promise<User | null> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        `/users/${id}/profile`
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to fetch public profile',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }

  /**
   * Follow/unfollow user
   */
  static async toggleFollow(userId: string): Promise<boolean> {
    try {
      const response = await apiClient.post<
        ApiResponse<{ following: boolean }>
      >(`/users/${userId}/follow`);

      return response.success && response.data?.following === true;
    } catch (error) {
      logger.error(
        'Failed to toggle follow',
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }
  }

  /**
   * Get user's followers
   */
  static async getFollowers(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const response = await apiClient.get<
      ApiResponse<{ users: User[]; total: number }>
    >(`/users/${userId}/followers?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch followers');
    }

    return response.data;
  }

  /**
   * Get user's following
   */
  static async getFollowing(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ users: User[]; total: number }> {
    const response = await apiClient.get<
      ApiResponse<{ users: User[]; total: number }>
    >(`/users/${userId}/following?page=${page}&limit=${limit}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch following');
    }

    return response.data;
  }
}
