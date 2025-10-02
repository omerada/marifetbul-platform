/**
 * Optimized Store Architecture
 * Consolidated and performance-optimized state management
 */

// === CORE STORES ===
// Essential application state

// Auth store - core authentication state
export { useAuthStore as default } from './domains/auth/authStore';

// Theme store - global theme management
export { useThemeStore } from './theme';

// Notification store - optimized notifications
export { useNotificationStore } from './notification';

// === FEATURE STORES ===
// Feature-specific state management

// Marketplace & Jobs

export { useJobDetailStore } from './jobDetail';
export { usePackageDetailStore } from './packageDetail';

// Payment & Orders
export { usePaymentStore } from './payment';

// Search & Recommendations
export { useAdvancedSearchStore } from './advanced-search';
export { useRecommendationStore } from './recommendations';
export { useFavoritesStore } from './favorites';

// Location services
export { useLocationStore } from './location';

// === DOMAIN STORES ===
// Business domain specific stores

// Reviews & Reputation (consolidated)
export { useReviewStore } from './domains/reviews/reviewStore';
export { useReputationStore } from './domains/reputation/reputationStore';

// Analytics (lightweight)
export { useAnalyticsStore } from './domains/analytics/analyticsStore';

// === ADMIN STORES ===
// Administrative functionality

export { useAdminDashboardStore } from './admin-dashboard';
export { useAdminUserStore } from './admin-users';
export { useAdminModerationStore } from './admin-moderation';
export { useAdminSettingsStore } from './admin-settings';

// === UI STORES ===
// UI state management

export { default as uiSelectors } from './domains/ui/uiStore';

// === MESSAGING & SOCIAL ===
// Communication features

export { useMessagingStore } from './messaging';
export { useSocialStore } from './social';

// === UTILITY STORES ===
// Supporting functionality

export { useHelpCenterStore } from './help-center';
export { useSupportStore } from './support';
export { usePerformanceStore } from './performance';
export { useSearchStore } from './search';
export { useSEOStore } from './seo';

// === OPTIMIZED UTILITIES ===
// Performance and optimization tools

export {
  createOptimizedStore,
  createCleanupStore,
  StorePerformanceMonitor,
  globalPerformanceMonitor,
  createDebouncedAction,
  createThrottledAction,
  createBatchedAction,
  shallowEqual,
  createMemoizedSelector,
} from './optimized';
