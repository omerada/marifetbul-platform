/**
 * ================================================
 * ADMIN MAIN DASHBOARD PAGE
 * ================================================
 * Entry point for admin panel - comprehensive platform overview
 *
 * Route: /admin
 * Access: Admin only (protected by middleware)
 *
 * Features:
 * - Platform-wide statistics
 * - Real-time system health monitoring
 * - Revenue & user analytics
 * - Search performance metrics
 * - Top performing packages
 * - Recent activity timeline
 * - Quick action shortcuts
 *
 * Simplified version - all logic handled in AdminDashboardView component.
 *
 * @version 2.0.0
 * @created 2025-11-17
 * @updated 2025-01-20 - Story 2: Simplified to thin wrapper
 * @sprint Sprint 1 - Story 2: Dashboard Consolidation
 * @author MarifetBul Development Team
 */

'use client';

import { AdminDashboardView } from '@/components/domains/dashboard/views/AdminDashboardView';
import { DashboardErrorBoundary } from '@/components/domains/dashboard';

export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard Page Component
 *
 * Thin wrapper for AdminDashboardView - all logic (data fetching,
 * transformation, auth checks, error handling) is handled by the view component.
 */
export default function AdminDashboardPage() {
  return (
    <DashboardErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <AdminDashboardView />
      </div>
    </DashboardErrorBoundary>
  );
}
