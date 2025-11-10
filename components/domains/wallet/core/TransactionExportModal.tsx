'use client';

/**
 * ================================================
 * TRANSACTION EXPORT MODAL
 * ================================================
 * Export transaction history to various formats
 *
 * Features:
 * - Format selection (CSV, Excel, PDF)
 * - Date range selection
 * - Transaction type filtering
 * - Amount range filtering
 * - Preview before export
 * - Download progress
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 * @sprint Sprint 1 - Story 1.2 - Task 2 (1 story point)
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import logger from '@/lib/infrastructure/monitoring/logger';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileType,
  Calendar,
  DollarSign,
  Filter,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { TransactionType } from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export type ExportFormat = 'CSV' | 'EXCEL' | 'PDF';

export interface ExportOptions {
  format: ExportFormat;
  startDate?: string;
  endDate?: string;
  transactionTypes?: TransactionType[];
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  transactionCount?: number;
}

// ================================================
// FORMAT OPTIONS
// ================================================

const FORMAT_OPTIONS: Array<{
  value: ExportFormat;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}> = [
  {
    value: 'CSV',
    label: 'CSV',
    description: 'Virgülle ayrılmış değerler (Excel uyumlu)',
    icon: FileText,
    color: 'text-blue-600',
  },
  {
    value: 'EXCEL',
    label: 'Excel',
    description: 'Microsoft Excel formatı (.xlsx)',
    icon: FileSpreadsheet,
    color: 'text-green-600',
  },
  {
    value: 'PDF',
    label: 'PDF',
    description: 'Taşınabilir belge formatı',
    icon: FileType,
    color: 'text-red-600',
  },
];

const TRANSACTION_TYPE_OPTIONS: Array<{
  value: TransactionType;
  label: string;
}> = [
  { value: TransactionType.CREDIT, label: 'Gelir' },
  { value: TransactionType.DEBIT, label: 'Gider' },
  { value: TransactionType.PAYOUT, label: 'Para Çekme' },
  { value: TransactionType.ESCROW_HOLD, label: 'Emanet (Beklemede)' },
  {
    value: TransactionType.ESCROW_RELEASE,
    label: 'Emanet (Serbest Bırakıldı)',
  },
  { value: TransactionType.REFUND, label: 'İade' },
  { value: TransactionType.FEE, label: 'Komisyon' },
];

// ================================================
// COMPONENT
// ================================================

export const TransactionExportModal: React.FC<TransactionExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  transactionCount = 0,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('CSV');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // ==================== HANDLERS ====================

  const handleTypeToggle = (type: TransactionType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleExport = async () => {
    // Validation
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Başlangıç tarihi, bitiş tarihinden sonra olamaz');
      return;
    }

    if (
      minAmount &&
      maxAmount &&
      parseFloat(minAmount) > parseFloat(maxAmount)
    ) {
      toast.error('Minimum tutar, maksimum tutardan büyük olamaz');
      return;
    }

    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        transactionTypes: selectedTypes.length > 0 ? selectedTypes : undefined,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
      };

      await onExport(options);
      toast.success(`İşlemler ${selectedFormat} formatında indirildi`);
      onClose();
    } catch (error) {
      logger.error('Export failed', error as Error);
      toast.error('Export işlemi başarısız oldu');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedTypes([]);
  };

  // ==================== RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>İşlemleri Dışa Aktar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Dosya Formatı</Label>
            <div className="grid grid-cols-3 gap-3">
              {FORMAT_OPTIONS.map((format) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === format.value;
                return (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${format.color}`} />
                    <span className="font-semibold text-gray-900">
                      {format.label}
                    </span>
                    <span className="text-center text-xs text-gray-600">
                      {format.description}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-semibold">Tarih Aralığı</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">
                  Başlangıç Tarihi
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate || undefined}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">
                  Bitiş Tarihi
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || undefined}
                />
              </div>
            </div>
          </Card>

          {/* Amount Range */}
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-semibold">Tutar Aralığı</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-sm">
                  Minimum (₺)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="0.00"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-sm">
                  Maksimum (₺)
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  placeholder="10000.00"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </Card>

          {/* Transaction Types */}
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <Label className="text-sm font-semibold">İşlem Tipleri</Label>
              <span className="text-xs text-gray-500">
                (Boş bırakırsanız tümü dahil edilir)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRANSACTION_TYPE_OPTIONS.map((type) => {
                const isSelected = selectedTypes.includes(type.value);
                return (
                  <button
                    key={type.value}
                    onClick={() => handleTypeToggle(type.value)}
                    className={`rounded-full px-3 py-1 text-sm transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Summary */}
          <Card className="bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">
                  Export Özeti
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-800">
                  <li>
                    • Format: <strong>{selectedFormat}</strong>
                  </li>
                  {startDate && endDate && (
                    <li>
                      • Tarih: <strong>{startDate}</strong> -{' '}
                      <strong>{endDate}</strong>
                    </li>
                  )}
                  {(minAmount || maxAmount) && (
                    <li>
                      • Tutar: <strong>{minAmount || '0'} ₺</strong> -{' '}
                      <strong>{maxAmount || '∞'} ₺</strong>
                    </li>
                  )}
                  {selectedTypes.length > 0 && (
                    <li>
                      • Tipler: <strong>{selectedTypes.length} seçili</strong>
                    </li>
                  )}
                  <li>
                    • Tahmini kayıt: <strong>~{transactionCount}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleReset}>
              Filtreleri Temizle
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isExporting}
              >
                İptal
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dışa Aktarılıyor...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Dışa Aktar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionExportModal;
