/**
 * Overview Tab Component
 *
 * Display action breakdown, category stats, content types, and time series.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  BarChart3,
} from 'lucide-react';
import type { ModerationAnalytics } from '../types/moderationAnalytics';
import { getRiskColor } from '../utils/analyticsHelpers';

interface OverviewTabProps {
  analytics: ModerationAnalytics;
}

export function OverviewTab({ analytics }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Action Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>İşlem Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Onaylandı</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.approved}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span>Reddedildi</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.rejected}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Yükseltildi</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.escalated}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Otomatik Onay</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.autoApproved}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                <span>Otomatik Red</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.autoRejected}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Beklemede</span>
              </div>
              <span className="font-medium">
                {analytics.actionBreakdown.pending}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.categoryStats.map((category) => (
              <div key={category.category} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {category.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {category.totalActions}
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      {category.approvalRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${category.approvalRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle>İçerik Türleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.contentTypes.map((contentType) => (
              <div
                key={contentType.type}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="capitalize">{contentType.type}</span>
                  <Badge
                    className={`border ${getRiskColor(contentType.riskScore > 0.7 ? 'high' : contentType.riskScore > 0.4 ? 'medium' : 'low')}`}
                  >
                    Risk: {(contentType.riskScore * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {contentType.count}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {contentType.approvalRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Series Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Günlük Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-gray-500">Grafik verisi burada gösterilecek</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
