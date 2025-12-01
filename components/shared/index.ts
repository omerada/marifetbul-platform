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
export { NotificationBadge } from './NotificationBadge';
export { NotificationFilter } from './NotificationFilter';

// Interaction components
export { InteractionButtons } from './InteractionButtons';

// Media components
export { ImageCarousel } from './ImageCarousel';
export { ImageUpload } from './ImageUpload';
export type { UploadedImage } from './ImageUpload';

// Payment & Wallet components
// REMOVED: PaymentModal (DEPRECATED - Use UnifiedCheckout from @/components/checkout)

// Review components
export { ReviewPromptCard } from './ReviewPromptCard';
export type { ReviewPromptCardProps } from './ReviewPromptCard';

// Password & Authentication components (Sprint 1.3)
export {
  PasswordStrengthIndicator,
  calculatePasswordStrength,
} from './PasswordStrengthIndicator';
export type { PasswordStrength } from './PasswordStrengthIndicator';

// Email Verification components (Sprint 1.4)
export { EmailVerificationBanner } from './EmailVerificationBanner';

// OTP Input (Sprint 1 - Story 1.3)
export { OTPInput } from './OTPInput';
export type { OTPInputProps } from './OTPInput';

// Circular Progress (Sprint 1 - Story 1.5)
export {
  CircularProgress,
  MultiColorCircularProgress,
} from './CircularProgress';
export type {
  CircularProgressProps,
  MultiColorCircularProgressProps,
} from './CircularProgress';

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

// Dashboard components
export * from './dashboard';

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
  // LazyAnalyticsDashboard - REMOVED (deprecated component)
  LazyPortfolioGallery,
  LazyNotificationCenter,
  LazyMapView,

  // With loading states
  PerformanceMonitorWithLoading,
  // AnalyticsDashboardWithLoading - REMOVED (deprecated component)
  PortfolioGalleryWithLoading,
  NotificationCenterWithLoading,
  MapViewWithLoading,
} from './LazyComponents';

export { default as LazyComponentsUtils } from './LazyComponents';
