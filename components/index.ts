// ================================================
// COMPONENTS MAIN INDEX
// ================================================
// Central export hub for all components in the application
// Organized by domain-driven architecture

// ================================================
// DOMAIN-BASED EXPORTS
// ================================================
// Business domain components

// Admin Domain
export * from './domains/admin';

// Analytics Domain
export * from './domains/analytics';

// Auth Domain
export * from './domains/auth';

// Dashboard Domain
export * from './domains/dashboard';

// Jobs Domain
export * from './domains/jobs';

// Marketplace Domain
export * from './domains/marketplace';

// Messaging Domain
export * from './domains/messaging';

// Notifications Domain
export * from './domains/notifications';

// Packages Domain
export * from './domains/packages';

// Profile Domain
export * from './domains/profile';

// Search Domain
export * from './domains/search';

// Support Domain
export * from './domains/support';

// ================================================
// SHARED COMPONENTS
// ================================================
// Cross-domain shared components and utilities
// Export specific components to avoid ArticleCard conflict

export {
  InteractionButtons,
  SocialShareButton,
  ImageCarousel,
  LazyWrapper,
  createLazyComponent,
  withSuspense,
  useComponentPreloader,
  useCriticalComponentsPreloader,
  ComponentPerformanceMonitor,
  withMemo,
  getCachedComponent,
  preloadCriticalComponents,
  Progress,
  PullToRefresh,
  PWAManager,
  SecurityAlert,
  AccessibilityProvider,
  AnimatedInteractions,
  LocationPicker,
  MapView,
  ErrorState,
} from './shared';

// ================================================
// UI COMPONENTS
// ================================================
// Base UI components and design system

export * from './ui';

// ================================================
// LAYOUT COMPONENTS
// ================================================
// Layout and navigation components

export * from './layout';

// ================================================
// FORM COMPONENTS
// ================================================
// Form-related components

export * from './forms';

// ================================================
// PROVIDER COMPONENTS
// ================================================
// Context providers and wrappers

// export * from './providers'; // Temporarily disabled
