/**
 * ================================================
 * ADMIN DOMAIN COMPONENTS
 * ================================================
 * Complete admin panel component library
 *
 * @module components/domains/admin
 * @version 2.0.0
 * @production-ready ✅
 */

// Layout Components
export { default as AdminLayout } from './layout/AdminLayout';
export { default as AdminHeader } from './layout/AdminHeader';
export { default as AdminFooter } from './layout/AdminFooter';
export { default as AdminSidebar } from './layout/AdminSidebar';

// ============================================================================
// DASHBOARD COMPONENTS
// ============================================================================
// For unified admin dashboard view:
// @see @/components/domains/dashboard/views/AdminDashboardView

export { default as AdminAnalytics } from './dashboard/AdminAnalytics';
export { default as AdminReports } from './dashboard/AdminReports';
export { default as SystemHealthWidget } from './dashboard/SystemHealthWidget';

export { SystemHealthPanel } from './dashboard/SystemHealthPanel';
export { BusinessMetricsGrid } from './dashboard/BusinessMetricsGrid';
export { RecentActivitiesFeed } from './dashboard/RecentActivitiesFeed';
export { QuickAccessCards } from './dashboard/QuickAccessCards';

// User Management Components
export { default as UserTable } from './users/UserTable';
export { default as BulkActions } from './users/BulkActions';

// ============================================================================
// MODERATION COMPONENTS
// ============================================================================
// For moderator dashboard view:
// @see @/components/domains/dashboard/views/ModeratorDashboardView

export { default as AdminModeration } from './moderation/AdminModeration';
export { default as ContentModerationQueue } from './moderation/ContentModerationQueue';
export { ContentAppealSystem } from './moderation/ContentAppealSystem';
export { default as ModerationAnalytics } from './moderation/ModerationAnalytics';

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

// ============================================================================
// FINANCE COMPONENTS
// ============================================================================
export * from './finance';

// ============================================================================
// ANALYTICS COMPONENTS
// ============================================================================
export { ReportBuilder } from './analytics/ReportBuilder';

// ============================================================================
// PORTFOLIO MANAGEMENT
// ============================================================================
export { PortfolioApprovalPanel } from './portfolio/PortfolioApprovalPanel';

// ============================================================================
// ORDER MANAGEMENT
// ============================================================================
export { AdminOrdersTable } from './orders/AdminOrdersTable';
export { AdminOrderStats } from './orders/AdminOrderStats';

// ============================================================================
// REFUND & DISPUTE MANAGEMENT
// ============================================================================
export * from './refunds';

export { AdminDisputeDetailModal } from './disputes/AdminDisputeDetailModal';
export { default as DisputeResolutionModal } from './disputes/DisputeResolutionModal';
export { AdminDisputeTable } from './disputes/AdminDisputeTable';
export { AdminDisputeQueue } from './disputes/AdminDisputeQueue';
