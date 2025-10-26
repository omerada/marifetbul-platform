// ================================================
// SHARED COMPONENTS INDEX
// ================================================
// Central export hub for all shared/common components
// These components are used across multiple domains

// Article components
export { ArticleCard } from './ArticleCard';

// Follow system components
export { FollowButton } from './FollowButton';
export { FollowStats } from './FollowStats';
export { FollowersModal } from './FollowersModal';
export { FollowingModal } from './FollowingModal';

// Notification components
export { NotificationItem } from './NotificationItem';
export { NotificationBadge } from './NotificationBadge';
export { NotificationFilter } from './NotificationFilter';

// Interaction components
export { InteractionButtons } from './InteractionButtons';
export { default as InteractionComponents } from './InteractionButtons';

// Media components
export { ImageCarousel } from './ImageCarousel';
export { default as ImageCarouselComponent } from './ImageCarousel';
export { ImageUpload } from './ImageUpload';
export type { UploadedImage } from './ImageUpload';

// Payment & Wallet components
export { PaymentModal } from './PaymentModal';

// Performance components
export * from './performance';

// SEO components
export * from './seo';

// Social components
export * from './social';

// Mobile components
export * from './mobile';

// Filter components
export * from './filters';

// Utility components
export * from './utilities';

// Unified lazy loading system
export {
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
  // createComponentLazy, // Disabled: dynamic imports not supported in Turbopack

  // Pre-configured components
  LazyPerformanceMonitor,
  LazyAnalyticsDashboard,
  LazyPortfolioGallery,
  LazyNotificationCenter,
  LazyMapView,

  // With loading states
  PerformanceMonitorWithLoading,
  AnalyticsDashboardWithLoading,
  PortfolioGalleryWithLoading,
  NotificationCenterWithLoading,
  MapViewWithLoading,
} from './LazyComponents';

export { default as LazyComponentsUtils } from './LazyComponents';

// New organized shared components
// Mobile Components
export * from './mobile';

// Filter Components
export * from './filters';

// Utility Components
export * from './utilities';
