/**
 * ================================================
 * JOB ANALYTICS EXPORT UTILITIES
 * ================================================
 * Export job analytics data to CSV and PDF formats
 *
 * Features:
 * - CSV export with UTF-8 BOM for Excel compatibility
 * - PDF export with charts and formatted tables
 * - Turkish locale support
 * - Professional formatting
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-24
 */

import { formatCurrency, formatDate } from '@/lib/shared/utils/format';

/**
 * Job analytics data structure for export
 */
export interface JobAnalyticsExportData {
  totalJobs: number;
  activeJobs: number;
  totalProposals: number;
  totalViews: number;
  avgProposalsPerJob: number;
  avgViewsPerJob: number;
  topCategory: string;
  statusDistribution: {
    DRAFT: number;
    OPEN: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CLOSED: number;
  };
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    category: string;
    budget: number;
    proposalCount: number;
    viewCount: number;
    createdAt: string;
  }>;
  exportedAt: string;
  exportedBy: string;
}

/**
 * Export options
 */
export interface ExportOptions {
  filename?: string;
  includeCharts?: boolean;
  includeDetails?: boolean;
  locale?: 'tr' | 'en';
}

/**
 * ================================================
 * CSV EXPORT
 * ================================================
 */

/**
 * Convert job analytics to CSV format
 */
