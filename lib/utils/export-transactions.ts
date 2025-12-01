/**
 * ================================================
 * TRANSACTION EXPORT UTILITIES
 * ================================================
 * Export transaction history to CSV and PDF formats
 *
 * Features:
 * - CSV export with proper formatting
 * - PDF export with branding
 * - Date range filtering
 * - Transaction type filtering
 * - Browser download handling
 *
 * Sprint 1 - Epic 1.1 - Day 2
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { formatCurrency } from '@/lib/shared/formatters';
import type {
  Transaction,
  TransactionType,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = 'csv' | 'pdf';

export interface ExportOptions {
  /** Start date filter (ISO string) */
  startDate?: string;

  /** End date filter (ISO string) */
  endDate?: string;

  /** Transaction type filter */
  type?: TransactionType;

  /** Include metadata in export */
  includeMetadata?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format date for export
 */
function formatExportDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get transaction type Turkish label
 */
function getTypeLabel(type: TransactionType): string {
  const labels: Record<TransactionType, string> = {
    CREDIT: 'Ödeme Alındı',
    DEBIT: 'Ödeme Gönderildi',
    ESCROW_HOLD: 'Escrow Beklemde',
    ESCROW_RELEASE: 'Escrow Serbest',
    MILESTONE_PAYMENT: 'Milestone Ödemesi',
    PAYOUT: 'Para Çekim',
    REFUND: 'İade',
    FEE: 'Komisyon',
  };
  return labels[type] || String(type);
}

/**
 * Filter transactions by options
 */
function filterTransactions(
  transactions: Transaction[],
  options: ExportOptions
): Transaction[] {
  return transactions.filter((transaction) => {
    if (options.startDate) {
      const transactionDate = new Date(transaction.createdAt);
      const startDate = new Date(options.startDate);
      if (transactionDate < startDate) return false;
    }

    if (options.endDate) {
      const transactionDate = new Date(transaction.createdAt);
      const endDate = new Date(options.endDate);
      if (transactionDate > endDate) return false;
    }

    if (options.type) {
      if (transaction.type !== options.type) return false;
    }

    return true;
  });
}

/**
 * Trigger browser download
 */
