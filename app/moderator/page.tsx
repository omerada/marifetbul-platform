/**
 * ================================================
 * MODERATOR DASHBOARD PAGE
 * ================================================
 * Moderator rolü için dashboard sayfası
 * UnifiedDashboard'a redirect eder
 *
 * Sprint: Dashboard Consolidation
 * @version 2.0.0
 * @refactored 2025-11-04
 */

'use client';

import { redirect } from 'next/navigation';

/**
 * Moderator page now redirects to unified dashboard
 * UnifiedDashboard will render ModeratorDashboardView based on role
 * Sprint: Moderator Dashboard Consolidation
 */
export default function ModeratorDashboardPage() {
  redirect('/dashboard');
}
