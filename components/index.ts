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
export { ErrorAlert, InlineError, FieldErrors } from './shared/ErrorAlert';
export {
  ApiErrorBoundary,
  withApiErrorBoundary,
} from './shared/ApiErrorBoundary';

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
  ErrorState,
} from './shared';

// ================================================
// WALLET COMPONENTS
// ================================================
// Wallet and financial management components

export { WalletDashboard } from './wallet/WalletDashboard';
export { WalletCard } from './wallet/WalletCard';
/** @deprecated Use TransactionDisplay instead */ export { TransactionHistory } from './wallet/TransactionHistory';
export { EscrowViewer } from './domains/wallet/EscrowViewer';
export { CommissionBreakdown } from './domains/wallet/CommissionBreakdown';
export { PayoutRequestWizard } from './domains/wallet/PayoutRequestWizard';
export { PayoutStatusTracker } from './domains/wallet/PayoutStatusTracker';
export { TransactionDisplay } from './domains/wallet/TransactionDisplay';

// ================================================
// Admin Components
export { AdminPayoutApprovalWidget } from './admin/payouts/AdminPayoutApprovalWidget';

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
