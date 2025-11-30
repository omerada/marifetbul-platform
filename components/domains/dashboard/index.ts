/**
 * ================================================
 * DASHBOARD DOMAIN COMPONENTS
 * ================================================
 * Unified dashboard system with role-specific views
 * Supports: Admin, Freelancer, Employer, Moderator
 *
 * @module components/domains/dashboard
 * @version 2.0.0
 * @production-ready ✅
 */

// ============================================================================
// TYPES
// ============================================================================
export * from './types/dashboard.types';

// ============================================================================
// CORE COMPONENTS
// ============================================================================
export { default as UnifiedDashboard } from './UnifiedDashboard';
export { DashboardSidebar } from './DashboardSidebar';

// ============================================================================
// LOADING STATES
// ============================================================================
export {
  DashboardSkeleton,
  DashboardSkeletonCompact,
  StatsCardSkeleton,
} from './DashboardSkeleton';

// ============================================================================
// ERROR HANDLING
// ============================================================================
export {
  DashboardErrorBoundary,
  withDashboardErrorBoundary,
  DashboardErrorCompact,
} from './DashboardErrorBoundary';

// ============================================================================
// ROLE-SPECIFIC VIEWS
// ============================================================================
export {
  AdminDashboardView,
  EmployerDashboardView,
  FreelancerDashboardView,
  ModeratorDashboardView,
} from './views';

export type {
  AdminDashboardViewProps,
  EmployerDashboardViewProps,
  FreelancerDashboardViewProps,
  ModeratorDashboardViewProps,
} from './views';
export * from './widgets';

// ============================================================================
// DASHBOARD WIDGETS
// ============================================================================
export * from './widgets';

// export { useDashboard } from './hooks/useDashboard';
export { useDashboardPermissions } from './hooks/useDashboardPermissions';

// ============================================================================
// UTILITIES
// ============================================================================
export * from './utils/dashboardAdapters';
