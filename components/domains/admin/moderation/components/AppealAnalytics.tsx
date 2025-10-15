/**
 * Appeal Analytics Component
 *
 * Displays analytics charts for appeal system including status distribution,
 * reason breakdown, and resolution trends.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart, TrendingUp, AlertCircle } from 'lucide-react';
import type { AppealStats, AppealReason, AppealStatus } from '../types/appeal';
import {
  getStatusColor,
  getReasonText,
  getSuccessRateColor,
} from '../utils/appealHelpers';

interface AppealAnalyticsProps {
  stats: AppealStats | null;
  isLoading?: boolean;
}

export function AppealAnalytics({ stats, isLoading }: AppealAnalyticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-500">Analiz verileri yükleniyor...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <AlertCircle className="h-12 w-12 text-gray-400" />
            <p className="ml-3 text-gray-500">Analiz verisi bulunamadı</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Duruma Göre Dağılım
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.appealsByStatus.map((item) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{item.status}</span>
                  <span className="text-gray-500">
                    {item.count} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${getStatusColor(item.status as AppealStatus)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reason Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Nedenlere Göre Dağılım
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.appealsByReason.map((item) => (
              <div
                key={item.reason}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="mb-1 text-sm font-medium">
                    {getReasonText(item.reason as AppealReason)}
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${(item.count / stats.totalAppeals) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-semibold">{item.count}</div>
                  <div
                    className={`text-xs ${getSuccessRateColor(item.successRate)}`}
                  >
                    {item.successRate.toFixed(1)}% başarı
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resolution Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Çözüm Trendleri (Son 30 Gün)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.resolutionTrends.slice(-10).map((trend) => {
              const total = trend.approved + trend.rejected + trend.escalated;
              return (
                <div key={trend.date} className="flex items-center gap-3">
                  <div className="w-20 text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString('tr-TR', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="flex h-6 overflow-hidden rounded">
                      {trend.approved > 0 && (
                        <div
                          className="bg-green-500"
                          style={{
                            width: `${(trend.approved / total) * 100}%`,
                          }}
                          title={`${trend.approved} Onaylı`}
                        />
                      )}
                      {trend.rejected > 0 && (
                        <div
                          className="bg-red-500"
                          style={{
                            width: `${(trend.rejected / total) * 100}%`,
                          }}
                          title={`${trend.rejected} Reddedildi`}
                        />
                      )}
                      {trend.escalated > 0 && (
                        <div
                          className="bg-yellow-500"
                          style={{
                            width: `${(trend.escalated / total) * 100}%`,
                          }}
                          title={`${trend.escalated} Yükseltildi`}
                        />
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {total}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 border-t pt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Onaylı</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-red-500" />
              <span>Reddedildi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span>Yükseltildi</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
