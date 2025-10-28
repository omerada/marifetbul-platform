// ================================================
// DASHBOARD DOMAIN COMPONENTS
// ================================================
// All dashboard-related components across user types
// Includes freelancer, employer, and general dashboard functionality

// Core Dashboard Components (Unified)
export { default as UnifiedDashboard } from './UnifiedDashboard';
export { FreelancerDashboard } from './UnifiedDashboard';
export { EmployerDashboard } from './UnifiedDashboard';
export { MobileDashboard } from './UnifiedDashboard';

export { DashboardSidebar } from './DashboardSidebar';
export { DashboardHeader } from './DashboardHeader';

// Loading States (Sprint 1 - Epic 1.3)
export {
  DashboardSkeleton,
  DashboardSkeletonCompact,
  StatsCardSkeleton,
} from './DashboardSkeleton';

// Error Handling (Sprint 1 - Epic 1.3)
export {
  DashboardErrorBoundary,
  withDashboardErrorBoundary,
  DashboardErrorCompact,
} from './DashboardErrorBoundary';

// Dashboard Features
export { DashboardStats } from './DashboardStats';
export { DashboardCharts } from './DashboardCharts';
export { StatsCard } from './StatsCard';
export { QuickActions } from './QuickActions';
export { ActivityTimeline } from './ActivityTimeline';

// Advanced Analytics for Dashboard
export { Sprint8AnalyticsDashboard as AdvancedAnalyticsDashboard } from '../analytics';
