/**
 * ================================================
 * USE REPORT BUILDER HOOK
 * ================================================
 * Hook for building and exporting custom analytics reports
 *
 * Features:
 * - Multiple report types
 * - Custom metric selection
 * - Date range filtering
 * - CSV/PDF export
 * - Report templates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Task 3.5
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type ReportType =
  | 'revenue'
  | 'orders'
  | 'refunds'
  | 'platform'
  | 'users'
  | 'custom';

export type ExportFormat = 'csv' | 'pdf' | 'json';

export interface ReportMetric {
  id: string;
  label: string;
  category: 'revenue' | 'orders' | 'refunds' | 'users' | 'platform';
  dataKey: string;
}

export interface ReportConfig {
  reportType: ReportType;
  title: string;
  description?: string;
  metrics: string[]; // Array of metric IDs
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
  filters?: Record<string, unknown>;
}

export interface ReportData {
  config: ReportConfig;
  data: unknown[];
  generatedAt: string;
  summary?: Record<string, number | string>;
}

interface UseReportBuilderReturn {
  config: ReportConfig;
  isGenerating: boolean;
  isExporting: boolean;
  reportData: ReportData | null;
  updateConfig: (updates: Partial<ReportConfig>) => void;
  generateReport: () => Promise<void>;
  exportReport: (format: ExportFormat) => Promise<void>;
  resetConfig: () => void;
}

/**
 * Default report configuration
 */
const DEFAULT_CONFIG: ReportConfig = {
  reportType: 'revenue',
  title: 'Gelir Raporu',
  description: '',
  metrics: [],
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  endDate: new Date().toISOString(),
  groupBy: 'day',
  filters: {},
};

/**
 * Hook for report builder
 */
export function useReportBuilder(): UseReportBuilderReturn {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  /**
   * Update report configuration
   */
  const updateConfig = useCallback((updates: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Generate report with current config
   */
  const generateReport = useCallback(async () => {
    try {
      setIsGenerating(true);

      // Validate configuration
      if (config.metrics.length === 0) {
        toast.error('Lütfen en az bir metrik seçin');
        return;
      }

      if (!config.startDate || !config.endDate) {
        toast.error('Lütfen tarih aralığı seçin');
        return;
      }

      // TODO: Backend Implementation Required
      // Endpoint: POST /api/v1/admin/reports/generate
      // Body: { reportType, metrics, startDate, endDate, groupBy, filters }
      // Response: { success: true, data: [...], summary: {...} }
      //
      // const response = await fetch('/api/v1/admin/reports/generate', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(config)
      // });
      // const result = await response.json();
      // setReportData({ config, data: result.data, generatedAt: new Date().toISOString(), summary: result.summary });

      // Using mock data until backend implements report generation
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockData = generateMockData(config);

      setReportData({
        config,
        data: mockData,
        generatedAt: new Date().toISOString(),
        summary: {
          totalRecords: mockData.length,
          periodDays: Math.ceil(
            (new Date(config.endDate).getTime() -
              new Date(config.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
      });

      toast.success('Rapor başarıyla oluşturuldu');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Rapor oluşturulamadı';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  /**
   * Export report in specified format
   */
  const exportReport = useCallback(
    async (format: ExportFormat) => {
      if (!reportData) {
        toast.error('Önce rapor oluşturmanız gerekiyor');
        return;
      }

      try {
        setIsExporting(true);

        // Simulate export
        // TODO: Replace with actual export implementation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        switch (format) {
          case 'csv':
            downloadCSV(reportData);
            break;
          case 'pdf':
            toast.info('PDF export yakında eklenecek');
            break;
          case 'json':
            downloadJSON(reportData);
            break;
        }

        toast.success(`Rapor ${format.toUpperCase()} formatında indirildi`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Rapor dışa aktarılamadı';
        toast.error(errorMessage);
      } finally {
        setIsExporting(false);
      }
    },
    [reportData]
  );

  /**
   * Reset configuration to default
   */
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setReportData(null);
  }, []);

  return {
    config,
    isGenerating,
    isExporting,
    reportData,
    updateConfig,
    generateReport,
    exportReport,
    resetConfig,
  };
}

/**
 * Generate mock data for testing
 *
 * TODO: Backend Implementation Required
 * This mock data generator should be replaced with actual backend API integration.
 *
 * Required Backend Endpoint: POST /api/v1/admin/reports/generate
 * Request Body: {
 *   reportType: 'revenue' | 'orders' | 'refunds' | 'users' | 'custom',
 *   metrics: string[],
 *   startDate: string (ISO8601),
 *   endDate: string (ISO8601),
 *   groupBy: 'day' | 'week' | 'month',
 *   filters?: {
 *     categories?: string[],
 *     status?: string[],
 *     userTypes?: string[],
 *     minAmount?: number,
 *     maxAmount?: number
 *   }
 * }
 *
 * Response: {
 *   success: true,
 *   data: Array<{
 *     date: string,
 *     [metricKey: string]: number | string
 *   }>,
 *   summary: {
 *     total: number,
 *     average: number,
 *     min: number,
 *     max: number,
 *     trend: 'up' | 'down' | 'stable',
 *     percentageChange: number
 *   }
 * }
 */
function generateMockData(config: ReportConfig): unknown[] {
  const days = Math.ceil(
    (new Date(config.endDate).getTime() -
      new Date(config.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return Array.from({ length: Math.min(days, 30) }, (_, i) => {
    const date = new Date(
      new Date(config.startDate).getTime() + i * 24 * 60 * 60 * 1000
    );

    return {
      date: date.toISOString().split('T')[0],
      revenue: Math.random() * 10000,
      orders: Math.floor(Math.random() * 50),
      refunds: Math.floor(Math.random() * 5),
      users: Math.floor(Math.random() * 20),
    };
  });
}

/**
 * Download CSV file
 */
function downloadCSV(reportData: ReportData): void {
  const csv = convertToCSV(reportData.data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${reportData.config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download JSON file
 */
function downloadJSON(reportData: ReportData): void {
  const json = JSON.stringify(reportData, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${reportData.config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.json`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = (row as Record<string, unknown>)[header];
          return typeof value === 'string' ? `"${value}"` : value;
        })
        .join(',')
    ),
  ];

  return csvRows.join('\n');
}
