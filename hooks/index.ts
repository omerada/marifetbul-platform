// Authentication
export { useAuth } from './useAuth';
export { useAuthGuard, usePermissions } from './useAuthGuard';

// Async Operations - NEW: Generic async operation management
export { useAsyncOperation, useAsyncAction, useMultipleAsyncOperations } from './useAsyncOperation';

// Search & Filtering - Sprint 7
export { useAdvancedSearch } from './useAdvancedSearch';
export { useEnhancedSearch } from './useEnhancedSearch';
export { useGeolocation, useLocation } from './useLocation';

// Recommendations & Favorites - Sprint 7
export { useRecommendations } from './useRecommendations';
export { useFavorites } from './useFavorites';

// Reviews & Analytics - Sprint 8
export { useReviews, useReviewSummary, useReviewForm } from './useReviews';
export {
  useAnalytics,
  useAnalyticsSummary,
  useAnalyticsChart,
  useKPICards,
} from './useAnalytics';
export {
  useReputation,
  useReputationSummary,
  useSecurityAlerts,
  useVerificationStatus,
} from './useReputation';

// Admin Panel - Sprint 10
export { useAdminDashboard } from './useAdminDashboard';
export { useUserManagement } from './useUserManagement';
export { useContentModeration } from './useContentModeration';
export { usePlatformSettings } from './usePlatformSettings';

// Help Center & Support System - Sprint 17
export {
  useHelpCenter,
  useHelpArticle,
  useHelpCenterSearch,
} from './useHelpCenter';
export {
  useSupport,
  useSupportTicket,
  useSupportSearch,
  useSupportFileUpload,
} from './useSupport';
export { useChat, useChatSession, useChatComposer } from './useChat';

// SEO & Performance - Sprint 18
export { useSEO } from './useSEO';
export { usePerformance } from './usePerformance';
export { useEnhancedPerformance } from './useEnhancedPerformance';
export { useSocialShare } from './useSocialShare';

// Job & Package Management
export { useJobs } from './useJobs';
export { useJobDetail } from './useJobDetail';
export { usePackages } from './usePackages';
export { usePackageDetail } from './usePackageDetail';
export { usePackageOrder } from './usePackageOrder';
export { useProposalForm } from './useProposalForm';

// User & Profile Management
export { useProfile } from './useProfile';
export { useDashboard } from './useDashboard';

// Communication
export { useMessages } from './useMessages';
export { useNotifications } from './useNotification';
export { useWebSocket } from './useWebSocket';

// Marketplace
export {
  useMarketplace,
  useMarketplaceJobs,
  useMarketplacePackages,
  useMarketplaceControls,
} from './useMarketplace';

// Location Services
// Already exported above in Search & Filtering section

// UI & UX
export { useToast } from './useToast';
export { useResponsive } from './useResponsive';
export { useAccessibility } from './useAccessibility';
export { useHapticFeedback } from './useHapticFeedback';
export { usePullToRefresh } from './usePullToRefresh';

// Payment
export { usePayment } from './usePayment';

// Performance & Monitoring
// Moved to SEO & Performance section above

// Push Notifications
export { usePushNotifications } from './usePushNotifications';
