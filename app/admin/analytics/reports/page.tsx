/**
 * ================================================
 * ADMIN CUSTOM REPORTS PAGE
 * ================================================
 * Page for building and exporting custom analytics reports
 *
 * Route: /admin/analytics/reports
 * Access: Admin only
 *
 * Features:
 * - Custom report builder
 * - Metric selection
 * - Date range filtering
 * - Multiple export formats
 * - Report templates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.5
 */

'use client';

import { FileBarChart } from 'lucide-react';
import { ReportBuilder } from '@/components/domains/admin';

/**
 * Admin Custom Reports Page
 */
export default function AdminCustomReportsPage() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-3">
          <FileBarChart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Özel Raporlar</h1>
          <p className="text-muted-foreground mt-1">
            Özelleştirilmiş analitik raporları oluşturun ve dışa aktarın
          </p>
        </div>
      </div>

      {/* Report Builder */}
      <ReportBuilder />
    </div>
  );
}
