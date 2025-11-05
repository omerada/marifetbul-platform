/**
 * ============================================================================
 * AUTHENTICATION MODULE - Unified Exports
 * ============================================================================
 * Central export point for all authentication-related functionality
 *
 * @version 3.0.0
 * @author MarifetBul Development Team
 * @sprint Sprint 1 - Authentication System
 */

// ============================================================================
// SERVICE
// ============================================================================

export {
  unifiedAuthService,
  default as authService,
} from './unifiedAuthService';

export type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  UpdateProfileRequest,
  RefreshTokenRequest,
  LoginResponse,
  AuthErrorResponse,
} from './unifiedAuthService';

// ============================================================================
// SESSION MANAGER
// ============================================================================

export {
  sessionManager,
  setupActivityTracking,
  default as SessionManager,
} from './sessionManager';

export type { SessionState, SessionCallbacks } from './sessionManager';

// ============================================================================
// STORE
// ============================================================================

export {
  useUnifiedAuthStore,
  useAuthStore, // Backward compatibility
  authSelectors,
  default as useAuth,
} from '../store/domains/auth/unifiedAuthStore';