export function convertJobAnalyticsToCSV(
  data: JobAnalyticsExportData,
  options: ExportOptions = {}
): string {
  const { includeDetails = true, locale = 'tr' } = options;

  const lines: string[] = [];

  // Add UTF-8 BOM for Excel compatibility
  lines.push('\uFEFF');

  // Header section
  if (locale === 'tr') {
    lines.push('İŞ İLANI ANALİTİĞİ RAPORU');
    lines.push('');
    lines.push(`Rapor Tarihi:,${data.exportedAt}`);
    lines.push(`Rapor Sahibi:,${data.exportedBy}`);
    lines.push('');

    // Summary statistics
    lines.push('ÖZET İSTATİSTİKLER');
    lines.push('Metrik,Değer');
    lines.push(`Toplam İş İlanı,${data.totalJobs}`);
    lines.push(`Aktif İlanlar,${data.activeJobs}`);
    lines.push(`Toplam Teklif,${data.totalProposals}`);
    lines.push(`Toplam Görüntülenme,${data.totalViews}`);
    lines.push(`Ortalama Teklif/İlan,${data.avgProposalsPerJob}`);
    lines.push(`Ortalama Görüntülenme/İlan,${data.avgViewsPerJob}`);
    lines.push(`En Popüler Kategori,${data.topCategory}`);
    lines.push('');

    // Status distribution
    lines.push('DURUM DAĞILIMI');
    lines.push('Durum,Adet');
    lines.push(`Taslak,${data.statusDistribution.DRAFT}`);
    lines.push(`Açık,${data.statusDistribution.OPEN}`);
    lines.push(`Devam Eden,${data.statusDistribution.IN_PROGRESS}`);
    lines.push(`Tamamlanan,${data.statusDistribution.COMPLETED}`);
    lines.push(`Kapalı,${data.statusDistribution.CLOSED}`);
    lines.push('');
  } else {
    lines.push('JOB ANALYTICS REPORT');
    lines.push('');
    lines.push(`Report Date:,${data.exportedAt}`);
    lines.push(`Report Owner:,${data.exportedBy}`);
    lines.push('');

    lines.push('SUMMARY STATISTICS');
    lines.push('Metric,Value');
    lines.push(`Total Jobs,${data.totalJobs}`);
    lines.push(`Active Jobs,${data.activeJobs}`);
    lines.push(`Total Proposals,${data.totalProposals}`);
    lines.push(`Total Views,${data.totalViews}`);
    lines.push(`Avg Proposals/Job,${data.avgProposalsPerJob}`);
    lines.push(`Avg Views/Job,${data.avgViewsPerJob}`);
    lines.push(`Top Category,${data.topCategory}`);
    lines.push('');

    lines.push('STATUS DISTRIBUTION');
    lines.push('Status,Count');
    lines.push(`Draft,${data.statusDistribution.DRAFT}`);
    lines.push(`Open,${data.statusDistribution.OPEN}`);
    lines.push(`In Progress,${data.statusDistribution.IN_PROGRESS}`);
    lines.push(`Completed,${data.statusDistribution.COMPLETED}`);
    lines.push(`Closed,${data.statusDistribution.CLOSED}`);
    lines.push('');
  }

  // Detailed job list
  if (includeDetails && data.jobs.length > 0) {
    if (locale === 'tr') {
      lines.push('DETAYLI İŞ LİSTESİ');
      lines.push(
        'İlan Başlığı,Durum,Kategori,Bütçe,Teklif Sayısı,Görüntülenme,Oluşturulma Tarihi'
      );
    } else {
      lines.push('DETAILED JOB LIST');
      lines.push(
        'Job Title,Status,Category,Budget,Proposals,Views,Created Date'
      );
    }

    data.jobs.forEach((job) => {
      const escapedTitle = `"${job.title.replace(/"/g, '""')}"`;
      const budget = formatCurrency(job.budget);
      lines.push(
        `${escapedTitle},${job.status},${job.category},${budget},${job.proposalCount},${job.viewCount},${job.createdAt}`
      );
    });
  }

  return lines.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
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
 * Export job analytics to CSV
 */
export function exportJobAnalyticsToCSV(
  data: JobAnalyticsExportData,
  options: ExportOptions = {}
): void {
  const { filename = 'is-ilani-analitigi.csv' } = options;
  const csv = convertJobAnalyticsToCSV(data, options);
  downloadCSV(csv, filename);
}

/**
 * ================================================
 * PDF EXPORT (Client-side with jsPDF)
 * ================================================
 */

/**
 * Export job analytics to PDF (client-side with dynamic import)
 * Note: For production, consider backend PDF generation with iText
 */
export async function exportJobAnalyticsToPDF(
  data: JobAnalyticsExportData,
  options: ExportOptions = {}
): Promise<void> {
  const { filename = 'is-ilani-analitigi.pdf', locale = 'tr' } = options;

  // Dynamic import to reduce initial bundle size - Sprint 4 Performance Optimization
  const [{ default: jsPDF }, _] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const title =
    locale === 'tr' ? 'İş İlanı Analitiği Raporu' : 'Job Analytics Report';
  doc.text(title, 105, 20, { align: 'center' });

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `${locale === 'tr' ? 'Rapor Tarihi' : 'Report Date'}: ${data.exportedAt}`,
    20,
    30
  );
  doc.text(
    `${locale === 'tr' ? 'Rapor Sahibi' : 'Report Owner'}: ${data.exportedBy}`,
    20,
    35
  );

  // Summary statistics table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    locale === 'tr' ? 'Özet İstatistikler' : 'Summary Statistics',
    20,
    45
  );

  const summaryData =
    locale === 'tr'
      ? [
          ['Toplam İş İlanı', data.totalJobs.toString()],
          ['Aktif İlanlar', data.activeJobs.toString()],
          ['Toplam Teklif', data.totalProposals.toString()],
          ['Toplam Görüntülenme', data.totalViews.toString()],
          ['Ortalama Teklif/İlan', data.avgProposalsPerJob.toString()],
          ['Ortalama Görüntülenme/İlan', data.avgViewsPerJob.toString()],
          ['En Popüler Kategori', data.topCategory],
        ]
      : [
          ['Total Jobs', data.totalJobs.toString()],
          ['Active Jobs', data.activeJobs.toString()],
          ['Total Proposals', data.totalProposals.toString()],
          ['Total Views', data.totalViews.toString()],
          ['Avg Proposals/Job', data.avgProposalsPerJob.toString()],
          ['Avg Views/Job', data.avgViewsPerJob.toString()],
          ['Top Category', data.topCategory],
        ];

  (doc as any).autoTable({
    startY: 50,
    head: [
      [
        locale === 'tr' ? 'Metrik' : 'Metric',
        locale === 'tr' ? 'Değer' : 'Value',
      ],
    ],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Status distribution table
  const statusY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(
    locale === 'tr' ? 'Durum Dağılımı' : 'Status Distribution',
    20,
    statusY
  );

  const statusData =
    locale === 'tr'
      ? [
          ['Taslak', data.statusDistribution.DRAFT.toString()],
          ['Açık', data.statusDistribution.OPEN.toString()],
          ['Devam Eden', data.statusDistribution.IN_PROGRESS.toString()],
          ['Tamamlanan', data.statusDistribution.COMPLETED.toString()],
          ['Kapalı', data.statusDistribution.CLOSED.toString()],
        ]
      : [
          ['Draft', data.statusDistribution.DRAFT.toString()],
          ['Open', data.statusDistribution.OPEN.toString()],
          ['In Progress', data.statusDistribution.IN_PROGRESS.toString()],
          ['Completed', data.statusDistribution.COMPLETED.toString()],
          ['Closed', data.statusDistribution.CLOSED.toString()],
        ];

  (doc as any).autoTable({
    startY: statusY + 5,
    head: [
      [
        locale === 'tr' ? 'Durum' : 'Status',
        locale === 'tr' ? 'Adet' : 'Count',
      ],
    ],
    body: statusData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Save PDF
  doc.save(filename);
}

/**
 * ================================================
 * HELPER FUNCTIONS
 * ================================================
 */

/**
 * Prepare job analytics data for export
 */
export function prepareJobAnalyticsExportData(
  jobs: any[],
  analytics: any,
  userEmail: string
): JobAnalyticsExportData {
  return {
    totalJobs: analytics.totalJobs,
    activeJobs: analytics.activeJobs,
    totalProposals: analytics.totalProposals,
    totalViews: analytics.totalViews,
    avgProposalsPerJob: analytics.avgProposalsPerJob,
    avgViewsPerJob: analytics.avgViewsPerJob,
    topCategory: analytics.topCategory,
    statusDistribution: analytics.statusDistribution,
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      status: job.status,
      category: job.category?.name || 'Diğer',
      budget: job.budget?.amount || job.budget || 0,
      proposalCount: job.proposalCount || 0,
      viewCount: job.viewCount || 0,
      createdAt: formatDate(job.createdAt),
    })),
    exportedAt: formatDate(new Date().toISOString()),
    exportedBy: userEmail,
  };
}
