// ================================================
// UNIFIED HOOKS SYSTEM - MAIN EXPORT INDEX
// ================================================
// Central export for all standardized hooks with consistent patterns
// Replaces: 44 individual hook files with duplicate patterns

// ================================================
// BASE HOOKS - CORE PATTERNS
// ================================================
export * from './base';
export { default as BaseHooks } from './base';

// ================================================
// API HOOKS - STANDARDIZED API INTERACTIONS
// ================================================
export * from './api';
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
// Maintain backward compatibility for existing components

// Auth hooks (legacy compatibility)
export { useAuth, useCurrentUser } from './api';
export { useAuthState } from './business';

// Admin hooks (legacy compatibility)
export { useAdminDashboard } from './useAdminDashboard';

// Job/Package detail hooks (legacy compatibility)
export { useJobDetail } from './useJobDetail';
export { usePackageDetail } from './usePackageDetail';

// Search hooks (legacy compatibility)
export { useJobsSearch, usePackagesSearch, useUserSearch } from './api';
export { useUnifiedSearch } from './business';

// UI interaction hooks (legacy compatibility)
export { useModal, useForm, useTheme, useSidebar, useClipboard } from './ui';

// Core optimized hooks
export { useToast } from './useToast';
export { default as useNotification } from './core/useNotification';

// UI responsive hooks (legacy compatibility)
export { useResponsive } from './useResponsive';

// Base utility hooks (legacy compatibility)
export {
  useAsyncOperation,
  useMutation,
  usePagination,
  useDebounce,
  useDebouncedCallback,
  useThrottledCallback,
  useLocalStorage,
  usePrevious,
  useMediaQuery,
  useIntersectionObserver,
} from './base';

// Business logic hooks (legacy compatibility)
export {
  useFavoritesManager,
  useFilterManager,
  useBreadcrumbs,
  useNotificationManager,
  usePerformanceMonitor,
} from './business';

// Additional feature hooks (legacy compatibility)
export { useHapticFeedback } from './useHapticFeedback';
export { useReputation } from './useReputation';
export { useReviews, useReviewForm } from './useReviews';

// ================================================
// HOOK CATEGORIES FOR ORGANIZED IMPORTS
// ================================================

// Base patterns for custom hook development
export const BasePatterns = {
  useAsyncOperation: () => import('./base').then((m) => m.useAsyncOperation),
  useMutation: () => import('./base').then((m) => m.useMutation),
  usePagination: () => import('./base').then((m) => m.usePagination),
  useDebounce: () => import('./base').then((m) => m.useDebounce),
  useLocalStorage: () => import('./base').then((m) => m.useLocalStorage),
};

// API interaction patterns
export const ApiPatterns = {
  useAuth: () => import('./api').then((m) => m.useAuth),
  useCurrentUser: () => import('./api').then((m) => m.useCurrentUser),
  useJobsSearch: () => import('./api').then((m) => m.useJobsSearch),
  usePackagesSearch: () => import('./api').then((m) => m.usePackagesSearch),
  useUserSearch: () => import('./api').then((m) => m.useUserSearch),
};

// UI interaction patterns
export const UIPatterns = {
  useModal: () => import('./ui').then((m) => m.useModal),
  useToast: () => import('./ui').then((m) => m.useToast),
  useForm: () => import('./ui').then((m) => m.useForm),
  useTheme: () => import('./ui').then((m) => m.useTheme),
  useSidebar: () => import('./ui').then((m) => m.useSidebar),
};

// Business logic patterns
export const BusinessPatterns = {
  useAuthState: () => import('./business').then((m) => m.useAuthState),
  useUnifiedSearch: () => import('./business').then((m) => m.useUnifiedSearch),
  useFavoritesManager: () =>
    import('./business').then((m) => m.useFavoritesManager),
  useFilterManager: () => import('./business').then((m) => m.useFilterManager),
};

// ================================================
// HOOK USAGE GUIDELINES
// ================================================

/**
 * HOOK SELECTION GUIDE:
 *
 * 1. BASE HOOKS (hooks/base/):
 *    - useAsyncOperation: Generic async state management
 *    - useMutation: Generic mutation operations
 *    - usePagination: Generic pagination logic
 *    - useDebounce: Value debouncing
 *    - useLocalStorage: Persistent local storage
 *    - useMediaQuery: Responsive breakpoint detection
 *
 * 2. API HOOKS (hooks/api/):
 *    - useAuth: Authentication operations
 *    - useCurrentUser: Current user state
 *    - useJobsSearch: Job search with pagination
 *    - usePackagesSearch: Package search with pagination
 *    - useUserSearch: User search with pagination
 *    - useFavorites: Favorites management
 *    - useNotifications: Notification management
 *
 * 3. UI HOOKS (hooks/ui/):
 *    - useModal: Modal state management
 *    - useToast: Toast notification system
 *    - useForm: Form state and validation
 *    - useTheme: Theme switching (light/dark/system)
 *    - useSidebar: Sidebar toggle state
 *    - useClipboard: Copy to clipboard
 *    - useScrollPosition: Scroll position tracking
 *    - useKeyboardShortcut: Keyboard shortcut handling
 *
 * 4. BUSINESS HOOKS (hooks/business/):
 *    - useAuthState: Authentication business logic
 *    - useUnifiedSearch: Combined search across entities
 *    - useFavoritesManager: Optimistic favorites management
 *    - useFilterManager: Generic filter management
 *    - useBreadcrumbs: Breadcrumb navigation
 *    - useAnalyticsTracker: Event tracking
 *    - useNotificationManager: UI notification management
 *    - usePerformanceMonitor: Performance metrics
 */

// ================================================
// MIGRATION HELPERS
// ================================================

/**
 * LEGACY HOOK MIGRATION:
 *
 * Old Pattern -> New Pattern:
 *
 * // Before (multiple files)
 * import { useAuth } from './hooks/useAuth'
 * import { useJobs } from './hooks/useJobs'
 * import { useModal } from './hooks/useModal'
 *
 * // After (unified import)
 * import { useAuth, useJobsSearch, useModal } from './hooks'
 *
 * // Or category-specific imports
 * import { useAuth } from './hooks/api'
 * import { useModal } from './hooks/ui'
 * import { useAuthState } from './hooks/business'
 */

// ================================================
// DEFAULT EXPORT
// ================================================

const UnifiedHooks = {
  // Patterns for lazy loading
  BasePatterns,
  ApiPatterns,
  UIPatterns,
  BusinessPatterns,
};

export default UnifiedHooks;
