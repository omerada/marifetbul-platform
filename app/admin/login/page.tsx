/**
 * ================================================
 * ADMIN LOGIN PAGE
 * ================================================
 * Entry point for admin panel authentication
 *
 * Route: /admin/login
 * Access: Public (redirects if already admin)
 *
 * Features:
 * - Dedicated admin login form
 * - Enhanced security with 2FA
 * - Shorter session duration (30 min)
 * - Separate from regular user login
 *
 * Simplified version - all logic handled in AdminLoginForm component.
 *
 * @version 2.0.0
 * @created 2025-11-17
 * @updated 2025-01-20 - Story 3: Simplified to use AdminLoginForm component
 * @sprint Sprint 1 - Story 3: Admin Login Separation
 * @author MarifetBul Development Team
 */

'use client';

import { AdminLoginForm } from '@/components/forms/AdminLoginForm';

export const dynamic = 'force-dynamic';

/**
 * Admin Login Page Component
 *
 * Thin wrapper for AdminLoginForm - all logic (authentication,
 * validation, 2FA, session management) is handled by the form component.
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <AdminLoginForm
          require2FA={true}
          sessionDuration={30}
          strictMode={true}
        />
      </div>
    </div>
  );
}