function triggerDownload(
  content: string | Blob,
  filename: string,
  mimeType: string
) {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

// ============================================================================
// CSV EXPORT
// ============================================================================

/**
 * Convert transactions to CSV format
 */
function transactionsToCSV(
  transactions: Transaction[],
  includeMetadata: boolean = false
): string {
  // CSV headers
  const headers = [
    'Tarih',
    'İşlem ID',
    'Tip',
    'Açıklama',
    'Tutar',
    'Para Birimi',
    'İşlem Sonrası Bakiye',
    'İlişkili Varlık Tipi',
    'İlişkili Varlık ID',
  ];

  if (includeMetadata) {
    headers.push('Metadata');
  }

  // Build CSV rows
  const rows = transactions.map((transaction) => {
    const row = [
      formatExportDate(transaction.createdAt),
      transaction.id,
      getTypeLabel(transaction.type),
      transaction.description || '',
      transaction.amount.toString(),
      transaction.currency,
      transaction.balanceAfter.toString(),
      transaction.relatedEntityType || '',
      transaction.relatedEntityId || '',
    ];

    if (includeMetadata) {
      row.push(
        transaction.metadata ? JSON.stringify(transaction.metadata) : ''
      );
    }

    return row;
  });

  // Escape CSV values (handle commas and quotes)
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Convert to CSV string
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  // Add BOM for proper Excel UTF-8 support
  return '\uFEFF' + csvContent;
}

/**
 * Export transactions to CSV file
 */
export function exportToCSV(
  transactions: Transaction[],
  options: ExportOptions = {}
): void {
  const filtered = filterTransactions(transactions, options);

  if (filtered.length === 0) {
    throw new Error('Dışa aktarılacak işlem bulunamadı');
  }

  const csv = transactionsToCSV(filtered, options.includeMetadata);

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `marifetbul_islemler_${dateStr}.csv`;

  triggerDownload(csv, filename, 'text/csv;charset=utf-8;');
}

// ============================================================================
// PDF EXPORT
// ============================================================================

/**
 * Generate HTML for PDF export
 */
function generatePDFHTML(
  transactions: Transaction[],
  options: ExportOptions = {}
): string {
  const totalAmount = transactions.reduce((sum, t) => {
    const isCredit = t.type === 'CREDIT' || t.type === 'ESCROW_RELEASE';
    return sum + (isCredit ? t.amount : -t.amount);
  }, 0);

  const dateRange =
    options.startDate || options.endDate
      ? `${options.startDate ? formatExportDate(options.startDate) : 'Başlangıç'} - ${options.endDate ? formatExportDate(options.endDate) : 'Bitiş'}`
      : 'Tüm işlemler';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MarifetBul İşlem Raporu</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      color: #1f2937;
      background: #fff;
    }
    
    .header {
      margin-bottom: 40px;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 20px;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    
    .report-info {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-size: 14px;
      color: #6b7280;
    }
    
    .summary {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    
    .summary-item {
      text-align: center;
    }
    
    .summary-label {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: bold;
      color: #1f2937;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th {
      background: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 13px;
    }
    
    .type-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    
    .type-credit { background: #d1fae5; color: #065f46; }
    .type-debit { background: #fee2e2; color: #991b1b; }
    .type-escrow { background: #fef3c7; color: #92400e; }
    .type-payout { background: #dbeafe; color: #1e40af; }
    .type-refund { background: #e9d5ff; color: #6b21a8; }
    .type-fee { background: #f3f4f6; color: #374151; }
    
    .amount-credit {
      color: #059669;
      font-weight: 600;
    }
    
    .amount-debit {
      color: #dc2626;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
    
    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">MarifetBul</div>
    <h1>İşlem Raporu</h1>
    <div class="report-info">
      <div>
        <strong>Rapor Tarihi:</strong> ${formatExportDate(new Date().toISOString())}
      </div>
      <div>
        <strong>Dönem:</strong> ${dateRange}
      </div>
    </div>
  </div>
  
  <div class="summary">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Toplam İşlem</div>
        <div class="summary-value">${transactions.length}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Net Tutar</div>
        <div class="summary-value">${formatCurrency(totalAmount, 'TRY')}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Para Birimi</div>
        <div class="summary-value">TRY</div>
      </div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Tarih</th>
        <th>Tip</th>
        <th>Açıklama</th>
        <th style="text-align: right;">Tutar</th>
        <th style="text-align: right;">Bakiye</th>
      </tr>
    </thead>
    <tbody>
      ${transactions
        .map((transaction) => {
          const isCredit =
            transaction.type === 'CREDIT' ||
            transaction.type === 'ESCROW_RELEASE';
          const typeClass = transaction.type.toLowerCase().replace('_', '-');

          return `
          <tr>
            <td>${formatExportDate(transaction.createdAt)}</td>
            <td>
              <span class="type-badge type-${typeClass}">
                ${getTypeLabel(transaction.type)}
              </span>
            </td>
            <td>${transaction.description || '-'}</td>
            <td class="${isCredit ? 'amount-credit' : 'amount-debit'}" style="text-align: right;">
              ${isCredit ? '+' : '-'}${formatCurrency(transaction.amount, transaction.currency)}
            </td>
            <td style="text-align: right;">
              ${formatCurrency(transaction.balanceAfter, transaction.currency)}
            </td>
          </tr>
        `;
        })
        .join('')}
    </tbody>
  </table>
  
  <div class="footer">
    Bu rapor MarifetBul platformu tarafından otomatik olarak oluşturulmuştur.<br>
    Herhangi bir sorunuz için destek@marifetbul.com adresinden bizimle iletişime geçebilirsiniz.
  </div>
</body>
</html>
  `.trim();
}

/**
 * Export transactions to PDF file
 *
 * Note: This opens a print dialog for the user to save as PDF
 * For server-side PDF generation, use a backend endpoint
 */
export function exportToPDF(
  transactions: Transaction[],
  options: ExportOptions = {}
): void {
  const filtered = filterTransactions(transactions, options);

  if (filtered.length === 0) {
    throw new Error('Dışa aktarılacak işlem bulunamadı');
  }

  const html = generatePDFHTML(filtered, options);

  // Open in new window and trigger print dialog
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Pop-up engelleyici nedeniyle PDF oluşturulamadı');
  }

  printWindow.document.write(html);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

// ============================================================================
// UNIFIED EXPORT FUNCTION
// ============================================================================

/**
 * Export transactions to specified format
 *
 * @example
 * ```tsx
 * // Export to CSV
 * exportTransactions(transactions, 'csv', {
 *   startDate: '2025-01-01',
 *   endDate: '2025-12-31',
 *   includeMetadata: true,
 * });
 *
 * // Export to PDF
 * exportTransactions(transactions, 'pdf', {
 *   type: 'CREDIT',
 * });
 * ```
 */
export function exportTransactions(
  transactions: Transaction[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  switch (format) {
    case 'csv':
      return exportToCSV(transactions, options);
    case 'pdf':
      return exportToPDF(transactions, options);
    default:
      throw new Error(`Desteklenmeyen format: ${format}`);
  }
}

export default exportTransactions;
