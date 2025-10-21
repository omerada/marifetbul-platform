/**
 * ===================================================================================
 * AUTHENTICATION SERVICE - Production-Ready API Client
 * ===================================================================================
 * Complete authentication service matching Spring Boot backend endpoints exactly
 *
 * Backend Controller: AuthController.java
 * Base Path: /api/v1/auth
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { AUTH_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  UserResponse,
} from '@/types/backend-aligned';

// ================================================
// REQUEST TYPES
// ================================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  passwordConfirmation: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  passwordConfirmation: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  phone?: string;
  avatar?: string;
  skills?: string[];
  languages?: string[];
}

// ================================================
// AUTHENTICATION SERVICE CLASS
// ================================================

class AuthService {
  // ==================== REGISTRATION & LOGIN ====================

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(request: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REGISTER,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   *
   * Note: Uses httpOnly cookies for token storage (secure)
   * Tokens are automatically included in subsequent requests
   */
  async login(request: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   *
   * Clears httpOnly cookies and invalidates refresh token
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.LOGOUT,
      {},
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   *
   * Automatically uses refresh token from httpOnly cookie if not provided
   */
  async refreshToken(
    request?: RefreshTokenRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<ApiResponse<AuthResponse>>(
      AUTH_ENDPOINTS.REFRESH_TOKEN,
      request || {},
      {
        caching: { enabled: false },
      }
    );
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.FORGOT_PASSWORD,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Reset password with token
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(
    request: ResetPasswordRequest
  ): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.RESET_PASSWORD,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Change password (authenticated user)
   * POST /api/v1/auth/change-password
   */
  async changePassword(
    request: ChangePasswordRequest
  ): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Verify email address
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.VERIFY_EMAIL,
      request,
      {
        caching: { enabled: false },
      }
    );
  }

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   */
  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<ApiResponse<void>>(
      AUTH_ENDPOINTS.RESEND_VERIFICATION,
      { email },
      {
        caching: { enabled: false },
      }
    );
  }

  // ==================== CURRENT USER ====================

  /**
   * Get current authenticated user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<ApiResponse<UserResponse>>(
      AUTH_ENDPOINTS.ME,
      undefined,
      {
        caching: {
          enabled: true,
          ttl: 300000, // 5 minutes
        },
      }
    );
  }

  /**
   * Update current user profile
   * PUT /api/v1/auth/profile
   */
  async updateProfile(
    request: UpdateProfileRequest
  ): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put<ApiResponse<UserResponse>>(
      AUTH_ENDPOINTS.UPDATE_PROFILE,
      request,
      {
        caching: { enabled: false },
      }
    );

    // Invalidate current user cache
    this.invalidateCurrentUser();

    return response;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Check if user is authenticated
   * Makes a lightweight request to verify auth status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Invalidate current user cache
   */
  invalidateCurrentUser() {
    apiClient.invalidateCache(AUTH_ENDPOINTS.ME);
  }

  /**
   * Clear all authentication cache
   */
  clearAuthCache() {
    apiClient.invalidateCachePattern(/\/auth/);
  }

  /**
   * Handle authentication error
   * Can be used to redirect to login or refresh token
   */
  async handleAuthError(error: unknown): Promise<void> {
    console.error('[AuthService] Authentication error:', error);

    // Clear cache
    this.clearAuthCache();

    // Try to refresh token once
    try {
      await this.refreshToken();
    } catch (refreshError) {
      // If refresh fails, user needs to login again
      console.error('[AuthService] Token refresh failed:', refreshError);

      // Redirect to login (if running in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}

// ================================================
// SINGLETON INSTANCE
// ================================================

export const authService = new AuthService();

// ================================================
// EXPORTS
// ================================================

export default authService;
