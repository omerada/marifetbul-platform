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
export { useAsyncOperation } from './core/useUnifiedAsync';
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
export { useProfileEdit } from './business/useProfileEdit';
export { useProposalForm } from './business/useProposalForm';
export { useDashboard } from './business/useDashboard';
export { useAdminDashboard } from './business/useAdminDashboard';
export { useUserManagement } from './business/useUserManagement';
export { useContentModeration } from './business/useContentModeration';
export { useSupport, useSupportTicket } from './business/useSupport';
export { useHelpCenter } from './business/useHelpCenter';
// Business hooks
export * from './business/useOrder';
export * from './business/useReviews';
export * from './business/useReviewStore';
export * from './business/useReviewEligibility';
export * from './business/useAdminReviews';
export { useSellerReviews } from './business/useSellerReviews';
export { useReviewNotifications } from './business/useReviewNotifications';
export { useReputation } from './business/useReputation';
export { useFollow } from './business/useFollow';
export { useFollowersList } from './business/useFollowersList';
export { useFollowingList } from './business/useFollowingList';
export { useJobProposals } from './business/useJobProposals';
export type {
  JobProposalSummary,
  JobProposalMap,
} from './business/useJobProposals';
export { useAutoRefresh } from './business/useAutoRefresh';
export type {
  UseAutoRefreshOptions,
  UseAutoRefreshResult,
} from './business/useAutoRefresh';
export { useRetry } from './business/useRetry';
export type { UseRetryOptions, UseRetryResult } from './business/useRetry';

// DATA HOOKS - Analytics, search, and data management
export { useAnalytics } from './infrastructure/data/useAnalytics';
export {
  useJobFilters,
  useSearchSuggestions,
} from './infrastructure/data/useFilters';
export { useJobFilters as useFilters } from './infrastructure/data/useFilters'; // Alias for backward compatibility
export { useUnifiedSearch } from './infrastructure/data/useUnifiedSearch';
export { useRecommendations } from './infrastructure/data/useRecommendations';
export { useFavorites } from './infrastructure/data/useFavorites';
export { useEnhancedPerformance } from './infrastructure/data/useEnhancedPerformanceUnified';

// UI HOOKS - User interface and experience
export { useResponsive } from './shared/ui/useResponsive';
export {
  useAccessibility,
  useFocusTrap,
  useSkipToContent,
  useAnnouncer,
} from './shared/ui/useAccessibility';
export { useHapticFeedback } from './shared/ui/useHapticFeedback';
export { usePullToRefresh } from './shared/ui/usePullToRefresh';

// INTEGRATION HOOKS - External services and APIs
export { useWebSocket } from './infrastructure/integrations/useWebSocket';
export { usePushNotifications } from './infrastructure/integrations/usePushNotifications';
export { useSocialShare } from './infrastructure/integrations/useSocialShare';
export { useSEO } from './infrastructure/integrations/useSEO';
export { useUnifiedLocation } from './infrastructure/integrations/useUnifiedLocation';
export { usePlatformSettings } from './infrastructure/integrations/usePlatformSettings';

// MESSAGING HOOKS - Basic messaging (chat support removed)
export {
  useMessages,
  useConversations,
  useConversation,
  useMessaging,
  useUnreadCount,
  useMessageTemplates,
  useContextMessage,
  useMessageAttachments,
} from './business/messaging';
export type { MessageAttachment } from './business/messaging';

// LEGACY COMPATIBILITY - For backwards compatibility
export * from './infrastructure/api';
export * from './shared/base';
export * from './shared/ui';

// Explicitly re-export useAvatarUpload from profile to resolve ambiguity
export { useAvatarUpload } from './business/profile';

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
