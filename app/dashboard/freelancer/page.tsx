/**
 * ================================================
 * DEPRECATED - FREELANCER DASHBOARD PAGE
 * ================================================
 * @deprecated This page is deprecated. Use /dashboard instead.
 * Kept for backward compatibility and SEO.
 * Will redirect to main dashboard.
 *
 * Sprint Day 1 - Task 1.1: Dashboard Routing Consolidation
 * @version 2.0.0 - Deprecated, redirects to unified dashboard
 */

import { redirect } from 'next/navigation';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function FreelancerDashboardPage() {
  // Redirect to main dashboard - UnifiedDashboard will handle role-based rendering
  redirect('/dashboard');
}
