/**
 * ================================================
 * ADMIN PLATFORM STATISTICS PAGE
 * ================================================
 *  DEPRECATED - Component consolidation in progress
 *
 * TODO Sprint 1: Migrate to use dashboard widgets
 * PlatformStatsWidget needs to be created or migrated from dashboard
 *
 * Route: /admin/analytics/platform
 * Access: Admin only
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @deprecated Use dashboard analytics instead
 */

'use client';

import { Card } from '@/components/ui/Card';
import { AlertCircle } from 'lucide-react';

/**
 * Admin Platform Statistics Page - Temporary Placeholder
 */
export default function AdminPlatformStatisticsPage() {
  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 text-amber-600">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">
              Sayfa Ge�ici Olarak Devre D���
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Bu sayfa component consolidation s�ras�nda ge�ici olarak devre
              d��� b�rak�ld�. Dashboard analytics sayfas�n� kullanabilirsiniz.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
