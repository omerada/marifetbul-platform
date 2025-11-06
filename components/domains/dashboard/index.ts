// ================================================
// DASHBOARD DOMAIN COMPONENTS
// ================================================
// All dashboard-related components across user types
// Includes freelancer, employer, and general dashboard functionality
//
// Sprint 1 - Story 1.1: Dashboard Consolidation (2025-10-29 - 2025-11-01)
// - Phase 1: DashboardClient merged into UnifiedDashboard (2025-10-29)
// - Phase 2: New unified architecture with role-aware views (2025-11-01)
// - Backward compatibility maintained through deprecated exports

// ============================================================================
// TYPES (Sprint 1 - Task 1.3) - 2025-11-01
// ============================================================================
export * from './types/dashboard.types';

// ============================================================================
// CORE DASHBOARD COMPONENTS (EXISTING - Backward Compatible)
// ============================================================================
export { default as UnifiedDashboard } from './UnifiedDashboard';
export { DashboardSidebar } from './DashboardSidebar';
export { DashboardHeader } from './DashboardHeader';

// ============================================================================
// LOADING STATES (Sprint 1 - Epic 1.3) - EXISTING
// ============================================================================
export {
  DashboardSkeleton,
  DashboardSkeletonCompact,
  StatsCardSkeleton,
} from './DashboardSkeleton';

// ============================================================================
// ERROR HANDLING (Sprint 1 - Epic 1.3) - EXISTING
// ============================================================================
export {
  DashboardErrorBoundary,
  withDashboardErrorBoundary,
  DashboardErrorCompact,
} from './DashboardErrorBoundary';

// ============================================================================
// DASHBOARD FEATURES - EXISTING (Will be refactored Day 3-4)
// ============================================================================
export { DashboardStats } from './DashboardStats';
export { DashboardCharts } from './DashboardCharts';
// ================================================
// DEPRECATED - Removed in Sprint 1 Day 3 (2025-11-06)
// ================================================
// StatsCard - DELETED (0 usage)
// Use: @/components/domains/dashboard/widgets (StatsCard with advanced features)
// ================================================
export { QuickActions } from './QuickActions';
export { ActivityTimeline } from './ActivityTimeline';

// ============================================================================
// ADVANCED ANALYTICS - EXISTING
// ============================================================================
export { Sprint8AnalyticsDashboard as AdvancedAnalyticsDashboard } from '../analytics';

// ============================================================================
// NEW UNIFIED DASHBOARD SYSTEM (Sprint 1 - Day 6-8) - 2025-11-02
// ============================================================================

// Role-specific views (Day 6-7) ✅ COMPLETE
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

// Shared widgets (Day 3-4) ✅ COMPLETE
export * from './widgets';

// Hooks (Day 5) ✅ COMPLETE
export { useDashboard } from './hooks/useDashboard';
export { useDashboardPermissions } from './hooks/useDashboardPermissions';

// Utilities (Day 5) ✅ COMPLETE
// ============================================================================
// UTILITIES
// ============================================================================

export * from './utils/dashboardHelpers';
export * from './utils/dashboardAdapters';
