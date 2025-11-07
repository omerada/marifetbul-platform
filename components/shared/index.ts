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
export { CopyButton } from './CopyButton';
export { Footer } from './Footer';
export { Header } from './Header';
export { Hero } from './Hero';
export { LoadingSpinner } from './LoadingSpinner';
export { Navbar } from './Navbar';
export { NotificationBanner } from './NotificationBanner';
export { Pagination } from './Pagination';
export { SearchBar } from './SearchBar';
export { ShareButton } from './ShareButton';
export { Sidebar } from './Sidebar';
export { SocialLinks } from './SocialLinks';
export { Tag } from './Tag';
export { TagCloud } from './TagCloud';
export { ErrorMessage } from './ErrorMessage';
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
