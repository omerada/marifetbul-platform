/**
 * DemoInfoCard Component
 *
 * Demo information card with feature checklist
 */

import { MessageSquare, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DEMO_FEATURES } from '../utils/dashboardConstants';
import type { DemoInfoCardProps } from '../types/adminDashboardTypes';

export function DemoInfoCard({ features = DEMO_FEATURES }: DemoInfoCardProps) {
  const statusBadgeClass = 'border-green-200 bg-green-100 text-green-700';

  return (
    <Card className="border bg-blue-50 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 shadow-md">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-blue-900">
              📊 Yönetici Paneli Demo
            </CardTitle>
            <p className="text-sm text-blue-700">
              Bu, gerçek zamanlı özelliklerle yönetici panelinin bir
              demonstrasyonudur
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1].map((colIndex) => (
            <div key={colIndex} className="space-y-3">
              {features
                .filter((_, idx) => idx % 2 === colIndex)
                .map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-white/50 px-3 py-2"
                  >
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {feature.label}
                      </span>
                    </div>
                    <Badge className={statusBadgeClass}>{feature.status}</Badge>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
