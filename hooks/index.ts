// HOOKS - REORGANIZED EXPORT INDEX
// Clean, organized export structure by category

// CORE HOOKS - Essential app functionality
// Updated to use unified auth from shared
export { useAuth } from './shared/useAuth';
export { useAuthGuard } from './core/useAuthGuard';
export { useToast, ToastContext } from './core/useToast';
export type {
  ToastData,
  ToastOptions,
  ToastContextType,
} from './core/useToast';
export { useAsyncOperation } from './core/useAsyncOperation';
export { useNotification } from './core/useNotification';

// BUSINESS HOOKS - Domain logic and business features
export { useJobs } from './business/useJobs';
export { useJobDetail } from './business/useJobDetail';
export { usePackages } from './business/usePackages';
export { usePackageDetail } from './business/usePackageDetail';
export { usePackageOrder } from './business/usePackageOrder';
export { usePayment } from './business/usePayment';
export { useMarketplace } from './business/useMarketplace';
export { useProfile, useProfileValidation } from './business/useProfile';
export { useProposalForm } from './business/useProposalForm';
export { useDashboard } from './business/useDashboard';
export { useAdminDashboard } from './business/useAdminDashboard';
export { useUserManagement } from './business/useUserManagement';
export { useContentModeration } from './business/useContentModeration';
export { useSupport, useSupportTicket } from './business/useSupport';
export { useHelpCenter } from './business/useHelpCenter';
export { useReviews, useReviewForm } from './business/useReviews';
export { useReputation } from './business/useReputation';

// DATA HOOKS - Analytics, search, and data management
export { useAnalytics } from './data/useAnalytics';
export { useJobFilters, useSearchSuggestions } from './data/useFilters';
export { useJobFilters as useFilters } from './data/useFilters'; // Alias for backward compatibility
export { useUnifiedSearch } from './data/useUnifiedSearch';
export { useRecommendations } from './data/useRecommendations';
export { useFavorites } from './data/useFavorites';
export { useEnhancedPerformance } from './data/useEnhancedPerformanceUnified';

// UI HOOKS - User interface and experience
export { useResponsive } from './ui/useResponsive';
export {
  useAccessibility,
  useFocusTrap,
  useSkipToContent,
  useAnnouncer,
} from './ui/useAccessibility';
export { useHapticFeedback } from './ui/useHapticFeedback';
export { usePullToRefresh } from './ui/usePullToRefresh';

// INTEGRATION HOOKS - External services and APIs
export { useWebSocket } from './integrations/useWebSocket';
export { usePushNotifications } from './integrations/usePushNotifications';
export { useSocialShare } from './integrations/useSocialShare';
export { useSEO } from './integrations/useSEO';
export { useUnifiedLocation } from './integrations/useUnifiedLocation';
export { usePlatformSettings } from './integrations/usePlatformSettings';

// MESSAGING HOOKS - Chat and communication
export { useChat } from './messaging/useChat';
export {
  useMessages,
  useConversations,
  useConversation,
  useMessaging,
  useUnreadCount,
} from './messaging/useMessages';

// LEGACY COMPATIBILITY - For backwards compatibility
export * from './api';
export * from './auth';
export * from './base';
export * from './profile';
export * from './business';
export * from './ui';

// Hook categories
export const CoreHooks = [
  'useAuth',
  'useAuthGuard',
  'useToast',
  'useAsyncOperation',
] as const;
export const BusinessHooks = [
  'useJobs',
  'useJobDetail',
  'usePackages',
  'useProfile',
] as const;
export const DataHooks = [
  'useAnalytics',
  'useJobFilters',
  'useUnifiedSearch',
] as const;
export const UIHooks = [
  'useResponsive',
  'useAccessibility',
  'useHapticFeedback',
] as const;
