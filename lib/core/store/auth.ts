/**
 * Auth Store - Re-export from domains/auth
 * Legacy compatibility for existing imports
 */

// Re-export the auth store from the domains folder
export { useAuthStore, authSelectors } from './domains/auth/authStore';

// Default export for compatibility
export { useAuthStore as default } from './domains/auth/authStore';
