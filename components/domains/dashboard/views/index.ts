/**
 * @fileoverview Dashboard Views - Main Index
 * @module components/domains/dashboard/views
 *
 * Role-specific dashboard view components.
 * Each view is customized for a specific user role.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 6
 */

// Role-specific views
export { FreelancerDashboardView } from './FreelancerDashboardView';
export type { FreelancerDashboardViewProps } from './FreelancerDashboardView';

export { EmployerDashboardView } from './EmployerDashboardView';
export type { EmployerDashboardViewProps } from './EmployerDashboardView';

export { AdminDashboardView } from './AdminDashboardView';
export type { AdminDashboardViewProps } from './AdminDashboardView';

export { ModeratorDashboardView } from './ModeratorDashboardView';
export type { ModeratorDashboardViewProps } from './ModeratorDashboardView';

// ============================================================================
// STATUS: 4/4 views complete (100% - Day 7 COMPLETE! 🎉)
// COMPLETED: All role-specific dashboard views ✅
// - FreelancerDashboardView
// - EmployerDashboardView
// - AdminDashboardView
// - ModeratorDashboardView
// ============================================================================
