/**
 * ================================================
 * EXPORT UTILITIES
 * ================================================
 * CSV/Excel export helper functions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2
 */

/**
 * Convert data array to CSV format
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: Record<keyof T, string>
): string {
  if (!data || data.length === 0) return '';

  const keys = Object.keys(data[0]) as Array<keyof T>;
  const headerRow = headers
    ? keys.map((key) => headers[key] || String(key)).join(',')
    : keys.join(',');

  const rows = data.map((row) =>
    keys
      .map((key) => {
        const value = row[key];
        // Escape commas and quotes
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(',')
  );

  return [headerRow, ...rows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(
  data: string,
  filename: string = 'export.csv'
): void {
  const blob = new Blob(['\ufeff' + data], {
    type: 'text/csv;charset=utf-8;',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  const csv = convertToCSV(data, headers);
  downloadCSV(csv, filename);
}

/**
 * Format date for export (CSV/Excel compatible)
 */
export function formatDateForExport(
  date: Date | string | null | undefined
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    // Use ISO date format for universal compatibility
    return dateObj.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

/**
 * Format currency for export (numeric value without symbols)
 */
export function formatCurrencyForExport(
  amount: number | null | undefined
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }

  // Return as plain number with 2 decimal places
  return amount.toFixed(2);
}
