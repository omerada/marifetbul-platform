/**
 * PerformanceSection Component
 *
 * Performance monitor section wrapper
 */

import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';

export function PerformanceSection() {
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
        <Button variant="ghost" size="sm" className="text-purple-600">
          Detayları Görüntüle
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center text-sm text-gray-500">
          Performans grafikleri burada görüntülenecek
        </div>
      </CardContent>
    </Card>
  );
}
