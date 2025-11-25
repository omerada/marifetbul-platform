/**
 * ================================================
 * ADMIN REPORTS EXPORT SERVICE
 * ================================================
 * Centralized export functionality for admin reports
 * Eliminates duplicate code across components
 *
 * Features:
 * - PDF export with progress tracking
 * - CSV export
 * - Error handling and retry logic
 * - Automatic file download
 * - Toast notifications
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @sprint Sprint 1 - Code Cleanup
 * @date November 25, 2025
 */

import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { errorHandler } from './error-handler';

// ============================================================================
// TYPES
// ============================================================================

export type ReportType = 'REVENUE' | 'ORDERS' | 'USERS' | 'REFUNDS';
export type GroupBy = 'DAILY' | 'WEEKLY' | 'MONTHLY';
export type ExportFormat = 'PDF' | 'CSV';

export interface ExportOptions {
  reportType: ReportType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  groupBy: GroupBy;
  onProgress?: (progress: number) => void;
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPORT_BASE_PATH = '/api/v1/admin/reports/export';

const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  REVENUE: 'Gelir',
  ORDERS: 'Sipariş',
  USERS: 'Kullanıcı',
  REFUNDS: 'İade',
};

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

/**
 * Export report as PDF
 *
 * @param options - Export configuration
 * @returns Promise resolving to export result
 *
 * @example
 * ```typescript
 * const result = await exportReportAsPDF({
 *   reportType: 'REVENUE',
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31',
 *   groupBy: 'DAILY',
 *   onProgress: (progress) => console.log(`${progress}%`)
 * });
 * ```
 */
export async function exportReportAsPDF(
  options: ExportOptions
): Promise<ExportResult> {
  const { reportType, startDate, endDate, groupBy, onProgress } = options;

  logger.debug('[ExportService] Starting PDF export', {
    reportType,
    startDate,
    endDate,
    groupBy,
  });

  try {
    // Validate dates
    if (!startDate || !endDate) {
      const error = 'Başlangıç ve bitiş tarihleri gereklidir';
      toast.error('Eksik Bilgi', {
        description: error,
      });
      return { success: false, error };
    }

    if (new Date(startDate) > new Date(endDate)) {
      const error = 'Başlangıç tarihi bitiş tarihinden büyük olamaz';
      toast.error('Geçersiz Tarih', {
        description: error,
      });
      return { success: false, error };
    }

    // Build query params
    const params = new URLSearchParams({
      reportType,
      startDate,
      endDate,
      groupBy,
    });

    // Notify start
    onProgress?.(10);

    // Make request
    const response = await fetch(`${EXPORT_BASE_PATH}/pdf?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    onProgress?.(50);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'PDF oluşturma başarısız');
    }

    // Download file
    const blob = await response.blob();
    onProgress?.(80);

    const fileName = `${REPORT_TYPE_LABELS[reportType]}_Raporu_${startDate}_${endDate}.pdf`;
    downloadBlob(blob, fileName);

    onProgress?.(100);

    // Success notification
    toast.success('PDF İndirildi', {
      description: `${REPORT_TYPE_LABELS[reportType]} raporu başarıyla indirildi`,
    });

    logger.info('[ExportService] PDF export successful', {
      reportType,
      fileName,
    });

    return { success: true, fileName };
  } catch (error) {
    logger.error('[ExportService] PDF export failed', error as Error);

    const apiError = errorHandler.handle(error, {
      operation: 'PDF Export',
      reportType,
    });

    toast.error('PDF Oluşturulamadı', {
      description:
        apiError.getUserMessage() ||
        'PDF raporu oluşturulurken bir hata oluştu',
    });

    return { success: false, error: apiError.message };
  }
}

/**
 * Export report as CSV
 *
 * @param options - Export configuration
 * @returns Promise resolving to export result
 *
 * @example
 * ```typescript
 * const result = await exportReportAsCSV({
 *   reportType: 'ORDERS',
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31',
 *   groupBy: 'WEEKLY'
 * });
 * ```
 */
export async function exportReportAsCSV(
  options: ExportOptions
): Promise<ExportResult> {
  const { reportType, startDate, endDate, groupBy, onProgress } = options;

  logger.debug('[ExportService] Starting CSV export', {
    reportType,
    startDate,
    endDate,
    groupBy,
  });

  try {
    // Validate dates
    if (!startDate || !endDate) {
      const error = 'Başlangıç ve bitiş tarihleri gereklidir';
      toast.error('Eksik Bilgi', {
        description: error,
      });
      return { success: false, error };
    }

    if (new Date(startDate) > new Date(endDate)) {
      const error = 'Başlangıç tarihi bitiş tarihinden büyük olamaz';
      toast.error('Geçersiz Tarih', {
        description: error,
      });
      return { success: false, error };
    }

    // Build query params
    const params = new URLSearchParams({
      reportType,
      startDate,
      endDate,
      groupBy,
    });

    // Notify start
    onProgress?.(10);

    // Make request
    const response = await fetch(`${EXPORT_BASE_PATH}/csv?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    onProgress?.(50);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'CSV oluşturma başarısız');
    }

    // Download file
    const blob = await response.blob();
    onProgress?.(80);

    const fileName = `${REPORT_TYPE_LABELS[reportType]}_Raporu_${startDate}_${endDate}.csv`;
    downloadBlob(blob, fileName);

    onProgress?.(100);

    // Success notification
    toast.success('CSV İndirildi', {
      description: `${REPORT_TYPE_LABELS[reportType]} raporu başarıyla indirildi`,
    });

    logger.info('[ExportService] CSV export successful', {
      reportType,
      fileName,
    });

    return { success: true, fileName };
  } catch (error) {
    logger.error('[ExportService] CSV export failed', error as Error);

    const apiError = errorHandler.handle(error, {
      operation: 'CSV Export',
      reportType,
    });

    toast.error('CSV Oluşturulamadı', {
      description:
        apiError.getUserMessage() ||
        'CSV raporu oluşturulurken bir hata oluştu',
    });

    return { success: false, error: apiError.message };
  }
}

