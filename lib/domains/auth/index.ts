/**
 * Auth Domain - Clean Architecture
 * Handles all authentication-related business logic
 */

// Domain utilities
export * from './utils';

// Auth store (main export)
export { useAuthStore as default } from '../../core/store/domains/auth/authStore';
