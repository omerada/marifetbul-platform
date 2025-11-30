'use client';

/**
 * ================================================
 * REPORT DETAIL MODAL COMPONENT
 * ================================================
 * Modal for viewing and moderating individual reports
 *
 * Sprint 1 - Story 3, Task 3.2
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, XCircle, ArrowUpCircle } from 'lucide-react';
import type { Report } from '@/lib/api/moderator';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface ReportDetailModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    reportId: string,
    action: string,
    notes?: string
  ) => Promise<void>;
  onDismiss: (reportId: string, reason: string) => Promise<void>;
  onEscalate: (reportId: string, reason: string) => Promise<void>;
}

export function ReportDetailModal({
  report,
  isOpen,
  onClose,
  onResolve,
  onDismiss,
  onEscalate,
}: ReportDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResolve = async () => {
    const action = prompt('İşlem türü (warn_user, remove_content, ban_user):');
    if (!action) return;

    setIsProcessing(true);
    try {
      await onResolve(report.id, action, notes || undefined);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async () => {
    const reason = prompt('Reddetme nedeni:');
    if (!reason) return;

    setIsProcessing(true);
    try {
      await onDismiss(report.id, reason);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEscalate = async () => {
    const reason = prompt('Yükseltme nedeni:');
    if (!reason) return;

    setIsProcessing(true);
    try {
      await onEscalate(report.id, reason);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rapor Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reporter Info */}
          <div>
            <p className="text-sm font-medium">Raporlayan:</p>
            <div className="flex items-center gap-2">
              <span className="font-medium">{report.reporter.fullName}</span>
              <span className="text-muted-foreground text-sm">
                @{report.reporter.username}
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              {formatDistanceToNow(new Date(report.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>

          {/* Report Type & Priority */}
          <div className="flex gap-4">
            <div>
              <p className="text-sm font-medium">Tür:</p>
              <Badge>{report.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Öncelik:</p>
              <Badge
                variant={report.priority === 'HIGH' ? 'destructive' : 'warning'}
              >
                {report.priority}
              </Badge>
            </div>
          </div>

          {/* Target Info */}
          <div>
            <p className="text-sm font-medium">Hedef İçerik:</p>
            <p className="text-muted-foreground text-sm">
              {report.contentType} #{report.contentId}
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium">Açıklama:</p>
            <p className="bg-muted rounded-lg p-3 text-sm">
              {report.description}
            </p>
          </div>

          {/* Evidence */}
          {report.evidence && (
            <div>
              <p className="text-sm font-medium">Kanıt:</p>
              <p className="bg-muted rounded-lg p-3 text-sm">
                {report.evidence}
              </p>
            </div>
          )}

          {/* Moderator Notes */}
          <div>
            <label className="text-sm font-medium">
              Moderatör Notları (Opsiyonel):
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="İç notlar ekleyin..."
              rows={3}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2">
            <UnifiedButton
              onClick={handleResolve}
              disabled={isProcessing}
              variant="success"
              className="gap-1"
            >
              <CheckCircle className="h-4 w-4" />
              Çözümle
            </UnifiedButton>
            <UnifiedButton
              onClick={handleDismiss}
              disabled={isProcessing}
              variant="destructive"
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reddet
            </UnifiedButton>
            <UnifiedButton
              onClick={handleEscalate}
              disabled={isProcessing}
              variant="outline"
              className="gap-1"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Yükselt
            </UnifiedButton>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
