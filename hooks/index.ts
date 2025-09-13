// Authentication
export { useAuth } from './useAuth';
export { useAuthGuard, usePermissions } from './useAuthGuard';

// Search & Filtering - Sprint 7
export { useAdvancedSearch } from './useAdvancedSearch';
export { useEnhancedSearch } from './useEnhancedSearch';
export { useGeolocation } from './useLocation';

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
// export { useProfile } from './useProfile'; // TODO: Create if needed
// export { useDashboard } from './useDashboard'; // TODO: Create if needed

// Communication
// export { useMessages } from './useMessages'; // TODO: Create if needed
// export { useNotifications } from './useNotifications'; // TODO: Create if needed
export { useNotification } from './useNotification';
export { useWebSocket } from './useWebSocket';

// Marketplace
export {
  useMarketplace,
  useMarketplaceJobs,
  useMarketplacePackages,
  useMarketplaceControls,
} from './useMarketplace';

// Location Services
// export { useLocation } from './useLocation'; // TODO: Create if needed

// UI & UX
// export { useToast } from './useToast'; // TODO: Create if needed
export { useResponsive } from './useResponsive';
export { useAccessibility } from './useAccessibility';
export { useHapticFeedback } from './useHapticFeedback';
// export { usePullToRefresh } from './usePullToRefresh'; // TODO: Sprint 6+

// Payment
export { usePayment } from './usePayment';

// Performance & Monitoring
// Moved to SEO & Performance section above

// Push Notifications
// export { usePushNotifications } from './usePushNotifications'; // TODO: Create if needed
