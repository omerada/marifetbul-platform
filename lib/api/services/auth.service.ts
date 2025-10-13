/**
 * ================================================
 * AUTHENTICATION SERVICE
 * ================================================
 * Handles all authentication-related API calls
 * Uses unified API client and endpoints registry
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { apiClient, type ApiResponse } from '../client';
import { AUTH_ENDPOINTS } from '../endpoints';

// ================================================
// TYPES
// ================================================

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'FREELANCER' | 'EMPLOYER' | 'BOTH';
  acceptedTerms: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token?: string; // JWT token (if not using httpOnly cookies)
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: 'FREELANCER' | 'EMPLOYER' | 'BOTH';
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  location?: string;
  website?: string;
  skills?: string[];
}

// ================================================
// AUTHENTICATION SERVICE
// ================================================

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(AUTH_ENDPOINTS.REGISTER, data);
  }

  /**
   * Login user
   * Note: Backend uses httpOnly cookies, so no need to store token manually
   */
  async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, data);
  }

  /**
   * Logout user
   * Clears httpOnly cookie on backend
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Refresh authentication token
   * Backend validates httpOnly cookie and issues new one
   */
  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(AUTH_ENDPOINTS.ME);
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>(AUTH_ENDPOINTS.UPDATE_PROFILE, data);
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      data
    );
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      data
    );
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword(
    data: ChangePasswordRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );
  }

  /**
   * Verify email with token
   */
  async verifyEmail(
    data: VerifyEmailRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.VERIFY_EMAIL,
      data
    );
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post<{ message: string }>(
      AUTH_ENDPOINTS.RESEND_VERIFICATION
    );
  }

  /**
   * Check if user is authenticated (has valid cookie)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser();
      return response.success && !!response.data;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
