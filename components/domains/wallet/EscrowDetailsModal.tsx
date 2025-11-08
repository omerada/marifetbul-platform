/**
 * ================================================
 * ESCROW DETAILS MODAL COMPONENT
 * ================================================
 * Full escrow transaction details with timeline
 *
 * Features:
 * - Complete escrow information
 * - Visual timeline (payment → escrow → release)
 * - Order information with link
 * - Status history
 * - Action buttons (release/dispute)
 * - Auto-release countdown
 *
 * Sprint 1 - Epic 1.2 - Days 4-5
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Lock,
  Unlock,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from '@/lib/shared/formatters';
import type { EscrowItem } from './EscrowList';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowDetailsModalProps {
  /** Escrow item to display */
  escrow: EscrowItem | null;

  /** Whether modal is open */
  isOpen: boolean;

  /** Callback when modal is closed */
  onClose: () => void;

  /** Callback when release is requested */
  onRelease?: (escrow: EscrowItem) => void;

  /** Callback when dispute is requested */
  onDispute?: (escrow: EscrowItem) => void;

  /** Loading state for actions */
  isProcessing?: boolean;
}

interface TimelineEvent {
  id: string;
  type: 'payment' | 'escrow' | 'release' | 'dispute';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  color: string;
  isCompleted: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Sprint 1 Cleanup: Local formatDate and formatRelativeTime removed - using canonical formatters

/**
 * Generate timeline events from escrow data
 */
function generateTimeline(escrow: EscrowItem): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Payment event (always first)
  events.push({
    id: 'payment',
    type: 'payment',
    title: 'Ödeme Alındı',
    description: 'Alıcı ödemeyi başarıyla tamamladı',
    date: escrow.createdAt,
    icon: <DollarSign className="h-4 w-4" />,
    color: 'blue',
    isCompleted: true,
  });

  // Escrow hold event
  events.push({
    id: 'escrow',
    type: 'escrow',
    title: 'Emanete Alındı',
    description: 'Ödeme güvenli emanette tutuluyor',
    date: escrow.createdAt,
    icon: <Lock className="h-4 w-4" />,
    color: 'yellow',
    isCompleted: true,
  });

  // Release or auto-release event
  if (escrow.status === 'RELEASED' && escrow.releaseDate) {
    events.push({
      id: 'release',
      type: 'release',
      title: 'Serbest Bırakıldı',
      description: 'Ödeme satıcıya aktarıldı',
      date: escrow.releaseDate,
      icon: <Unlock className="h-4 w-4" />,
      color: 'green',
      isCompleted: true,
    });
  } else if (escrow.status === 'DISPUTED') {
    events.push({
      id: 'dispute',
      type: 'dispute',
      title: 'İtiraz Edildi',
      description: 'İhtilaf süreci başlatıldı',
      date: new Date().toISOString(), // We don't have dispute date, use current
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'red',
      isCompleted: true,
    });
  } else {
    // Pending release
    const autoReleaseDate = new Date(escrow.createdAt);
    autoReleaseDate.setDate(autoReleaseDate.getDate() + 30);

    events.push({
      id: 'pending-release',
      type: 'release',
      title: 'Otomatik Serbest Bırakılacak',
      description: `${escrow.autoReleaseIn || 0} gün kaldı`,
      date: autoReleaseDate.toISOString(),
      icon: <Clock className="h-4 w-4" />,
      color: 'orange',
      isCompleted: false,
    });
  }

  return events;
}

/**
 * Get status badge props
 */
