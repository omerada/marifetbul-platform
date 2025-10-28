/**
 * ================================================
 * UNIFIED DASHBOARD COMPONENT
 * ================================================
 * Single dashboard component that adapts to user role
 * Replaces FreelancerDashboard, EmployerDashboard, MobileDashboard
 *
 * @author MarifetBul Development Team
 * @version 4.0.0 - Unified Dashboard Architecture
 */

'use client';

import React from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

// Import existing dashboard implementations
import { FreelancerDashboard as FreelancerDashboardImpl } from './FreelancerDashboard';
import { EmployerDashboard as EmployerDashboardImpl } from './EmployerDashboard';

// ================================================
// TYPES
// ================================================

interface UnifiedDashboardProps {
  userId?: string;
  role?: 'freelancer' | 'employer';
}

// ================================================
// COMPONENT
// ================================================

export function UnifiedDashboard({
  userId,
  role: propRole,
}: UnifiedDashboardProps) {
  const { user } = useAuthStore();

  // Determine role from props or auth store
  const effectiveRole = (propRole || user?.role) as 'freelancer' | 'employer';

  // Normalize role (handle admin/moderator as employer for dashboard)
  const role = effectiveRole === 'freelancer' ? 'freelancer' : 'employer';

  // Route to appropriate dashboard implementation
  if (role === 'freelancer') {
    return <FreelancerDashboardImpl userId={userId} />;
  }

  return <EmployerDashboardImpl userId={userId} />;
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
