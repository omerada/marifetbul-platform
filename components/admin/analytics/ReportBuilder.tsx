/**
 * ================================================
 * REPORT BUILDER COMPONENT
 * ================================================
 * Sprint 1 - Task 2: PDF Export Feature
 *
 * Interactive report builder with PDF/CSV export capabilities
 *
 * Features:
 * - Report type selection (Revenue, Orders, Users, Refunds)
 * - Date range picker
 * - Group by options (DAILY, WEEKLY, MONTHLY)
 * - Export to PDF and CSV
 * - Real-time report preview
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-19
 */

'use client';

import { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/hooks/core/useToast';

type ReportType = 'REVENUE' | 'ORDERS' | 'USERS' | 'REFUNDS';
type GroupBy = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface ReportBuilderProps {
  className?: string;
}

/**
 * Report Builder Component
 */
export function ReportBuilder({ className }: ReportBuilderProps) {
  const { success, error: showError } = useToast();

  // Form state
  const [reportType, setReportType] = useState<ReportType>('REVENUE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('DAILY');

  // Loading states
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  /**
   * Handle PDF export
   */
  const handlePdfExport = async () => {
    if (!startDate || !endDate) {
      showError('Eksik Bilgi', 'Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    setPdfLoading(true);

    try {
      const params = new URLSearchParams({
        reportType,
        startDate,
        endDate,
        groupBy,
      });

      const response = await fetch(
        `/api/v1/admin/reports/export/pdf?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('PDF oluşturma başarısız');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_Raporu_${startDate}_${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('PDF İndirildi', 'Rapor başarıyla PDF formatında indirildi');
    } catch (_error) {
      showError('Hata', 'PDF oluşturulurken bir hata oluştu');
    } finally {
      setPdfLoading(false);
    }
  };

  /**
   * Handle CSV export
   */
  const handleCsvExport = async () => {
    if (!startDate || !endDate) {
      showError('Eksik Bilgi', 'Lütfen başlangıç ve bitiş tarihlerini seçin');
      return;
    }

    setCsvLoading(true);

    try {
      const params = new URLSearchParams({
        reportType,
        startDate,
        endDate,
        groupBy,
      });

      const response = await fetch(
        `/api/v1/admin/reports/export/csv?${params}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('CSV oluşturma başarısız');
      }

      // Download CSV
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_Raporu_${startDate}_${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      success('CSV İndirildi', 'Rapor başarıyla CSV formatında indirildi');
    } catch (_error) {
      showError('Hata', 'CSV oluşturulurken bir hata oluştu');
    } finally {
      setCsvLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Rapor Oluşturucu</CardTitle>
        <p className="text-muted-foreground mt-1 text-sm">
          Özelleştirilmiş raporlar oluşturun ve PDF veya CSV formatında dışa
          aktarın
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="reportType">Rapor Tipi</Label>
          <Select
            value={reportType}
            onValueChange={(value) => setReportType(value as ReportType)}
          >
            <SelectTrigger placeholder="Rapor tipi seçin" />
            <SelectContent>
              <SelectItem value="REVENUE">Gelir Raporu</SelectItem>
              <SelectItem value="ORDERS">Sipariş Raporu</SelectItem>
              <SelectItem value="USERS">Kullanıcı Raporu</SelectItem>
              <SelectItem value="REFUNDS">İade Raporu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="startDate">Başlangıç Tarihi</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Bitiş Tarihi</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Group By */}
        <div className="space-y-2">
          <Label htmlFor="groupBy">Gruplama</Label>
          <Select
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as GroupBy)}
          >
            <SelectTrigger placeholder="Gruplama seçin" />
            <SelectContent>
              <SelectItem value="DAILY">Günlük</SelectItem>
              <SelectItem value="WEEKLY">Haftalık</SelectItem>
              <SelectItem value="MONTHLY">Aylık</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            onClick={handlePdfExport}
            disabled={pdfLoading || csvLoading}
            className="gap-2"
          >
            {pdfLoading ? (
              <Download className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            PDF Olarak İndir
          </Button>

          <Button
            onClick={handleCsvExport}
            disabled={pdfLoading || csvLoading}
            variant="outline"
            className="gap-2"
          >
            {csvLoading ? (
              <Download className="h-4 w-4 animate-spin" />
            ) : (
              <Table className="h-4 w-4" />
            )}
            CSV Olarak İndir
          </Button>
        </div>

        {/* Info */}
        <div className="bg-muted text-muted-foreground rounded-lg p-4 text-sm">
          <p className="font-medium">Bilgi:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>PDF formatı profesyonel raporlar için idealdir</li>
            <li>CSV formatı Excel&apos;de işlemek için kullanılabilir</li>
            <li>Raporlar seçilen tarih aralığı için oluşturulur</li>
            <li>Tüm veriler gerçek zamanlı olarak hesaplanır</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
