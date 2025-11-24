/**
 * ============================================================================
 * Payout CSV Export Utility
 * ============================================================================
 * Generates CSV files from payout data with Excel compatibility
 *
 * Sprint 1 - Story 1.5: Payout History Export
 *
 * Features:
 * - ✅ UTF-8 BOM for Excel compatibility
 * - ✅ Turkish headers
 * - ✅ Proper escaping for special characters
 * - ✅ Date/time formatting
 * - ✅ Currency formatting
 * - ✅ Status/method translations
 * - ✅ Browser download trigger
 *
 * CSV Format:
 * Tarih, İşlem No, Tutar, Para Birimi, Yöntem, Durum, Açıklama
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * ============================================================================
 */

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type {
  Payout,
  PayoutStatus,
  PayoutMethod,
} from '@/types/business/features/wallet';

// ============================================================================
// CONSTANTS
// ============================================================================

const CSV_HEADERS = [
  'Tarih',
  'İşlem No',
  'Tutar',
  'Para Birimi',
  'Yöntem',
  'Durum',
  'Açıklama',
] as const;

const STATUS_TRANSLATIONS: Record<PayoutStatus, string> = {
  PENDING: 'Beklemede',
  PROCESSING: 'İşleniyor',
  COMPLETED: 'Tamamlandı',
  FAILED: 'Başarısız',
  CANCELLED: 'İptal Edildi',
};

const METHOD_TRANSLATIONS: Record<PayoutMethod, string> = {
  BANK_TRANSFER: 'Banka Transferi',
  IYZICO_PAYOUT: 'İyzico Ödemesi',
  WALLET_TRANSFER: 'Cüzdan Transferi',
};

// UTF-8 BOM for Excel compatibility
const UTF8_BOM = '\uFEFF';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Escape CSV field value
 * Handles quotes, commas, newlines
 */
function escapeCSVField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Format date for CSV
 */
function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch {
    return 'Geçersiz Tarih';
  }
}

/**
 * Format currency amount
 */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Translate payout status
 */
function translateStatus(status: PayoutStatus): string {
  return STATUS_TRANSLATIONS[status] || status;
}

/**
 * Translate payout method
 */
function translateMethod(method: PayoutMethod): string {
  return METHOD_TRANSLATIONS[method] || method;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Generate CSV from payout data and trigger download
 *
 * @param payouts - Array of payouts to export
 * @param filename - Output filename (default: 'payout-history.csv')
 * @returns Promise that resolves when download is triggered
 *
 * @throws Error if browser doesn't support download
 */
export async function generatePayoutCSV(
  payouts: Payout[],
  filename: string = 'payout-history.csv'
): Promise<void> {
  // Build CSV content
  const rows: string[] = [];

  // Add headers
  rows.push(CSV_HEADERS.map(escapeCSVField).join(','));

  // Add data rows
  payouts.forEach((payout) => {
    const row = [
      escapeCSVField(formatDate(payout.requestedAt)),
      escapeCSVField(payout.id),
      escapeCSVField(formatAmount(payout.amount)),
      escapeCSVField(payout.currency),
      escapeCSVField(translateMethod(payout.method)),
      escapeCSVField(translateStatus(payout.status)),
      escapeCSVField(payout.description || ''),
    ];

    rows.push(row.join(','));
  });

  // Join rows with newlines and add BOM
  const csvContent = UTF8_BOM + rows.join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export {
  escapeCSVField,
  formatDate,
  formatAmount,
  translateStatus,
  translateMethod,
};
