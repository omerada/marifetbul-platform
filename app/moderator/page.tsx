/**
 * ================================================
 * MODERATOR DASHBOARD PAGE
 * ================================================
 * Redirects to unified dashboard which will render ModeratorDashboardView
 *
 * Sprint Day 9 - Dashboard Consolidation
 * @version 4.0.0
 */

'use client';

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function ModeratorDashboardPage() {
  redirect('/dashboard');
}
