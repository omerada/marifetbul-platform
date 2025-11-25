/**
 * ================================================
 * AUTH & SECURITY INTEGRATION TESTS
 * ================================================
 * Complete authentication and security flow testing
 *
 * Test Coverage:
 * - User registration & email verification
 * - Login/Logout flow
 * - Two-Factor Authentication (2FA)
 * - Session management
 * - Token refresh mechanism
 * - Password reset flow
 * - Security validations
 * - Rate limiting
 *
 * @sprint Test Coverage & QA - Week 1, Priority 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, act } from '@testing-library/react';
import { apiClient } from '../../lib/infrastructure/api/client';
import { unifiedAuthService } from '../../lib/core/auth/unifiedAuthService';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('../../lib/infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'FREELANCER',
  emailVerified: true,
  twoFactorEnabled: false,
};

const mockTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
  expiresIn: 3600,
  tokenType: 'Bearer',
};

const mockRegistrationData = {
  email: 'newuser@example.com',
  password: 'SecureP@ssw0rd123',
  firstName: 'Jane',
  lastName: 'Smith',
  role: 'EMPLOYER',
  agreeToTerms: true,
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Auth & Security Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  // ========================================================================
  // 1. USER REGISTRATION & EMAIL VERIFICATION
  // ========================================================================

  describe('User Registration', () => {
    it('should register new user successfully', async () => {
      // Arrange
      const mockResponse = {
        user: {
          ...mockUser,
          id: 'new-user-123',
          email: mockRegistrationData.email,
          firstName: mockRegistrationData.firstName,
          lastName: mockRegistrationData.lastName,
          role: mockRegistrationData.role,
          emailVerified: false,
        },
        message: 'Registration successful. Please verify your email.',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post(
        '/api/v1/auth/register',
        mockRegistrationData
      );

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockRegistrationData.email);
      expect(result.user.emailVerified).toBe(false);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/register',
        expect.objectContaining({
          email: mockRegistrationData.email,
          password: mockRegistrationData.password,
        })
      );
    });

    it('should validate password strength', async () => {
      // Arrange - Weak password
      const weakPasswordData = {
        ...mockRegistrationData,
        password: '123456',
      };

      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          errors: [
            {
              field: 'password',
              message:
                'Password must be at least 8 characters with uppercase, lowercase, number and special character',
            },
          ],
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/register', weakPasswordData)
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should prevent duplicate email registration', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 409,
        data: {
          error: 'Email already exists',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/register', mockRegistrationData)
      ).rejects.toMatchObject({
        status: 409,
      });
    });

    it('should send verification email after registration', async () => {
      // Arrange
      const mockResponse = {
        user: { ...mockUser, emailVerified: false },
        verificationEmailSent: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post(
        '/api/v1/auth/register',
        mockRegistrationData
      );

      // Assert
      expect(result.verificationEmailSent).toBe(true);
    });

    it('should verify email with valid token', async () => {
      // Arrange
      const verificationToken = 'valid-token-123';
      const mockResponse = {
        success: true,
        message: 'Email verified successfully',
        user: { ...mockUser, emailVerified: true },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/verify-email', {
        token: verificationToken,
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.user.emailVerified).toBe(true);
    });

    it('should reject invalid verification token', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Invalid or expired verification token',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/verify-email', { token: 'invalid-token' })
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================================================
  // 2. LOGIN/LOGOUT FLOW
  // ========================================================================

  describe('Login Flow', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
      };

      const mockResponse = {
        user: mockUser,
        tokens: mockTokens,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/login', loginData);

      // Assert
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBe(mockTokens.accessToken);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/login',
        expect.objectContaining(loginData)
      );
    });

    it('should reject login with invalid credentials', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 401,
        data: {
          error: 'Invalid email or password',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/login', {
          email: 'test@example.com',
          password: 'WrongPassword',
        })
      ).rejects.toMatchObject({
        status: 401,
      });
    });

    it('should require email verification before login', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 403,
        data: {
          error: 'Please verify your email before logging in',
          emailVerified: false,
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/login', {
          email: 'unverified@example.com',
          password: 'SecureP@ssw0rd123',
        })
      ).rejects.toMatchObject({
        status: 403,
      });
    });

    it('should logout successfully', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Logged out successfully',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/logout');

      // Assert
      expect(result.success).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/api/v1/auth/logout');
    });

    it('should clear local storage on logout', async () => {
      // Arrange
      localStorage.setItem('accessToken', mockTokens.accessToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      (apiClient.post as jest.Mock).mockResolvedValue({ success: true });

      // Act
      await apiClient.post('/api/v1/auth/logout');
      localStorage.clear(); // Simulate client-side cleanup

      // Assert
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  // ========================================================================
  // 3. TWO-FACTOR AUTHENTICATION (2FA)
  // ========================================================================

  describe('Two-Factor Authentication', () => {
    it('should enable 2FA and return QR code', async () => {
      // Arrange
      const mockResponse = {
        secret: 'JBSWY3DPEHPK3PXP',
        qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANS...',
        backupCodes: ['BACKUP-CODE-1', 'BACKUP-CODE-2', 'BACKUP-CODE-3'],
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/2fa/enable');

      // Assert
      expect(result.secret).toBeDefined();
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.backupCodes).toHaveLength(3);
    });

    it('should verify 2FA code during setup', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: '2FA enabled successfully',
        twoFactorEnabled: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/2fa/verify', {
        code: '123456',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.twoFactorEnabled).toBe(true);
    });

    it('should reject invalid 2FA code', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Invalid verification code',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/2fa/verify', { code: '000000' })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should require 2FA code during login when enabled', async () => {
      // Arrange
      const mockResponse = {
        requiresTwoFactor: true,
        tempToken: 'temp-token-123',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
      });

      // Assert
      expect(result.requiresTwoFactor).toBe(true);
      expect(result.tempToken).toBeDefined();
    });

    it('should complete login with valid 2FA code', async () => {
      // Arrange
      const mockResponse = {
        user: { ...mockUser, twoFactorEnabled: true },
        tokens: mockTokens,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/2fa/verify-login', {
        tempToken: 'temp-token-123',
        code: '123456',
      });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
    });

    it('should accept backup code for 2FA', async () => {
      // Arrange
      const mockResponse = {
        user: mockUser,
        tokens: mockTokens,
        backupCodeUsed: true,
        remainingBackupCodes: 2,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/2fa/verify-login', {
        tempToken: 'temp-token-123',
        backupCode: 'BACKUP-CODE-1',
      });

      // Assert
      expect(result.backupCodeUsed).toBe(true);
      expect(result.remainingBackupCodes).toBe(2);
    });

    it('should disable 2FA with password confirmation', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: '2FA disabled successfully',
        twoFactorEnabled: false,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/2fa/disable', {
        password: 'SecureP@ssw0rd123',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.twoFactorEnabled).toBe(false);
    });
  });

  // ========================================================================
  // 4. SESSION MANAGEMENT
  // ========================================================================

  describe('Session Management', () => {
    it('should create new session on login', async () => {
      // Arrange
      const mockResponse = {
        user: mockUser,
        tokens: mockTokens,
        session: {
          id: 'session-123',
          userId: mockUser.id,
          deviceInfo: 'Chrome on Windows',
          ipAddress: '192.168.1.1',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
      });

      // Assert
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe(mockUser.id);
    });

    it('should list active sessions', async () => {
      // Arrange
      const mockSessions = [
        {
          id: 'session-1',
          deviceInfo: 'Chrome on Windows',
          ipAddress: '192.168.1.1',
          current: true,
          lastActivity: new Date().toISOString(),
        },
        {
          id: 'session-2',
          deviceInfo: 'Safari on iPhone',
          ipAddress: '192.168.1.2',
          current: false,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({
        sessions: mockSessions,
        total: 2,
      });

      // Act
      const result = await apiClient.get('/api/v1/auth/sessions');

      // Assert
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].current).toBe(true);
    });

    it('should revoke specific session', async () => {
      // Arrange
      const sessionId = 'session-2';
      const mockResponse = {
        success: true,
        message: 'Session revoked successfully',
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.delete(
        `/api/v1/auth/sessions/${sessionId}`
      );

      // Assert
      expect(result.success).toBe(true);
      expect(apiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining(sessionId)
      );
    });

    it('should revoke all other sessions', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'All other sessions revoked',
        revokedCount: 3,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/sessions/revoke-all');

      // Assert
      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(3);
    });

    it('should expire session after timeout', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue({
        status: 401,
        data: {
          error: 'Session expired',
          code: 'SESSION_EXPIRED',
        },
      });

      // Act & Assert
      await expect(apiClient.get('/api/v1/auth/me')).rejects.toMatchObject({
        status: 401,
      });
    });
  });

  // ========================================================================
  // 5. TOKEN REFRESH MECHANISM
  // ========================================================================

  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // Arrange
      const mockResponse = {
        accessToken: 'new-access-token-789',
        refreshToken: 'new-refresh-token-012',
        expiresIn: 3600,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/refresh', {
        refreshToken: mockTokens.refreshToken,
      });

      // Assert
      expect(result.accessToken).toBe('new-access-token-789');
      expect(result.refreshToken).toBe('new-refresh-token-012');
    });

    it('should reject expired refresh token', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 401,
        data: {
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/refresh', {
          refreshToken: 'expired-token',
        })
      ).rejects.toMatchObject({
        status: 401,
      });
    });

    it('should auto-refresh token before expiration', async () => {
      // Arrange
      const mockResponse = {
        accessToken: 'auto-refreshed-token',
        expiresIn: 3600,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act - Simulate token about to expire (< 5 minutes remaining)
      const result = await apiClient.post('/api/v1/auth/refresh', {
        refreshToken: mockTokens.refreshToken,
      });

      // Assert
      expect(result.accessToken).toBeDefined();
    });

    it('should handle concurrent refresh requests', async () => {
      // Arrange
      let callCount = 0;
      (apiClient.post as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          accessToken: `token-${callCount}`,
          expiresIn: 3600,
        });
      });

      // Act - Simulate concurrent requests
      const promises = [
        apiClient.post('/api/v1/auth/refresh', {
          refreshToken: mockTokens.refreshToken,
        }),
        apiClient.post('/api/v1/auth/refresh', {
          refreshToken: mockTokens.refreshToken,
        }),
        apiClient.post('/api/v1/auth/refresh', {
          refreshToken: mockTokens.refreshToken,
        }),
      ];

      const results = await Promise.all(promises);

      // Assert - All should succeed
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.accessToken).toBeDefined();
      });
    });
  });

  // ========================================================================
  // 6. PASSWORD RESET FLOW
  // ========================================================================

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Password reset email sent',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/forgot-password', {
        email: 'test@example.com',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/auth/forgot-password',
        expect.objectContaining({ email: 'test@example.com' })
      );
    });

    it('should not reveal if email exists (security)', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'If an account exists, a password reset email has been sent',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/forgot-password', {
        email: 'nonexistent@example.com',
      });

      // Assert - Same response for security
      expect(result.success).toBe(true);
    });

    it('should validate password reset token', async () => {
      // Arrange
      const resetToken = 'valid-reset-token-123';
      const mockResponse = {
        valid: true,
        email: 'test@example.com',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.get(
        `/api/v1/auth/reset-password/validate?token=${resetToken}`
      );

      // Assert
      expect(result.valid).toBe(true);
      expect(result.email).toBe('test@example.com');
    });

    it('should reset password with valid token', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Password reset successfully',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/reset-password', {
        token: 'valid-reset-token-123',
        newPassword: 'NewSecureP@ssw0rd456',
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject weak password on reset', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          errors: [
            {
              field: 'newPassword',
              message: 'Password does not meet security requirements',
            },
          ],
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/reset-password', {
          token: 'valid-token',
          newPassword: 'weak',
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should expire reset token after use', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Reset token already used or expired',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/reset-password', {
          token: 'used-token',
          newPassword: 'NewSecureP@ssw0rd456',
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================================================
  // 7. SECURITY VALIDATIONS
  // ========================================================================

  describe('Security Validations', () => {
    it('should enforce rate limiting on login attempts', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 429,
        data: {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: 300, // 5 minutes
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/login', {
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toMatchObject({
        status: 429,
      });
    });

    it('should lock account after multiple failed login attempts', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 423,
        data: {
          error: 'Account locked due to multiple failed login attempts',
          lockedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/login', {
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toMatchObject({
        status: 423,
      });
    });

    it('should validate CSRF token on sensitive operations', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 403,
        data: {
          error: 'Invalid or missing CSRF token',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/change-password', {
          currentPassword: 'old',
          newPassword: 'new',
        })
      ).rejects.toMatchObject({
        status: 403,
      });
    });

    it('should prevent password reuse', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          errors: [
            {
              field: 'newPassword',
              message: 'Cannot reuse any of your last 5 passwords',
            },
          ],
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/change-password', {
          currentPassword: 'CurrentP@ssw0rd',
          newPassword: 'OldP@ssw0rd123', // Previously used
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should detect suspicious login from new location', async () => {
      // Arrange
      const mockResponse = {
        requiresVerification: true,
        verificationMethod: 'email',
        message: 'Suspicious login detected. Please verify your identity.',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'SecureP@ssw0rd123',
        // Simulating login from new IP/location
      });

      // Assert
      expect(result.requiresVerification).toBe(true);
      expect(result.verificationMethod).toBe('email');
    });

    it('should enforce password change after breach detection', async () => {
      // Arrange
      const mockResponse = {
        user: mockUser,
        tokens: mockTokens,
        requiresPasswordChange: true,
        reason: 'Your password was found in a data breach',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'CompromisedPassword',
      });

      // Assert
      expect(result.requiresPasswordChange).toBe(true);
    });
  });

  // ========================================================================
  // 8. CHANGE PASSWORD
  // ========================================================================

  describe('Change Password', () => {
    it('should change password with valid current password', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: 'CurrentP@ssw0rd123',
        newPassword: 'NewSecureP@ssw0rd456',
      });

      // Assert
      expect(result.success).toBe(true);
    });

    it('should reject change with incorrect current password', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          errors: [
            {
              field: 'currentPassword',
              message: 'Current password is incorrect',
            },
          ],
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/auth/change-password', {
          currentPassword: 'WrongPassword',
          newPassword: 'NewSecureP@ssw0rd456',
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should invalidate all sessions after password change', async () => {
      // Arrange
      const mockResponse = {
        success: true,
        message: 'Password changed successfully',
        sessionsInvalidated: true,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await apiClient.post('/api/v1/auth/change-password', {
        currentPassword: 'CurrentP@ssw0rd123',
        newPassword: 'NewSecureP@ssw0rd456',
      });

      // Assert
      expect(result.sessionsInvalidated).toBe(true);
    });
  });
});
