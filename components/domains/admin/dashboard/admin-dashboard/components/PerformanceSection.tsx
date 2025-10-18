/**
 * PerformanceSection Component
 *
 * Performance monitor section wrapper
 * TODO: Backend'den trends verisi geldiğinde grafikleri ekle
 */

import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface PerformanceSectionProps {
  trends?: {
    dailyRevenue: Array<{ date: string; value: number }>;
    dailyUsers: Array<{ date: string; value: number }>;
    dailyOrders: Array<{ date: string; value: number }>;
    dailyPackageViews: Array<{ date: string; value: number }>;
  } | null;
}

export function PerformanceSection({ trends }: PerformanceSectionProps) {
  // Eğer trends verisi yoksa component'i gösterme
  if (!trends || !trends.dailyRevenue?.length) {
    return null;
  }

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 shadow-md">
            <Activity className="h-5 w-5 text-purple-600" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Performans İzleme
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center text-sm text-gray-500">
          {/* TODO: Chart component eklenecek */}
          Grafik verisi mevcut: {trends.dailyRevenue.length} veri noktası
        </div>
      </CardContent>
    </Card>
  );
}
