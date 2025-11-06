/**
 * ================================================
 * BULK REFUND ACTIONS COMPONENT
 * ================================================
 * Component for bulk refund approval actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 31, 2025
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface BulkRefundActionsProps {
  selectedCount: number;
  onBulkApprove: (notes?: string) => Promise<void>;
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
      await onBulkApprove(notes);
      setNotes('');
      setShowNotesInput(false);
      toast.success(`${selectedCount} iade talebi başarıyla onaylandı`);
    } catch (error) {
      logger.error('Bulk approve failed:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Toplu onaylama sırasında bir hata oluştu');
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
