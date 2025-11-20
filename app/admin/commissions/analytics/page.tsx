/**
 * ================================================
 * COMMISSION ANALYTICS PAGE
 * ================================================
 * Analytics and reporting for commissions
 *
 * Route: /admin/commissions/analytics
 * Features:
 * - Transaction charts
 * - Revenue breakdown
 * - Seller statistics
 * - Date range filters
 * - Export capabilities
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Day 2 - Commission UI
 * @since 2025-11-14
 */

import { Metadata } from 'next';
import { CommissionAnalytics } from '@/components/domains/admin/finance';

export const metadata: Metadata = {
  title: 'Komisyon Analizi | Admin - MarifetBul',
  description: 'Komisyon istatistiklerini ve analizlerini görüntüleyin',
};

export default function CommissionAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Komisyon Analizi</h1>
        <p className="mt-2 text-gray-600">
          Detaylı komisyon istatistikleri ve trend analizleri
        </p>
      </div>

      <CommissionAnalytics />
    </div>
  );
}