/**
 * Generic export function that delegates to PDF or CSV
 *
 * @param format - Export format (PDF or CSV)
 * @param options - Export configuration
 * @returns Promise resolving to export result
 *
 * @example
 * ```typescript
 * const result = await exportReport('PDF', {
 *   reportType: 'REVENUE',
 *   startDate: '2025-01-01',
 *   endDate: '2025-01-31',
 *   groupBy: 'MONTHLY'
 * });
 * ```
 */
export async function exportReport(
  format: ExportFormat,
  options: ExportOptions
): Promise<ExportResult> {
  if (format === 'PDF') {
    return exportReportAsPDF(options);
  } else {
    return exportReportAsCSV(options);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Download blob as file
 * Creates temporary link element and triggers download
 */
function downloadBlob(blob: Blob, fileName: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

/**
 * Get report type label in Turkish
 */
export function getReportTypeLabel(reportType: ReportType): string {
  return REPORT_TYPE_LABELS[reportType] || reportType;
}

/**
 * Validate date range
 * Returns true if dates are valid, false otherwise
 */
export function validateDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) {
    return false;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return start <= end;
}

/**
 * Get suggested file name for export
 */
export function getSuggestedFileName(
  reportType: ReportType,
  startDate: string,
  endDate: string,
  format: ExportFormat
): string {
  const label = REPORT_TYPE_LABELS[reportType];
  const extension = format.toLowerCase();
  return `${label}_Raporu_${startDate}_${endDate}.${extension}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

const adminReportsExportService = {
  exportReportAsPDF,
  exportReportAsCSV,
  exportReport,
  getReportTypeLabel,
  validateDateRange,
  getSuggestedFileName,
};

export default adminReportsExportService;
