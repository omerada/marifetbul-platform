/**
 * ================================================
 * ADMIN COMMISSION MANAGEMENT PAGE
 * ================================================
 * Main dashboard for commission management
 *
 * Route: /admin/commissions
 * Features:
 * - Commission overview statistics
 * - Recent transactions
 * - Active rules summary
 * - Quick actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { Metadata } from 'next';
import { CommissionDashboard } from '@/components/admin/commission/CommissionDashboard';

export const metadata: Metadata = {
  title: 'Komisyon Yönetimi | Admin - MarifetBul',
  description:
    'Komisyon işlemlerini görüntüleyin, kuralları yönetin ve analizleri inceleyin',
};

export default function AdminCommissionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Komisyon Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Platform komisyonlarını görüntüleyin ve yönetin
        </p>
      </div>

      <CommissionDashboard />
    </div>
  );
}
