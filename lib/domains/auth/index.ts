/**
 * Auth Domain - Clean Architecture
 * Handles all authentication-related business logic
 */

// Domain utilities
export * from './utils';

// Auth store (main export)
export { default as useAuthStore } from '../../core/store/auth';
