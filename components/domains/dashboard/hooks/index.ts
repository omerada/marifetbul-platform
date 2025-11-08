/**
 * @fileoverview Dashboard Hooks - Main Index
 * @module components/domains/dashboard/hooks
 *
 * Custom React hooks for dashboard functionality.
 * Connects components to unified dashboard store.
 *
 * @created 2025-11-01
 * @sprint Sprint 1 - Day 5
 */

// Main hooks
export { useDashboard } from '@/hooks/business/useDashboard'; // Sprint 2: Removed useDashboardRefresh deprecated export

export {
  useDashboardPermissions,
  usePermission,
} from './useDashboardPermissions';
export type {
  DashboardPermissions,
  PermissionCheck,
  UseDashboardPermissionsReturn,
} from './useDashboardPermissions';

// ============================================================================
// STATUS: 2/2 hooks complete (100% - Day 5 DONE!)
// ALL HOOKS COMPLETE! ✅
// ============================================================================
