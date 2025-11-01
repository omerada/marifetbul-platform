'use client';

import { redirect } from 'next/navigation';

/**
 * Admin page now redirects to unified dashboard
 * UnifiedDashboard will render AdminDashboardView based on role
 * Sprint Day 9 - Dashboard Consolidation
 */
export default function AdminPage() {
  redirect('/dashboard');
}
