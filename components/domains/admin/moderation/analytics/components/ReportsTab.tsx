/**
 * Reports Tab Component
 *
 * Display reporting metrics.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { ReportingData } from '../types/moderationAnalytics';

interface ReportsTabProps {
  reporting: ReportingData;
}

export function ReportsTab({ reporting }: ReportsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Raporlama Verileri</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reporting.userReports}
            </div>
            <div className="text-sm text-gray-600">Kullanıcı Raporları</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {reporting.systemFlags}
            </div>
            <div className="text-sm text-gray-600">Sistem Bayrakları</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {reporting.adminReviews}
            </div>
            <div className="text-sm text-gray-600">Admin İncelemeleri</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {reporting.appealsCases}
            </div>
            <div className="text-sm text-gray-600">İtiraz Vakaları</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">
              {reporting.resolutionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Çözüm Oranı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {reporting.escalationRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Yükseltme Oranı</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
