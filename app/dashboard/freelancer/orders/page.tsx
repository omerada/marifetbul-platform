/**
 * ================================================
 * DEPRECATED - FREELANCER ORDERS PAGE
 * ================================================
 * @deprecated This page is deprecated. Use /dashboard/orders instead.
 * Kept for backward compatibility.
 * Will redirect to unified orders page.
 *
 * Sprint 5 - Task 5.2: Order Page Consolidation
 * @version 2.0.0 - Deprecated, redirects to unified orders
 */

import { redirect } from 'next/navigation';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function FreelancerOrdersPage() {
  // Redirect to main orders page - will handle role-based rendering
  redirect('/dashboard/orders');
}
