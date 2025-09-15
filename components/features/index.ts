// ================================================
// FEATURES INDEX (DEPRECATED)
// ================================================
// This file is deprecated. Components have been moved to domain-based structure.
// Please import from appropriate domains:
//
// - Admin components: @/components/domains/admin
// - Analytics components: @/components/domains/analytics
// - Auth components: @/components/domains/auth
// - Dashboard components: @/components/domains/dashboard
// - Jobs components: @/components/domains/jobs
// - Marketplace components: @/components/domains/marketplace
// - Messaging components: @/components/domains/messaging
// - Notifications components: @/components/domains/notifications
// - Packages components: @/components/domains/packages
// - Profile components: @/components/domains/profile
// - Search components: @/components/domains/search
// - Support components: @/components/domains/support
// - Shared components: @/components/shared

// Temporary re-exports for backward compatibility
// TODO: Update all imports to use domain-based structure

// Admin domain
export {
  AdminLayout,
  AdminHeader,
  AdminFooter,
  AdminSidebar,
  AdminDashboard,
  AdminAnalytics,
  AdminReports,
  SystemHealthWidget,
  UserTable,
  UserManagement,
  UserReportManagement,
  BulkActions,
  AdminModeration,
  ContentModerationQueue,
  ContentAppealSystem,
  ModerationAnalytics,
  ModerationDashboard,
  ModerationRulesEngine,
  AutomatedFiltering,
  AdminSettings,
  SystemSettings,
  AdminSecurity,
  AdminFinancialManagement,
  AdminLogs,
  AdminSupportTickets,
} from '@/components/domains/admin';

// Analytics domain
export {
  AnalyticsDashboard,
  Sprint8AnalyticsDashboard,
  SearchAnalyticsDashboard,
} from '@/components/domains/analytics';

// Dashboard domain
export {
  ActivityTimeline,
  DashboardCharts,
  DashboardSkeleton,
  DashboardStats,
  EmployerDashboard,
  FreelancerDashboard,
  MobileDashboard,
  QuickActions,
  StatsCard,
} from '@/components/domains/dashboard';

// Jobs domain
export {
  JobDetail,
  JobDetailSkeleton,
  ProposalForm,
  ProposalCard,
  ProposalModal,
} from '@/components/domains/jobs';

// Marketplace domain
export {
  MarketplaceHeader,
  MobileMarketplace,
  RecommendationCard,
  FavoritesManager,
} from '@/components/domains/marketplace';

// Messaging domain
export {
  ChatWindow,
  ChatInterface,
  MessagesList,
} from '@/components/domains/messaging';

// Notifications domain
export {
  NotificationCenter,
  NotificationModal,
  NotificationItem,
  NotificationSettingsPanel,
  PushNotificationToggle,
} from '@/components/domains/notifications';

// Packages domain
export {
  PackageDetail,
  ServiceDetail,
  OrderForm,
  OrderTimeline,
  PaymentHistory,
  InvoiceCard,
} from '@/components/domains/packages';

// Profile domain
export {
  FreelancerProfile,
  EmployerProfile,
  ProfileView,
  ProfileEditForm,
  ProfileAvatarSection,
  AvatarUpload,
  AvatarGallery,
  AvatarModal,
  PortfolioGallery,
  PortfolioModal,
  ReputationScore,
  ReviewCard,
  ReviewForm,
  ReviewList,
  ReviewReply,
} from '@/components/domains/profile';

// Search domain
export {
  AdvancedSearch,
  AdvancedSearchForm,
  UniversalSearch,
  LocationSearch,
  EnhancedFilters,
  EnhancedSearchSystem,
  SearchAutocomplete,
} from '@/components/domains/search';

// Support domain
export {
  HelpCenterMain,
  HelpCenterLayout,
  ArticleCard,
  CategoryGrid,
  HelpSearchResults,
  ArticleRating,
} from '@/components/domains/support';

// Shared components
export {
  // Legacy shared components
  ArticleCard as SharedArticleCard,
  InteractionButtons,
  SocialShareButton,
  InteractionComponents,
  ImageCarousel,
  ImageCarouselComponent,

  // Lazy loading system
  LazyWrapper,
  createLazyComponent,
  withSuspense,
  useComponentPreloader,
  useCriticalComponentsPreloader,
  ComponentPerformanceMonitor,
  withMemo,
  getCachedComponent,
  preloadCriticalComponents,
  optimizeBundle,
  createComponentLazy,
  LazyPerformanceMonitor,
  LazyAnalyticsDashboard,
  LazyPortfolioGallery,
  LazyNotificationCenter,
  LazyMapView,
  PerformanceMonitorWithLoading,
  AnalyticsDashboardWithLoading,
  PortfolioGalleryWithLoading,
  NotificationCenterWithLoading,
  MapViewWithLoading,
  LazyComponentsUtils,

  // Mobile components
  MobileLayout,
  MobileNavigation,
  MobileFilters,
  MobileFiltersSheet,
  MobileFiltersSheetDefault,
  MobileJobFilters,
  MobilePackageFilters,

  // Filter components
  JobFilters,
  PackageFiltersComponent,
  PackageFilters,

  // Utility components
  Progress,
  PullToRefresh,
  PWAManager,
  SecurityAlert,
  AccessibilityProvider,
  AnimatedInteractions,
  TouchJobCard,
  TouchServiceCard,
  LocationPicker,
  MapView,
  PerformanceMonitor,
  ErrorState,
} from '@/components/shared';
