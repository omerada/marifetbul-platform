/**
 * ================================================
 * COMMISSION RULES MANAGEMENT PAGE
 * ================================================
 * Page for managing commission rules
 *
 * Route: /admin/commissions/rules
 * Features:
 * - List all rules
 * - Create/edit/delete rules
 * - Activate/deactivate rules
 * - Filter by rule type
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { Metadata } from 'next';
import { CommissionRulesManagement } from '@/components/domains/admin/finance';

export const metadata: Metadata = {
  title: 'Komisyon Kuralları | Admin - MarifetBul',
  description: 'Komisyon kurallarını oluşturun, düzenleyin ve yönetin',
};

export default function CommissionRulesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Komisyon Kuralları</h1>
        <p className="mt-2 text-gray-600">
          Platform komisyon kurallarını düzenleyin ve yönetin
        </p>
      </div>

      <CommissionRulesManagement />
    </div>
  );
}
