/**
 * Reviewer Performance Component
 *
 * Displays performance metrics for appeal reviewers including
 * review count, average time, and success rate.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, Clock, TrendingUp } from 'lucide-react';
import type { AppealStats } from '../types/appeal';
import { formatDuration, getSuccessRateColor } from '../utils/appealHelpers';

interface ReviewerPerformanceProps {
  stats: AppealStats | null;
  isLoading?: boolean;
}

export function ReviewerPerformance({
  stats,
  isLoading,
}: ReviewerPerformanceProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-500">Performans verileri yükleniyor...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !stats.reviewerPerformance.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            İnceleyici Performansı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">
            Performans verisi bulunamadı
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          İnceleyici Performansı ({stats.reviewerPerformance.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-3 text-left font-semibold">İnceleyici</th>
                <th className="pb-3 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="h-4 w-4" />
                    İnceleme Sayısı
                  </div>
                </th>
                <th className="pb-3 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="h-4 w-4" />
                    Ortalama Süre
                  </div>
                </th>
                <th className="pb-3 text-center font-semibold">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Başarı Oranı
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.reviewerPerformance
                .sort((a, b) => b.reviewedAppeals - a.reviewedAppeals)
                .map((reviewer) => (
                  <tr
                    key={reviewer.reviewerId}
                    className="border-b last:border-0"
                  >
                    <td className="py-3">
                      <div className="font-medium text-gray-900">
                        {reviewer.reviewerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {reviewer.reviewerId}
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                        {reviewer.reviewedAppeals}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-gray-700">
                        {formatDuration(reviewer.averageTime)}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`font-semibold ${getSuccessRateColor(reviewer.successRate)}`}
                      >
                        {reviewer.successRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">Toplam İnceleme</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.reviewerPerformance.reduce(
                (sum, r) => sum + r.reviewedAppeals,
                0
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Ort. İnceleme Süresi</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatDuration(
                stats.reviewerPerformance.reduce(
                  (sum, r) => sum + r.averageTime,
                  0
                ) / stats.reviewerPerformance.length
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Genel Başarı</div>
            <div
              className={`text-2xl font-bold ${getSuccessRateColor(
                stats.reviewerPerformance.reduce(
                  (sum, r) => sum + r.successRate,
                  0
                ) / stats.reviewerPerformance.length
              )}`}
            >
              {(
                stats.reviewerPerformance.reduce(
                  (sum, r) => sum + r.successRate,
                  0
                ) / stats.reviewerPerformance.length
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
