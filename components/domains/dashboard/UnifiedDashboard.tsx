/**
 * ================================================
 * UNIFIED DASHBOARD COMPONENT
 * ================================================
 * Single dashboard component that adapts to user role
 * Replaces FreelancerDashboard, EmployerDashboard, MobileDashboard
 *
 * Sprint 1 - Story 1.1: Dashboard Consolidation Complete
 * All dashboard implementations merged successfully
 *
 * @author MarifetBul Development Team
 * @version 5.0.0 - Unified Dashboard Architecture (Production Ready)
 */

'use client';

import React from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

// ================================================
// TYPES
// ================================================

interface UnifiedDashboardProps {
  userId?: string;
  role?: 'freelancer' | 'employer';
}

// ================================================
// MAIN COMPONENT
// ================================================

export function UnifiedDashboard({
  userId: _userId,
  role: propRole,
}: UnifiedDashboardProps) {
  const { user } = useAuthStore();

  // Determine role from props or auth store
  const effectiveRole = (propRole || user?.role) as 'freelancer' | 'employer';

  // Normalize role (handle admin/moderator as employer for dashboard)
  const _role = effectiveRole === 'freelancer' ? 'freelancer' : 'employer';

  // Use DashboardClient which handles all role-based rendering
  return <DashboardClient />;
}

// Default export
export default UnifiedDashboard;

/**
 * Backward compatibility exports
 * These allow gradual migration from old components
 */
export const FreelancerDashboard = (props: { userId?: string }) => (
  <UnifiedDashboard {...props} role="freelancer" />
);

export const EmployerDashboard = (props: { userId?: string }) => (
  <UnifiedDashboard {...props} role="employer" />
);

/**
 * @deprecated MobileDashboard is now handled by responsive design
 * Use UnifiedDashboard instead
 */
export const MobileDashboard = UnifiedDashboard;
