/**
 * ============================================================================
 * Payout PDF Export Utility
 * ============================================================================
 * Generates PDF files from payout data with professional styling
 *
 * Sprint 1 - Story 1.5: Payout History Export
 *
 * Features:
 * - ✅ Professional table layout
 * - ✅ MarifetBul branding
 * - ✅ Turkish headers and content
 * - ✅ Date range information
 * - ✅ Status/method translations
 * - ✅ Currency formatting
 * - ✅ Browser download trigger
 *
 * Note: Uses browser's built-in print-to-PDF instead of jsPDF
 * This approach avoids adding another dependency while providing clean output
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatDate(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch {
    return 'Geçersiz Tarih';
  }
}

function translateStatus(status: PayoutStatus): string {
  return STATUS_TRANSLATIONS[status] || status;
}

function translateMethod(method: PayoutMethod): string {
  return METHOD_TRANSLATIONS[method] || method;
}

function formatCurrency(amount: number, currency: string = 'TRY'): string {
  return `${amount.toFixed(2)} ${currency}`;
}

// ============================================================================
// PDF GENERATION
// ============================================================================

/**
 * Generate HTML for PDF printout
 */
function generatePDFHTML(
  payouts: Payout[],
  options: { startDate?: Date; endDate?: Date }
): string {
  const { startDate, endDate } = options;

  const dateRangeText =
    startDate && endDate
      ? `${format(startDate, 'dd.MM.yyyy', { locale: tr })} - ${format(endDate, 'dd.MM.yyyy', { locale: tr })}`
      : 'Tüm Tarihler';

  const now = format(new Date(), 'dd.MM.yyyy HH:mm', { locale: tr });

  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const completedPayouts = payouts.filter((p) => p.status === 'COMPLETED');
  const completedAmount = completedPayouts.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ödeme Geçmişi - MarifetBul</title>
      <style>
        @page {
          margin: 15mm;
          size: A4;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #1a1a1a;
        }

        .header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #7c3aed;
        }

        .header h1 {
          font-size: 18pt;
          color: #7c3aed;
          margin-bottom: 8px;
        }

        .header .subtitle {
          font-size: 11pt;
          color: #666;
          margin-bottom: 4px;
        }

        .meta-info {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
          font-size: 9pt;
        }

        .meta-info div {
          margin-right: 20px;
        }

        .meta-info strong {
          color: #374151;
        }

        .summary {
          margin: 15px 0;
          padding: 12px;
          background: #f0fdf4;
          border-left: 4px solid #10b981;
          border-radius: 4px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          font-size: 9pt;
        }

        .summary-item strong {
          display: block;
          color: #065f46;
          margin-bottom: 4px;
        }

        .summary-item span {
          font-size: 11pt;
          font-weight: 600;
          color: #047857;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 9pt;
        }

        thead {
          background: #7c3aed;
          color: white;
        }

        th {
          padding: 8px 6px;
          text-align: left;
          font-weight: 600;
          font-size: 9pt;
        }

        tbody tr {
          border-bottom: 1px solid #e5e7eb;
        }

        tbody tr:nth-child(even) {
          background: #f9fafb;
        }

        td {
          padding: 7px 6px;
        }

        .status-badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 8pt;
          font-weight: 500;
        }

        .status-COMPLETED { background: #d1fae5; color: #065f46; }
        .status-PENDING { background: #fef3c7; color: #92400e; }
        .status-PROCESSING { background: #dbeafe; color: #1e40af; }
        .status-FAILED { background: #fee2e2; color: #991b1b; }
        .status-CANCELLED { background: #f3f4f6; color: #374151; }

        .amount-cell {
          text-align: right;
          font-weight: 600;
        }

        .footer {
          margin-top: 25px;
          padding-top: 15px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 8pt;
          color: #6b7280;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          thead {
            display: table-header-group;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MarifetBul - Ödeme Geçmişi</h1>
        <div class="subtitle">Detaylı Ödeme Raporu</div>
      </div>

      <div class="meta-info">
        <div><strong>Tarih Aralığı:</strong> ${dateRangeText}</div>
        <div><strong>Rapor Tarihi:</strong> ${now}</div>
        <div><strong>Toplam Kayıt:</strong> ${payouts.length}</div>
      </div>

      <div class="summary">
        <div class="summary-grid">
          <div class="summary-item">
            <strong>Toplam Tutar</strong>
            <span>${formatCurrency(totalAmount)}</span>
          </div>
          <div class="summary-item">
            <strong>Tamamlanan İşlem</strong>
            <span>${completedPayouts.length} adet</span>
          </div>
          <div class="summary-item">
            <strong>Tamamlanan Tutar</strong>
            <span>${formatCurrency(completedAmount)}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 14%;">Tarih</th>
            <th style="width: 22%;">İşlem No</th>
            <th style="width: 13%;">Tutar</th>
            <th style="width: 16%;">Yöntem</th>
            <th style="width: 12%;">Durum</th>
            <th style="width: 23%;">Açıklama</th>
          </tr>
        </thead>
        <tbody>
          ${payouts
            .map(
              (payout) => `
            <tr>
              <td>${formatDate(payout.requestedAt)}</td>
              <td style="font-family: monospace; font-size: 8pt;">${payout.id.substring(0, 18)}...</td>
              <td class="amount-cell">${formatCurrency(payout.amount, payout.currency)}</td>
              <td>${translateMethod(payout.method)}</td>
              <td>
                <span class="status-badge status-${payout.status}">
                  ${translateStatus(payout.status)}
                </span>
              </td>
              <td>${payout.description || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        Bu rapor MarifetBul sistemi tarafından otomatik olarak oluşturulmuştur.<br>
        © ${new Date().getFullYear()} MarifetBul - Tüm hakları saklıdır.
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

/**
 * Generate PDF from payout data using browser print
 *
 * @param payouts - Array of payouts to export
 * @param _filename - Output filename (unused in browser print, reserved for future use)
 * @param options - Additional options (startDate, endDate)
 * @returns Promise that resolves when print dialog is shown
 */
export async function generatePayoutPDF(
  payouts: Payout[],
  _filename: string = 'payout-history.pdf',
  options: { startDate?: Date; endDate?: Date } = {}
): Promise<void> {
  // Generate HTML
  const htmlContent = generatePDFHTML(payouts, options);

  // Create a temporary window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    throw new Error(
      'Popup engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.'
    );
  }

  // Write HTML to the window
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      // Close window after a delay (user might cancel print)
      setTimeout(() => {
        printWindow.close();
      }, 100);
    }, 250);
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export { formatDate, translateStatus, translateMethod, formatCurrency };
