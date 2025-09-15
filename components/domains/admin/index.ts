// ================================================
// ADMIN DOMAIN COMPONENTS
// ================================================
// All components related to admin functionality
// Organized by feature areas within admin domain

// Layout Components
export { AdminLayout } from './layout/AdminLayout';
export { AdminHeader } from './layout/AdminHeader';
export { AdminFooter } from './layout/AdminFooter';
export { AdminSidebar } from './layout/AdminSidebar';

// Dashboard Components
export { AdminDashboard } from './dashboard/AdminDashboard';
export { AdminAnalytics } from './dashboard/AdminAnalytics';
export { AdminReports } from './dashboard/AdminReports';
export { default as SystemHealthWidget } from './dashboard/SystemHealthWidget';

// User Management Components
export { UserTable } from './users/UserTable';
export { default as UserManagement } from './users/UserManagement';
export { default as UserReportManagement } from './users/UserReportManagement';
export { default as BulkActions } from './users/BulkActions';

// Moderation Components
export { AdminModeration } from './moderation/AdminModeration';
export { ContentModerationQueue } from './moderation/ContentModerationQueue';
export { default as ContentAppealSystem } from './moderation/ContentAppealSystem';
export { default as ModerationAnalytics } from './moderation/ModerationAnalytics';
export { default as ModerationDashboard } from './moderation/ModerationDashboard';
export { default as ModerationRulesEngine } from './moderation/ModerationRulesEngine';
export { default as AutomatedFiltering } from './moderation/AutomatedFiltering';

// System & Settings Components
export { AdminSettings } from './system/AdminSettings';
export { SystemSettings } from './system/SystemSettings';
export { AdminSecurity } from './system/AdminSecurity';
export { AdminFinancialManagement } from './system/AdminFinancialManagement';
export { AdminLogs } from './system/AdminLogs';

// Support Components
export { AdminSupportTickets } from './support/AdminSupportTickets';
