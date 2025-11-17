'use client';

/**
 * ================================================
 * BULK REFUND ACTIONS COMPONENT
 * ================================================
 * Component for bulk refund approval actions
 * Sprint 1 - Story 1.1: Enhanced with detailed response handling
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 17, 2025 - Enhanced response handling
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { CheckCircle, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { BulkApprovalResponse } from '@/types/business/features/refund';

// ================================================
// TYPES
// ================================================

interface BulkRefundActionsProps {
  selectedCount: number;
  onBulkApprove: (notes?: string) => Promise<BulkApprovalResponse>;
  onClearSelection: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function BulkRefundActions({
  selectedCount,
  onBulkApprove,
  onClearSelection,
}: BulkRefundActionsProps) {
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkApprove = async () => {
    setIsProcessing(true);
    try {
      const response = await onBulkApprove(notes);

      // Show detailed success/failure toast
      if (response.failedCount === 0) {
        toast.success('Toplu Onay Başarılı', {
          description: `${response.approvedCount} iade talebi onaylandı. Toplam: ₺${response.totalAmountApproved?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
          duration: 5000,
        });
      } else if (response.approvedCount > 0) {
        toast.warning('Kısmi Başarı', {
          description: `${response.approvedCount} onaylandı, ${response.failedCount} başarısız oldu.`,
          duration: 7000,
        });
      } else {
        toast.error('Toplu Onay Başarısız', {
          description: `${response.failedCount} iade talebi onaylanamadı.`,
          duration: 7000,
        });
      }

      // Log detailed errors
      if (response.errors && response.errors.length > 0) {
        logger.error('[BulkRefundActions] Bulk approval errors:', {
          errors: response.errors,
          failedCount: response.failedCount,
        });
      }

      setNotes('');
      setShowNotesInput(false);
    } catch (error) {
      logger.error('[BulkRefundActions] Bulk approve failed:', error);
      toast.error('Hata', {
        description:
          'Toplu onaylama sırasında bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-primary/10 border-primary rounded-lg border p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-primary h-5 w-5" />
            <span className="font-medium">
              {selectedCount} iade talebi seçildi
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="mr-2 h-4 w-4" />
            Seçimi Temizle
          </Button>
        </div>

        {showNotesInput && (
          <div className="space-y-2">
            <Label htmlFor="bulkNotes">Toplu Onay Notu (Opsiyonel)</Label>
            <Textarea
              id="bulkNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Toplu onay için bir not ekleyin..."
              rows={3}
            />
          </div>
        )}

        <div className="flex gap-2">
          {!showNotesInput ? (
            <>
              <Button
                onClick={() => setShowNotesInput(true)}
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Seçilenleri Onayla
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkApprove}
                disabled={isProcessing}
              >
                Not Eklemeden Onayla
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleBulkApprove} disabled={isProcessing}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayı Tamamla
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNotesInput(false);
                  setNotes('');
                }}
                disabled={isProcessing}
              >
                İptal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
