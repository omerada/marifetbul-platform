// ================================================
// UNIFIED HOOKS SYSTEM - REDESIGNED ARCHITECTURE
// ================================================
// Redesigned hook architecture with clear responsibility separation
// and standardized patterns for consistent development

import ApiHooks from './api';
import AuthHooks from './auth';
import BaseHooks from './base';
import HookPatterns from './base/patterns';
import BusinessHooks from './business';
import MessagingHooks from './messaging';
import ProfileHooks from './profile';
import UIHooks from './ui';

// ================================================
// BASE PATTERNS - FOUNDATION
// ================================================
export * from './base';
export * from './base/patterns';
export { default as BaseHooks } from './base';
export { default as HookPatterns } from './base/patterns';

// ================================================
// DOMAIN-SPECIFIC HOOKS WITH SEPARATED RESPONSIBILITIES
// ================================================

// Authentication hooks with separated concerns
export * from './auth';
export { default as AuthHooks } from './auth';

// Messaging hooks with separated concerns
export * from './messaging';
export { default as MessagingHooks } from './messaging';

// Profile hooks with separated concerns
export * from './profile';
export { default as ProfileHooks } from './profile';

// ================================================
// API HOOKS - STANDARDIZED DATA INTERACTIONS
// ================================================
export { default as ApiHooks } from './api';

// ================================================
// UI HOOKS - USER INTERFACE PATTERNS
// ================================================
export * from './ui';
export { default as UIHooks } from './ui';

// ================================================
// BUSINESS HOOKS - DOMAIN LOGIC PATTERNS
// ================================================
export * from './business';
export { default as BusinessHooks } from './business';

// ================================================
// LEGACY HOOK COMPATIBILITY
// ================================================
// Maintaining backward compatibility for existing components

// Legacy auth exports
export { useAuth } from './auth';
export { useAuthState as useCurrentUser } from './auth';

// Legacy messaging exports
export { useMessaging } from './messaging';
export { useConversations, useMessages } from './messaging';

// Legacy profile exports
export { useProfile } from './profile';
export { useProfileValidation } from './profile';

// Legacy UI exports
export { useModal, useToast, useForm } from './ui';

// Legacy business exports
export {
  useAuthState,
  useUnifiedSearch,
  useFavoritesManager,
} from './business';

// Legacy individual hook exports (for gradual migration)
export { useAuthGuard } from './useAuthGuard';
export { useAdminDashboard } from './useAdminDashboard';
export { useJobDetail } from './useJobDetail';
export { usePackageDetail } from './usePackageDetail';
export { useResponsive } from './useResponsive';
export { useHapticFeedback } from './useHapticFeedback';
export { useReputation } from './useReputation';
export { useReviews, useReviewForm } from './useReviews';

// ================================================
// HOOK ARCHITECTURE GUIDELINES
// ================================================

/**
 * HOOK RESPONSIBILITY SEPARATION:
 *
 * 1. DATA HOOKS - Pure data fetching
 *    - useProfile() - Fetches profile data
 *    - useConversations() - Fetches conversations
 *    - useCurrentUser() - Fetches current user data
 *
 * 2. ACTION HOOKS - Pure mutations
 *    - useAuthActions() - Login, logout, register
 *    - useSendMessage() - Send message mutation
 *    - useUpdateProfile() - Update profile mutation
 *
 * 3. STATE HOOKS - Local state management
 *    - useAuthState() - Authentication state
 *    - useModal() - Modal state
 *    - useForm() - Form state
 *
 * 4. BUSINESS LOGIC HOOKS - Domain-specific logic
 *    - usePermissions() - Access control logic
 *    - useProfilePermissions() - Profile access logic
 *    - useMessageStatus() - Message status logic
 *
 * 5. COMPOSITE HOOKS - Combines multiple concerns
 *    - useAuth() - Legacy compatibility (combines state + actions)
 *    - useMessaging() - Legacy compatibility (combines actions)
 */

/**
 * STANDARD RETURN TYPES:
 *
 * Data Hooks:
 * {
 *   data: T | null,
 *   isLoading: boolean,
 *   error: Error | null,
 *   refetch: () => Promise<T | undefined>,
 *   isStale: boolean,
 *   lastFetchTime: Date | null
 * }
 *
 * Mutation Hooks:
 * {
 *   mutate: (params: TParams) => Promise<TData>,
 *   data: TData | null,
 *   isLoading: boolean,
 *   error: Error | null,
 *   isSuccess: boolean,
 *   reset: () => void,
 *   isPending: boolean
 * }
 *
 * State Hooks:
 * {
 *   value: T,
 *   setValue: (value: T | ((prev: T) => T)) => void,
 *   reset: () => void,
 *   isDirty: boolean,
 *   hasChanges: boolean
 * }
 */

/**
 * MIGRATION STRATEGY:
 *
 * Phase 1: New features use separated hooks
 * - useAuthState() for read-only auth state
 * - useAuthActions() for auth mutations
 * - useProfile() for profile data
 * - useUpdateProfile() for profile mutations
 *
 * Phase 2: Gradually migrate existing components
 * - Replace useAuth() with useAuthState() + useAuthActions()
 * - Replace combined hooks with separated hooks
 * - Update components to use new patterns
 *
 * Phase 3: Remove legacy hooks
 * - Deprecate combined hooks
 * - Remove legacy compatibility layer
 * - Full migration to separated architecture
 */

// ================================================
// HOOK PATTERNS FOR LAZY LOADING
// ================================================

export const HookModules = {
  // Base patterns
  Base: () => import('./base'),
  Patterns: () => import('./base/patterns'),

  // Domain hooks
  Auth: () => import('./auth'),
  Messaging: () => import('./messaging'),
  Profile: () => import('./profile'),

  // Core hooks
  Api: () => import('./api'),
  UI: () => import('./ui'),
  Business: () => import('./business'),
};

// ================================================
// DEFAULT EXPORT
// ================================================

const UnifiedHooks = {
  // Separated domain hooks
  Auth: AuthHooks,
  Messaging: MessagingHooks,
  Profile: ProfileHooks,

  // Core patterns
  Base: BaseHooks,
  Patterns: HookPatterns,
  Api: ApiHooks,
  UI: UIHooks,
  Business: BusinessHooks,

  // Lazy loading modules
  Modules: HookModules,
};

export default UnifiedHooks;
