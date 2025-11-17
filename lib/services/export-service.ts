/**
 * ================================================
 * EXPORT SERVICE - PRODUCTION READY
 * ================================================
 * Unified export service for CSV, PDF, and Excel exports
 *
 * Sprint 1: Export Functionality
 * - ✅ CSV export (client-side)
 * - ✅ PDF export (via backend API)
 * - ✅ Excel export (client-side)
 * - ✅ Type-safe data handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 2025
 */

import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportColumn<T = unknown> {
  /** Column header */
  header: string;
  /** Data accessor function */
  accessor: (row: T) => string | number | null | undefined;
  /** Optional formatter */
  format?: (value: unknown) => string;
}

export interface ExportOptions {
  /** File name without extension */
  filename: string;
  /** Export format */
  format: 'csv' | 'excel';
  /** Sheet name (Excel only) */
  sheetName?: string;
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Export data to CSV file
 */
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  try {
    // Build CSV content
    const headers = columns.map((col) => col.header).join(',');
    const rows = data.map((row) => {
      return columns
        .map((col) => {
          const value = col.accessor(row);
          const formatted = col.format
            ? col.format(value)
            : String(value ?? '');

          // Escape commas and quotes
          if (
            formatted.includes(',') ||
            formatted.includes('"') ||
            formatted.includes('\n')
          ) {
            return `"${formatted.replace(/"/g, '""')}"`;
          }
          return formatted;
        })
        .join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    downloadBlob(blob, `${filename}.csv`);

    logger.info('CSV export successful', { filename, rowCount: data.length });
  } catch (error) {
    logger.error(
      'CSV export failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// ============================================================================
// EXCEL EXPORT (Simple CSV-based)
// ============================================================================

/**
 * Export data to Excel file (via CSV format)
 * For advanced Excel features, integrate a library like xlsx/exceljs
 */
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName = 'Sheet1'
): void {
  try {
    // For now, use CSV format but save as .xls
    // Excel can open CSV files natively
    const headers = columns.map((col) => col.header).join('\t');
    const rows = data.map((row) => {
      return columns
        .map((col) => {
          const value = col.accessor(row);
          const formatted = col.format
            ? col.format(value)
            : String(value ?? '');
          return formatted;
        })
        .join('\t');
    });

    const content = [headers, ...rows].join('\n');

    const blob = new Blob(['\ufeff' + content], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    downloadBlob(blob, `${filename}.xls`);

    logger.info('Excel export successful', {
      filename,
      sheetName,
      rowCount: data.length,
    });
  } catch (error) {
    logger.error(
      'Excel export failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// ============================================================================
// PDF EXPORT (Backend API)
// ============================================================================

/**
 * Export data to PDF via backend API
 * Note: This requires backend endpoint to generate PDF
 */
export async function exportToPDF(
  apiEndpoint: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/pdf',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`PDF export failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    downloadBlob(blob, `${filename}.pdf`);

    logger.info('PDF export successful', { filename, endpoint: apiEndpoint });
  } catch (error) {
    logger.error(
      'PDF export failed',
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// ============================================================================
// COMMON FORMATTERS
// ============================================================================

/**
 * Common column formatters
 */
export const formatters = {
  currency: (value: unknown) =>
    typeof value === 'number' ? formatCurrency(value) : '',
  date: (value: unknown) =>
    typeof value === 'string' ? formatDate(value, 'SHORT') : '',
  datetime: (value: unknown) =>
    typeof value === 'string' ? formatDate(value, 'DATETIME') : '',
  boolean: (value: unknown) => (value ? 'Evet' : 'Hayır'),
  percentage: (value: unknown) =>
    typeof value === 'number' ? `${value.toFixed(2)}%` : '',
};

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const exportService = {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  formatters,
};

export default exportService;
