/**
 * Auth Domain - Clean Architecture
 * Handles all authentication-related business logic
 */

// Domain utilities
export * from './utils';

// Auth store (unified)
export {
  useUnifiedAuthStore,
  useAuthStore,
} from '../../core/store/domains/auth/unifiedAuthStore';
