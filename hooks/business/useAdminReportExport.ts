/**
 * ================================================
 * USE ADMIN REPORT EXPORT HOOK
 * ================================================
 * Custom hook for exporting admin reports
 * Provides state management, progress tracking, and error handling
 *
 * Features:
 * - PDF and CSV export
 * - Loading states
 * - Progress tracking
 * - Error handling
 * - Automatic cleanup
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Code Cleanup
 * @date November 25, 2025
 */

'use client';

import { useState, useCallback } from 'react';
import {
  exportReportAsPDF,
  exportReportAsCSV,
  type ReportType,
  type GroupBy,
  type ExportFormat,
  type ExportResult,
} from '@/lib/api/admin-reports-export';

// ============================================================================
// TYPES
// ============================================================================

export interface UseAdminReportExportReturn {
  // State
  isExporting: boolean;
  exportFormat: ExportFormat | null;
  progress: number;
  error: string | null;

  // Actions
  exportPDF: (
    reportType: ReportType,
    startDate: string,
    endDate: string,
    groupBy: GroupBy
  ) => Promise<ExportResult>;

  exportCSV: (
    reportType: ReportType,
    startDate: string,
    endDate: string,
    groupBy: GroupBy
  ) => Promise<ExportResult>;

  reset: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for admin report export
 *
 * @returns Export utilities and state
 *
 * @example
 * ```typescript
 * const { exportPDF, exportCSV, isExporting, progress } = useAdminReportExport();
 *
 * const handleExport = async () => {
 *   await exportPDF('REVENUE', '2025-01-01', '2025-01-31', 'DAILY');
 * };
 * ```
 */
export function useAdminReportExport(): UseAdminReportExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Export report as PDF
   */
  const exportPDF = useCallback(
    async (
      reportType: ReportType,
      startDate: string,
      endDate: string,
      groupBy: GroupBy
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setExportFormat('PDF');
      setProgress(0);
      setError(null);

      try {
        const result = await exportReportAsPDF({
          reportType,
          startDate,
          endDate,
          groupBy,
          onProgress: setProgress,
        });

        if (!result.success && result.error) {
          setError(result.error);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'PDF export failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsExporting(false);
        setExportFormat(null);
        // Keep progress at 100 for a moment before reset
        setTimeout(() => setProgress(0), 2000);
      }
    },
    []
  );

  /**
   * Export report as CSV
   */
  const exportCSV = useCallback(
    async (
      reportType: ReportType,
      startDate: string,
      endDate: string,
      groupBy: GroupBy
    ): Promise<ExportResult> => {
      setIsExporting(true);
      setExportFormat('CSV');
      setProgress(0);
      setError(null);

      try {
        const result = await exportReportAsCSV({
          reportType,
          startDate,
          endDate,
          groupBy,
          onProgress: setProgress,
        });

        if (!result.success && result.error) {
          setError(result.error);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'CSV export failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsExporting(false);
        setExportFormat(null);
        // Keep progress at 100 for a moment before reset
        setTimeout(() => setProgress(0), 2000);
      }
    },
    []
  );

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    setIsExporting(false);
    setExportFormat(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    isExporting,
    exportFormat,
    progress,
    error,
    exportPDF,
    exportCSV,
    reset,
  };
}

export default useAdminReportExport;
