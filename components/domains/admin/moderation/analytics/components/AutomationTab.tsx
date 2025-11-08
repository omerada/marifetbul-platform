/**
 * Automation Tab Component
 *
 * Display automation metrics and performance.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { AutomationMetrics } from '../types/moderationAnalytics';
import { formatCurrency } from '@/lib/shared/formatters';
import { formatDuration } from '../utils/analyticsHelpers';

interface AutomationTabProps {
  automation: AutomationMetrics;
}

export function AutomationTab({ automation }: AutomationTabProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Otomasyon Oranı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {automation.automationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">
                {automation.totalAutomated} işlem otomatik
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${automation.automationRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Doğruluk Metrikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Doğruluk Oranı</span>
              <span className="font-medium text-green-600">
                {automation.accuracyRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Yanlış Pozitif</span>
              <span className="font-medium text-red-600">
                {automation.falsePositiveRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Yanlış Negatif</span>
              <span className="font-medium text-orange-600">
                {automation.falseNegativeRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zaman Tasarrufu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-purple-600">
            {formatDuration(automation.timeSaved * 60)}
          </p>
          <p className="text-sm text-gray-600">toplam tasarruf</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maliyet Tasarrufu</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(automation.costSavings)}
          </p>
          <p className="text-sm text-gray-600">toplam tasarruf</p>
        </CardContent>
      </Card>
    </div>
  );
}
