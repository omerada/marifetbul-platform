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

// Dashboard Components
export { default as AdminDashboard } from './dashboard/AdminDashboard';
export { default as AdminAnalytics } from './dashboard/AdminAnalytics';
export { default as AdminReports } from './dashboard/AdminReports';
export { default as SystemHealthWidget } from './dashboard/SystemHealthWidget';

// User Management Components
export { default as UserTable } from './users/UserTable';
export { default as BulkActions } from './users/BulkActions';

// Moderation Components
export { default as AdminModeration } from './moderation/AdminModeration';
export { default as ContentModerationQueue } from './moderation/ContentModerationQueue';
export { ContentAppealSystem } from './moderation/ContentAppealSystem';
export { default as ModerationAnalytics } from './moderation/ModerationAnalytics';
export { default as ModerationDashboard } from './moderation/ModerationDashboard';

// System & Settings Components
export { default as AdminSettings } from './system/AdminSettings';
export { default as SystemSettings } from './system/SystemSettings';
export { default as AdminSecurity } from './system/AdminSecurity';
export { default as AdminFinancialManagement } from './system/AdminFinancialManagement';
export { default as AdminLogs } from './system/AdminLogs';

// Support Components
export { default as AdminSupportTickets } from './support/AdminSupportTickets';
