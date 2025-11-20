// ================================================
// COMPONENTS MAIN INDEX - MODERNIZED
// ================================================
// Clean, organized export hub for production-ready components
// Optimized for performance with selective loading

// ================================================
// CORE UI COMPONENTS - ALWAYS LOADED
// ================================================
// Essential design system components

export * from './ui';

// ================================================
// LAYOUT COMPONENTS
// ================================================
// Application structure and navigation

export * from './layout';

// ================================================
// FORM COMPONENTS
// ================================================
// User input and data collection

export * from './forms';

// ================================================
// SHARED COMPONENTS
// ================================================
// Cross-domain reusable components

export * from './shared';
// Removed deprecated: ErrorAlert, ApiErrorBoundary
// Use: UnifiedErrorBoundary from './ui'

// ================================================
// PROVIDER COMPONENTS
// ================================================
// Context providers and state management

export * from './providers';

// ================================================
// DOMAIN COMPONENTS - LAZY LOADED
// ================================================
// Business logic components - loaded on demand
// Export specific components to avoid ArticleCard conflict

export {
  InteractionButtons,
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
  // ErrorState, // REMOVED - Use SimpleErrorDisplay from @/components/ui instead
} from './shared';

// ================================================
// WALLET COMPONENTS
// ================================================
// Wallet and financial management components

// ⚠️ Canonical wallet components from domains/wallet
export { WalletDashboard } from './domains/wallet/WalletDashboard';
export type { WalletDashboardProps } from './domains/wallet/WalletDashboard';

// Other wallet components
// WalletCard removed (unused - use BalanceCard instead)
// EscrowViewer - DELETED (Sprint 2 Cleanup) - Unused component, use EscrowList instead
export { CommissionBreakdown } from './domains/wallet/CommissionBreakdown';
export { PayoutStatusTracker } from './domains/wallet/PayoutStatusTracker';
export { TransactionDisplay } from './domains/wallet/TransactionDisplay';
export { default as TransactionExportButtons } from './domains/wallet/core/TransactionExportButtons';

// ================================================
// ADMIN COMPONENTS (Sprint 1 - Consolidated)
// ================================================
// ⚠️ DEPRECATED: Direct imports from @/components/admin
// ✅ USE: @/components/domains/admin for all admin components
//
// All admin components moved to canonical location:
// @/components/domains/admin/
//
// Finance: @/components/domains/admin/finance
// Analytics: @/components/domains/admin/analytics
// Orders: @/components/domains/admin/orders
// Portfolio: @/components/domains/admin/portfolio
// etc.
//
// For backwards compatibility, re-export from domains:
export * from './domains/admin';
