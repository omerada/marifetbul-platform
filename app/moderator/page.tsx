'use client';

import { redirect } from 'next/navigation';

/**
 * ================================================
 * MODERATOR DASHBOARD PAGE
 * ================================================
 * Moderator page redirects to unified dashboard
 * UnifiedDashboard will render ModeratorDashboardView based on role
 *
 * This fixes the 404 error when accessing /moderator directly
 * Sprint 1 Day 3 - Dashboard Consolidation
 *
 * @version 1.0.0
 * @created 2025-11-13
 */
export default function ModeratorPage() {
  redirect('/dashboard');
}
