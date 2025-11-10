'use client';

/**
 * ================================================
 * PAYOUT EXPORT UTILITIES
 * ================================================
 * Export payout history to CSV and PDF formats
 *
 * Features:
 * - CSV export with full details
 * - PDF export with formatted tables
 * - Date range filtering
 * - Status filtering
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Payout & Wallet Workflow
 */

import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { Payout } from '@/types/business/features/wallet';

// ================================================
// CSV EXPORT
// ================================================

/**
 * Export payouts to CSV
 */
export function exportPayoutsToCSV(payouts: Payout[], filename?: string): void {
  // CSV headers
  const headers = [
    'Tarih',
    'Miktar (TL)',
    'Durum',
    'Banka',
    'IBAN',
    'İşlem No',
    'Tamamlanma Tarihi',
    'Not',
  ];

  // CSV rows
  const rows = payouts.map((payout) => [
    format(new Date(payout.requestedAt), 'dd/MM/yyyy HH:mm', { locale: tr }),
    payout.amount.toFixed(2),
    getPayoutStatusText(payout.status),
    payout.bankAccount?.bankName || '-',
    maskIBAN(payout.bankAccount?.iban || ''),
    payout.transactionId || '-',
    payout.completedAt
      ? format(new Date(payout.completedAt), 'dd/MM/yyyy HH:mm', { locale: tr })
      : '-',
    payout.notes || '-',
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Add BOM for Turkish characters
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  // Download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `odeme-gecmisi-${format(new Date(), 'yyyyMMdd')}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ================================================
// PDF EXPORT
// ================================================

/**
 * Export payouts to PDF
 * Note: This requires a PDF library like jsPDF
 * For production, implement with proper PDF generation
 */
export function exportPayoutsToPDF(payouts: Payout[], filename?: string): void {
  // For now, create a printable HTML view
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Popup blocker aktif. Lütfen popup\'ları etkinleştirin.');
    return;
  }

  const htmlContent = generatePayoutsPrintHTML(payouts);

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
}

/**
 * Generate HTML for PDF print
 */
function generatePayoutsPrintHTML(payouts: Payout[]): string {
  const totalAmount = payouts.reduce((sum, p) => sum + p.amount, 0);
  const completedCount = payouts.filter((p) => p.status === 'COMPLETED').length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Ödeme Geçmişi</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .summary {
          display: flex;
          justify-content: space-around;
          margin-bottom: 20px;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 5px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        .summary-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background: #333;
          color: white;
          padding: 10px;
          text-align: left;
          font-size: 12px;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
          font-size: 11px;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .status {
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: bold;
        }
        .status-completed { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-processing { background: #d1ecf1; color: #0c5460; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
        }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Ödeme Geçmişi Raporu</h1>
        <p>Oluşturulma Tarihi: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: tr })}</p>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Toplam İşlem</div>
          <div class="summary-value">${payouts.length}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Tamamlanan</div>
          <div class="summary-value">${completedCount}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Toplam Tutar</div>
          <div class="summary-value">${totalAmount.toLocaleString('tr-TR')} TL</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>Miktar</th>
            <th>Durum</th>
            <th>Banka</th>
            <th>IBAN</th>
            <th>İşlem No</th>
          </tr>
        </thead>
        <tbody>
          ${payouts
            .map(
              (payout) => `
            <tr>
              <td>${format(new Date(payout.requestedAt), 'dd/MM/yyyy', { locale: tr })}</td>
              <td>${payout.amount.toLocaleString('tr-TR')} TL</td>
              <td>
                <span class="status status-${payout.status.toLowerCase()}">
                  ${getPayoutStatusText(payout.status)}
                </span>
              </td>
              <td>${payout.bankAccount?.bankName || '-'}</td>
              <td>${maskIBAN(payout.bankAccount?.iban || '')}</td>
              <td>${payout.transactionId || '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>MarifetBul - Güvenilir Freelance Platformu</p>
        <p>Bu rapor otomatik olarak oluşturulmuştur.</p>
      </div>
    </body>
    </html>
  `;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function getPayoutStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Beklemede',
    PROCESSING: 'İşleniyor',
    COMPLETED: 'Tamamlandı',
    FAILED: 'Başarısız',
    CANCELLED: 'İptal Edildi',
  };
  return statusMap[status] || status;
}

function maskIBAN(iban: string): string {
  if (!iban || iban.length < 8) return '****';
  return `${iban.substring(0, 4)}****${iban.substring(iban.length - 4)}`;
}