function getStatusBadge(status: EscrowItem['status']) {
  const config: Record<
    EscrowItem['status'],
    {
      label: string;
      variant: 'default' | 'success' | 'warning' | 'destructive';
    }
  > = {
    HELD: { label: 'Emanette', variant: 'warning' },
    PENDING_RELEASE: { label: 'Serbest Bırakılacak', variant: 'warning' },
    RELEASED: { label: 'Serbest Bırakıldı', variant: 'success' },
    DISPUTED: { label: 'İhtilaflı', variant: 'destructive' },
  };

  return config[status];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EscrowDetailsModal({
  escrow,
  isOpen,
  onClose,
  onRelease,
  onDispute,
  isProcessing = false,
}: EscrowDetailsModalProps) {
  if (!escrow) return null;

  const timeline = generateTimeline(escrow);
  const statusBadge = getStatusBadge(escrow.status);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="mb-2 text-2xl">
                Emanet İşlem Detayları
              </DialogTitle>
              <DialogDescription>
                İşlem ID: <code className="text-xs">{escrow.id}</code>
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Amount */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
            <div>
              <div className="text-muted-foreground mb-1 text-sm">Durum</div>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground mb-1 text-sm">Tutar</div>
              <div className="text-3xl font-bold">
                {formatCurrency(escrow.amount)}
              </div>
            </div>
          </div>

          {/* Order Information */}
          {escrow.orderId && (
            <div className="border-border rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="mb-1 text-sm font-medium">Sipariş</div>
                  <div className="text-muted-foreground text-sm">
                    {escrow.orderId}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`/dashboard/orders/${escrow.orderId}`, '_blank')
                  }
                >
                  Siparişi Görüntüle
                  <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Key Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Oluşturulma Tarihi</span>
              </div>
              <div className="text-sm font-medium">
                {formatDate(escrow.createdAt, 'DATETIME')}
              </div>
              <div className="text-muted-foreground text-xs">
                {formatRelativeTime(escrow.createdAt)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Emanette Geçen Süre</span>
              </div>
              <div className="text-sm font-medium">
                {escrow.daysInEscrow} gün
              </div>
              {escrow.autoReleaseIn !== undefined && (
                <div className="text-muted-foreground text-xs">
                  {escrow.autoReleaseIn > 0
                    ? `${escrow.autoReleaseIn} gün içinde otomatik serbest`
                    : 'Otomatik serbest bırakılma tarihi geçti'}
                </div>
              )}
            </div>

            {escrow.releaseDate && (
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Unlock className="h-4 w-4" />
                  <span>Serbest Bırakılma Tarihi</span>
                </div>
                <div className="text-sm font-medium">
                  {formatDate(escrow.releaseDate, 'DATETIME')}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatRelativeTime(escrow.releaseDate)}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>Açıklama</span>
              </div>
              <div className="text-sm font-medium break-words">
                {escrow.description}
              </div>
            </div>
          </div>

          <div className="border-border my-6 border-t" />

          {/* Timeline */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              İşlem Zaman Çizelgesi
            </h3>
            <div className="space-y-4">
              {timeline.map((event, index) => {
                const isLast = index === timeline.length - 1;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Line */}
                    {!isLast && (
                      <div
                        className={`absolute top-10 bottom-0 left-[19px] w-0.5 ${
                          event.isCompleted
                            ? 'bg-primary/30'
                            : 'bg-muted-foreground/20'
                        }`}
                      />
                    )}

                    {/* Event */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div
                        className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          event.isCompleted
                            ? `bg-${event.color}-100 dark:bg-${event.color}-950/20 text-${event.color}-600 dark:text-${event.color}-400`
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {event.isCompleted ? (
                          event.icon
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="mb-1 font-medium">{event.title}</h4>
                            <p className="text-muted-foreground text-sm">
                              {event.description}
                            </p>
                          </div>
                          {event.isCompleted ? (
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="text-muted-foreground/50 h-5 w-5 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-muted-foreground mt-2 text-xs">
                          {formatDate(event.date, 'DATETIME')}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Auto-release Warning */}
          {escrow.status === 'PENDING_RELEASE' && escrow.autoReleaseIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/20"
            >
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="mb-1 font-medium text-orange-900 dark:text-orange-100">
                    Otomatik Serbest Bırakma Yaklaşıyor
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Bu ödeme {escrow.autoReleaseIn} gün içinde otomatik olarak
                    serbest bırakılacaktır. İtiraz etmek istiyorsanız lütfen
                    süre dolmadan önce işlem yapın.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {(escrow.status === 'HELD' ||
            escrow.status === 'PENDING_RELEASE') && (
            <div className="flex gap-3">
              <Button
                className="flex-1"
                size="lg"
                onClick={() => onRelease?.(escrow)}
                disabled={isProcessing}
              >
                <Unlock className="mr-2 h-4 w-4" />
                {isProcessing ? 'İşleniyor...' : 'Ödemeyi Serbest Bırak'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onDispute?.(escrow)}
                disabled={isProcessing}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                İtiraz Et
              </Button>
            </div>
          )}

          {/* Released Info */}
          {escrow.status === 'RELEASED' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <div className="flex gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="mb-1 font-medium text-green-900 dark:text-green-100">
                    Ödeme Başarıyla Serbest Bırakıldı
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Bu ödeme satıcıya aktarılmıştır ve artık cüzdanında
                    kullanılabilir.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Disputed Info */}
          {escrow.status === 'DISPUTED' && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <h4 className="mb-1 font-medium text-red-900 dark:text-red-100">
                    İhtilaf Süreci Devam Ediyor
                  </h4>
                  <p className="mb-3 text-sm text-red-700 dark:text-red-300">
                    Bu ödeme için ihtilaf başlatılmıştır. Moderatör ekibimiz
                    durumu inceleyecek ve en kısa sürede sonuçlandıracaktır.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/dashboard/disputes?orderId=${escrow.orderId}`,
                        '_blank'
                      )
                    }
                  >
                    İhtilafı Görüntüle
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EscrowDetailsModal;
