'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Label } from '@/components/ui/Label';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ReportType = 'revenue' | 'conversions' | 'users';
type ExportFormat = 'csv' | 'pdf';
type ExportPeriod = '7d' | '30d' | '90d' | '1y';

export function ExportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [period, setPeriod] = useState<ExportPeriod>('30d');

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/v1/admin/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType,
          period,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${reportType}-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Report exported successfully');
      setIsOpen(false);
    } catch (_error) {
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <UnifiedButton variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </UnifiedButton>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Analytics Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setReportType('revenue')}
                className={`rounded px-3 py-2 text-sm ${
                  reportType === 'revenue'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setReportType('conversions')}
                className={`rounded px-3 py-2 text-sm ${
                  reportType === 'conversions'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                Conversions
              </button>
              <button
                onClick={() => setReportType('users')}
                className={`rounded px-3 py-2 text-sm ${
                  reportType === 'users'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                Users
              </button>
            </div>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <Label>Time Period</Label>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setPeriod('7d')}
                className={`rounded px-3 py-2 text-sm ${
                  period === '7d'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`rounded px-3 py-2 text-sm ${
                  period === '30d'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod('90d')}
                className={`rounded px-3 py-2 text-sm ${
                  period === '90d'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                90 Days
              </button>
              <button
                onClick={() => setPeriod('1y')}
                className={`rounded px-3 py-2 text-sm ${
                  period === '1y'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                1 Year
              </button>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('csv')}
                className={`rounded px-3 py-2 text-sm ${
                  format === 'csv'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                CSV (Excel)
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={`rounded px-3 py-2 text-sm ${
                  format === 'pdf'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <UnifiedButton
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </UnifiedButton>
          <UnifiedButton
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export
              </>
            )}
          </UnifiedButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
