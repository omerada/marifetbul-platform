/**
 * ================================================
 * ADMIN FINANCIAL REPORTS PAGE
 * ================================================
 * Financial reporting and analytics dashboard
 *
 * Route: /admin/reports/financial
 * Features:
 * - Revenue analytics
 * - Payout statistics
 * - Commission tracking
 * - Export capabilities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.1
 */

import { Metadata } from 'next';
import { AdminFinancialReports } from '@/components/domains/admin/finance';

export const metadata: Metadata = {
  title: 'Finansal Raporlar | Admin - MarifetBul',
  description: 'Detaylı finansal analizler ve raporlar',
};

export default function AdminFinancialReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AdminFinancialReports />
    </div>
  );
}
