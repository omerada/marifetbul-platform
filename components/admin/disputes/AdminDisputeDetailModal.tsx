/**
 * ================================================
 * ADMIN DISPUTE DETAIL MODAL
 * ================================================
 * Comprehensive dispute detail view for admins
 *
 * Features:
 * - Complete dispute information
 * - Order details with link
 * - Evidence gallery
 * - Timeline visualization
 * - Quick resolution action
 * - Real-time updates
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 3: Admin Enhancement
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  AlertCircle,
  Package,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  ExternalLink,
  Shield,
} from 'lucide-react';
import Image from 'next/image';
import { orderApi } from '@/lib/api/orders';
import type { DisputeResponse } from '@/types/dispute';
import type { OrderResponse } from '@/types/backend-aligned';
import {
  disputeStatusLabels,
  disputeReasonLabels,
  disputeResolutionTypeLabels,
} from '@/types/dispute';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  DisputeTimeline,
  createTimelineEvents,
} from '@/components/domains/disputes';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';

// ================================================
// TYPES
// ================================================

interface AdminDisputeDetailModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Dispute to display */
  dispute: DisputeResponse | null;
  /** Called when resolution button is clicked */
  onResolve?: (dispute: DisputeResponse) => void;
}

// ================================================
// REMOVED: Local helper functions (Sprint 1 - Cleanup)
// ================================================
// Now using canonical formatters from @/lib/shared/formatters
// ================================================

// ================================================
// COMPONENT
// ================================================

export function AdminDisputeDetailModal({
  isOpen,
  onClose,
  dispute,
  onResolve,
}: AdminDisputeDetailModalProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  // Load order details when dispute changes
  useEffect(() => {
    if (!dispute) return;

    const loadOrder = async () => {
      setIsLoadingOrder(true);
      try {
        const orderData = await orderApi.getOrderById(dispute.orderId);
        setOrder(orderData.data);
      } catch (error) {
        logger.error(
          'Failed to load order:',
          error instanceof Error ? error : new Error(String(error))
        );
        toast.error('Sipariş bilgileri yüklenemedi');
      } finally {
        setIsLoadingOrder(false);
      }
    };

    loadOrder();
  }, [dispute]);

  if (!dispute) return null;

  const isResolved =
    dispute.status === 'RESOLVED' || dispute.status === 'CLOSED';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-purple-600" />
                İtiraz Detayı
              </DialogTitle>
              <DialogDescription className="mt-1">
                İtiraz #{dispute.id.slice(0, 8)}
              </DialogDescription>
            </div>
            <Badge
              variant={isResolved ? 'success' : 'warning'}
              className="ml-4"
            >
              {disputeStatusLabels[dispute.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - 2 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Dispute Information */}
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                İtiraz Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Neden
                  </label>
                  <p className="mt-1 text-gray-900">
                    {disputeReasonLabels[dispute.reason]}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Açıklama
                  </label>
                  <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-900">
                    {dispute.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      İtiraz Eden
                    </label>
                    <p className="mt-1 flex items-center gap-2 text-gray-900">
                      <User className="h-4 w-4 text-gray-400" />
                      {dispute.raisedByUserFullName}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Oluşturulma Tarihi
                    </label>
                    <p className="mt-1 flex items-center gap-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDate(dispute.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Evidence Gallery */}
            {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
              <Card className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Kanıtlar ({dispute.evidenceUrls.length})
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {dispute.evidenceUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                    >
                      <Image
                        src={url}
                        alt={`Kanıt ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Resolution Details */}
            {isResolved && dispute.resolution && (
              <Card className="border-green-200 bg-green-50 p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Çözüm Detayları
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-green-700">
                      Çözüm Tipi
                    </label>
                    <p className="mt-1 text-green-900">
                      {dispute.resolutionType
                        ? disputeResolutionTypeLabels[dispute.resolutionType]
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-green-700">
                      Açıklama
                    </label>
                    <p className="mt-1 rounded-lg bg-white p-3 text-sm whitespace-pre-wrap text-green-900">
                      {dispute.resolution}
                    </p>
                  </div>

                  {dispute.refundAmount && dispute.refundAmount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        İade Tutarı
                      </label>
                      <p className="mt-1 text-lg font-semibold text-green-900">
                        {formatCurrency(dispute.refundAmount, 'TRY')}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Çözümleyen Admin
                      </label>
                      <p className="mt-1 text-green-900">
                        {dispute.resolvedByUserFullName || '-'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Çözüm Tarihi
                      </label>
                      <p className="mt-1 text-green-900">
                        {formatDate(dispute.resolvedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Timeline */}
            <Card className="p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <Clock className="h-5 w-5 text-purple-600" />
                Zaman Çizelgesi
              </h3>
              <DisputeTimeline events={createTimelineEvents(dispute)} compact />
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Order Information */}
            {isLoadingOrder ? (
              <Card className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="h-6 w-32 rounded bg-gray-200" />
                  <div className="h-4 w-20 rounded bg-gray-200" />
                </div>
              </Card>
            ) : order ? (
              <Card className="p-5">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <Package className="h-5 w-5 text-purple-600" />
                  Sipariş Bilgileri
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Sipariş No
                    </label>
                    <p className="mt-1 font-mono text-sm text-gray-900">
                      {order.orderNumber}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Durum
                    </label>
                    <p className="mt-1 text-gray-900">
                      {orderApi.getOrderStatusLabel(order.status)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Tutar
                    </label>
                    <p className="mt-1 text-lg font-semibold text-purple-600">
                      {formatCurrency(order.totalAmount, 'TRY')}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push(`/admin/orders/${order.id}`);
                      onClose();
                    }}
                    className="w-full"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Siparişi Görüntüle
                  </Button>
                </div>
              </Card>
            ) : null}

            {/* Action Buttons */}
            {!isResolved && onResolve && (
              <Card className="border-purple-200 bg-purple-50 p-5">
                <h3 className="mb-3 font-semibold text-purple-900">
                  Hızlı İşlemler
                </h3>
                <Button
                  onClick={() => {
                    onResolve(dispute);
                    onClose();
                  }}
                  className="w-full"
                  variant="primary"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  İtirazı Çözümle
                </Button>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-gray-50 p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                İstatistikler
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">İtiraz ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {dispute.id.slice(0, 13)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş ID:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {dispute.orderId.slice(0, 13)}...
                  </span>
                </div>
                {dispute.evidenceUrls && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kanıt Sayısı:</span>
                    <span className="font-semibold text-gray-900">
                      {dispute.evidenceUrls.length}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminDisputeDetailModal;
