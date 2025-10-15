/**
 * Risk Analysis Tab Component
 *
 * Display risk distribution and high-risk summaries.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { RiskAnalysis } from '../types/moderationAnalytics';
import { getRiskColor } from '../utils/analyticsHelpers';

interface RiskAnalysisTabProps {
  risk: RiskAnalysis;
}

export function RiskAnalysisTab({ risk }: RiskAnalysisTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Risk Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {risk.riskDistribution.map((riskItem) => (
              <div key={riskItem.riskLevel}>
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`text-sm font-medium capitalize ${getRiskColor(riskItem.riskLevel).replace('bg-', 'text-')}`}
                  >
                    {riskItem.riskLevel}
                  </span>
                  <span className="text-sm text-gray-600">
                    {riskItem.count} ({riskItem.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2 rounded-full ${
                      riskItem.riskLevel === 'critical'
                        ? 'bg-red-500'
                        : riskItem.riskLevel === 'high'
                          ? 'bg-orange-500'
                          : riskItem.riskLevel === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                    }`}
                    style={{ width: `${riskItem.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yüksek Risk Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Yüksek Riskli Kullanıcılar</span>
              <span className="font-bold text-red-600">
                {risk.highRiskUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Yüksek Riskli İçerik</span>
              <span className="font-bold text-red-600">
                {risk.highRiskContent}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
