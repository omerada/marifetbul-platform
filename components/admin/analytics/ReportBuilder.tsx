/**
 * ================================================
 * REPORT BUILDER COMPONENT
 * ================================================
 * Main component for building custom analytics reports
 *
 * Features:
 * - Report type selection
 * - Metric configuration
 * - Date range picker
 * - Export options
 * - Report preview
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.5
 */

'use client';

import { Card } from '@/components/ui/Card';
import { FileText, Download, RefreshCw, Calendar } from 'lucide-react';
import {
  useReportBuilder,
  type ReportType,
  type ExportFormat,
} from '@/hooks/business/admin/useReportBuilder';
import { MetricSelector } from './MetricSelector';

/**
 * Report type options
 */
const REPORT_TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'revenue', label: 'Gelir Raporu' },
  { value: 'orders', label: 'Sipariş Raporu' },
  { value: 'refunds', label: 'İade Raporu' },
  { value: 'platform', label: 'Platform Raporu' },
  { value: 'users', label: 'Kullanıcı Raporu' },
  { value: 'custom', label: 'Özel Rapor' },
];

/**
 * Group by options
 */
const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Günlük' },
  { value: 'week', label: 'Haftalık' },
  { value: 'month', label: 'Aylık' },
];

/**
 * Export format options
 */
const EXPORT_FORMATS: Array<{ value: ExportFormat; label: string }> = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
  { value: 'json', label: 'JSON' },
];

/**
 * Report Builder Component
 */
export function ReportBuilder() {
  const {
    config,
    isGenerating,
    isExporting,
    reportData,
    updateConfig,
    generateReport,
    exportReport,
    resetConfig,
  } = useReportBuilder();

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Rapor Yapılandırması</h3>
            <p className="text-muted-foreground text-sm">
              Rapor türü, metrikler ve tarih aralığı seçin
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Report Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">Rapor Türü</label>
            <select
              value={config.reportType}
              onChange={(e) =>
                updateConfig({ reportType: e.target.value as ReportType })
              }
              className="focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Report Title */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Rapor Başlığı
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => updateConfig({ title: e.target.value })}
              placeholder="Rapor başlığını girin"
              className="focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              placeholder="Rapor açıklaması"
              rows={3}
              className="focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Calendar className="mr-1 inline h-4 w-4" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                value={config.startDate.split('T')[0]}
                onChange={(e) =>
                  updateConfig({
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
                className="focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                <Calendar className="mr-1 inline h-4 w-4" />
                Bitiş Tarihi
              </label>
              <input
                type="date"
                value={config.endDate.split('T')[0]}
                onChange={(e) =>
                  updateConfig({
                    endDate: new Date(e.target.value).toISOString(),
                  })
                }
                className="focus:ring-primary w-full rounded-md border px-4 py-2 focus:ring-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Group By */}
          <div>
            <label className="mb-2 block text-sm font-medium">Gruplama</label>
            <div className="flex gap-2">
              {GROUP_BY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    updateConfig({
                      groupBy: option.value as 'day' | 'week' | 'month',
                    })
                  }
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    config.groupBy === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <button
              onClick={generateReport}
              disabled={isGenerating || config.metrics.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Rapor Oluştur
                </>
              )}
            </button>
            <button
              onClick={resetConfig}
              className="rounded-md border px-4 py-2 transition-colors hover:bg-gray-50"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </Card>

      {/* Metric Selector */}
      <MetricSelector
        selectedMetrics={config.metrics}
        onMetricsChange={(metrics) => updateConfig({ metrics })}
      />

      {/* Report Preview & Export */}
      {reportData && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {reportData.config.title}
                </h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  Oluşturulma:{' '}
                  {new Date(reportData.generatedAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <div className="flex gap-2">
                {EXPORT_FORMATS.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => exportReport(format.value)}
                    disabled={isExporting}
                    className="flex items-center gap-2 rounded-md border px-4 py-2 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {reportData.summary && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-gray-50 p-4">
                    <p className="text-muted-foreground text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="mt-1 text-xl font-bold">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Data Preview */}
            <div>
              <h4 className="mb-3 font-semibold">Veri Önizleme</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {reportData.data.length > 0 &&
                        Object.keys(
                          reportData.data[0] as Record<string, unknown>
                        ).map((key) => (
                          <th
                            key={key}
                            className="px-4 py-2 text-left font-medium"
                          >
                            {key}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.slice(0, 10).map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row as Record<string, unknown>).map(
                          (value, i) => (
                            <td key={i} className="px-4 py-2">
                              {typeof value === 'number'
                                ? value.toFixed(2)
                                : String(value)}
                            </td>
                          )
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.data.length > 10 && (
                <p className="text-muted-foreground mt-2 text-center text-sm">
                  İlk 10 kayıt gösteriliyor. Tüm veriler için dışa aktarın.
                </p>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
