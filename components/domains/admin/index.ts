// ================================================
// ADMIN DOMAIN COMPONENTS
// ================================================
// All components related to admin functionality
// Organized by feature areas within admin domain

// Layout Components
export { default as AdminLayout } from './layout/AdminLayout';
export { default as AdminHeader } from './layout/AdminHeader';
export { default as AdminFooter } from './layout/AdminFooter';
export { default as AdminSidebar } from './layout/AdminSidebar';

// Dashboard Components (Legacy - use AdminDashboardView from @/components/domains/dashboard/views)
// REMOVED: export { default as AdminDashboard } - DEPRECATED, use AdminDashboardView instead
export { default as AdminAnalytics } from './dashboard/AdminAnalytics';
export { default as AdminReports } from './dashboard/AdminReports';
export { default as SystemHealthWidget } from './dashboard/SystemHealthWidget';

// Sprint 3.2: Enhanced Dashboard Components
export { SystemHealthPanel } from './dashboard/SystemHealthPanel';
export { BusinessMetricsGrid } from './dashboard/BusinessMetricsGrid';
export { RecentActivitiesFeed } from './dashboard/RecentActivitiesFeed';
export { QuickAccessCards } from './dashboard/QuickAccessCards';

// User Management Components
export { default as UserTable } from './users/UserTable';
export { default as BulkActions } from './users/BulkActions';

// Moderation Components
export { default as AdminModeration } from './moderation/AdminModeration';
export { default as ContentModerationQueue } from './moderation/ContentModerationQueue';
export { ContentAppealSystem } from './moderation/ContentAppealSystem';
export { default as ModerationAnalytics } from './moderation/ModerationAnalytics';
// REMOVED: ModerationDashboard - Use ModeratorDashboardView from @/components/domains/dashboard/views

// Review & Comment Moderation
export * from './moderation/review-moderation-exports';

// System & Settings Components
export { default as AdminSettings } from './system/AdminSettings';
export { default as SystemSettings } from './system/SystemSettings';
export { default as AdminSecurity } from './system/AdminSecurity';
export { default as AdminFinancialManagement } from './system/AdminFinancialManagement';
export { default as AdminLogs } from './system/AdminLogs';

// Support Components
export { default as AdminSupportTickets } from './support/AdminSupportTickets';

// Refund Management Components (Sprint 1)
export * from './refunds';

// Dispute Management Components (Sprint 1.1: Consolidated from components/admin/disputes)
export { AdminDisputeDetailModal } from './disputes/AdminDisputeDetailModal';
export { default as DisputeResolutionModal } from './disputes/DisputeResolutionModal';
export { AdminDisputeTable } from './disputes/AdminDisputeTable';
export { AdminDisputeQueue } from './disputes/AdminDisputeQueue';
