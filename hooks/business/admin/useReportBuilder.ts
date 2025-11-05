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

      // Call backend API to generate report
      const response = await fetch('/api/v1/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: config.reportType.toUpperCase(),
          title: config.title,
          description: config.description,
          metrics: config.metrics,
          startDate: config.startDate,
          endDate: config.endDate,
          groupBy: config.groupBy?.toUpperCase() || 'DAY',
          filters: config.filters,
        }),
      });

      if (!response.ok) {
        throw new Error('Rapor oluşturulamadı');
      }

      const result = await response.json();

      setReportData({
        config,
        data: result.data || [],
        generatedAt: result.metadata?.generatedAt || new Date().toISOString(),
        summary: result.summary || {},
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

        switch (format) {
          case 'csv':
            await exportToCSV(reportData.config);
            break;
          case 'pdf':
            await exportToPDF(reportData.config);
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
 * Export report to CSV via backend API
 */
async function exportToCSV(config: ReportConfig): Promise<void> {
  const response = await fetch('/api/v1/admin/reports/export/csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportType: config.reportType.toUpperCase(),
      title: config.title,
      description: config.description,
      metrics: config.metrics,
      startDate: config.startDate,
      endDate: config.endDate,
      groupBy: config.groupBy?.toUpperCase() || 'DAY',
      filters: config.filters,
    }),
  });

  if (!response.ok) {
    throw new Error('CSV export başarısız oldu');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Export report to PDF via backend API
 */
async function exportToPDF(config: ReportConfig): Promise<void> {
  const response = await fetch('/api/v1/admin/reports/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reportType: config.reportType.toUpperCase(),
      title: config.title,
      description: config.description,
      metrics: config.metrics,
      startDate: config.startDate,
      endDate: config.endDate,
      groupBy: config.groupBy?.toUpperCase() || 'DAY',
      filters: config.filters,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'PDF export başarısız oldu');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download JSON file (client-side only)
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
  window.URL.revokeObjectURL(url);
}
