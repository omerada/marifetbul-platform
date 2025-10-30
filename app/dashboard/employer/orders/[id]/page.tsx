'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import {
  ApproveDeliveryModal,
  RequestRevisionModal,
  DisputeModal,
  OrderReviewButton,
  OrderTimeline,
  EscrowStatus,
} from '@/components/domains/orders';
import { MessageButton } from '@/components/domains/messaging';
import {
  Package,
  Clock,
  CheckCircle,
  RefreshCw,
  User,
  FileText,
  Download,
  AlertCircle,
  XCircle,
  ChevronLeft,
} from 'lucide-react';
import type { Order } from '@/types/business/features/orders';
import Link from 'next/link';
import { useWebSocket } from '@/hooks';
import { toast } from 'sonner';
import { OrderDetailSkeleton } from '@/components/shared/LoadingSkeleton';

export default function EmployerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);

  // WebSocket for real-time order updates
  const { subscribe, unsubscribe, isConnected } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  const loadOrder = React.useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/orders/${orderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Sipariş bulunamadı');
        }
        throw new Error('Sipariş yüklenemedi');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Subscribe to order updates via WebSocket
  useEffect(() => {
    if (!orderId || !isConnected) return;

    const destination = `/topic/orders/${orderId}`;
    const _subscriptionId = subscribe(destination, (msg: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = msg as any;
      const update = message.body;

      if (update.type === 'ORDER_STATUS_CHANGED') {
        // Update order with new data
        setOrder((prev) => (prev ? { ...prev, ...update.data } : null));

        // Show notification
        const statusTexts: Record<string, string> = {
          delivered: 'Sipariş teslim edildi',
          completed: 'Sipariş tamamlandı',
          cancelled: 'Sipariş iptal edildi',
          disputed: 'Sipariş itiraz edildi',
        };

        toast.success(
          statusTexts[update.data.status] || 'Sipariş durumu güncellendi',
          {
            description: `Sipariş #${update.data.orderNumber}`,
            duration: 5000,
          }
        );
      } else if (update.type === 'ORDER_UPDATED') {
        // Reload full order data
        loadOrder();
      }
    });

    return () => {
      unsubscribe(destination);
    };
  }, [orderId, isConnected, subscribe, unsubscribe, loadOrder]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleModalSuccess = () => {
    loadOrder();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      disputed: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Beklemede',
      active: 'Aktif',
      in_progress: 'Devam Ediyor',
      delivered: 'Teslim Edildi',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
      disputed: 'Anlaşmazlık',
    };
    return texts[status] || status;
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      TRY: '₺',
    };
    return `${symbols[currency] || currency} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimelineLabel = (type: string, from: string) => {
    const labels: Record<string, Record<string, string>> = {
      message: {
        buyer: 'Mesaj gönderdiniz',
        seller: 'Satıcı mesaj gönderdi',
        system: 'Sistem mesajı',
      },
      delivery: {
        seller: 'Satıcı teslimat yaptı',
        system: 'Teslimat gerçekleşti',
      },
      acceptance: {
        buyer: 'Teslimatı onayladınız',
        system: 'Teslimat onaylandı',
      },
      revision_request: {
        buyer: 'Revizyon talep ettiniz',
        system: 'Revizyon talep edildi',
      },
      cancellation: {
        system: 'Sipariş iptal edildi',
      },
    };
    return labels[type]?.[from] || 'Aktivite';
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Sipariş Bulunamadı</h2>
          <p className="mb-6 text-gray-600">{error || 'Bir hata oluştu'}</p>
          <Button onClick={() => router.push('/dashboard/employer/orders')}>
            Siparişlere Dön
          </Button>
        </Card>
      </div>
    );
  }

  const canRequestRevision =
    order.status === 'delivered' && order.deliverables.length > 0;
  const canApproveDelivery =
    order.status === 'delivered' && order.deliverables.length > 0;
  const canDispute = ['active', 'in_progress', 'delivered'].includes(
    order.status
  );
  const isCompleted = order.status === 'completed';

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
      {/* Header - Mobile optimized */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard/employer/orders"
          className="text-primary-600 hover:text-primary-700 mb-3 inline-flex items-center text-sm sm:mb-4"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Siparişlere Dön
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 truncate text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
              Sipariş #{order.orderNumber}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm ${getStatusColor(order.status)}`}
              >
                {getStatusText(order.status)}
              </span>
              <span className="text-xs text-gray-500 sm:text-sm">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="mb-1 text-xs text-gray-500 sm:text-sm">
              Toplam Tutar
            </div>
            <div className="text-xl font-bold text-gray-900 sm:text-2xl">
              {formatCurrency(order.amount, order.currency)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* Seller Info - Mobile optimized */}
          <Card className="p-4 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
              <User className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              Satıcı Bilgileri
            </h2>
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="bg-primary-100 flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16">
                <User className="text-primary-600 h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                  {order.seller?.name || 'Satıcı'}
                </h3>
                <p className="truncate text-xs text-gray-600 sm:text-sm">
                  {order.seller?.email || 'Email bulunamadı'}
                </p>
              </div>
              <MessageButton
                recipientId={order.sellerId}
                recipientName={order.seller?.name || 'Satıcı'}
                size="sm"
              />
            </div>
          </Card>

          {/* Order Details - Mobile optimized */}
          <Card className="p-4 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold sm:mb-4 sm:text-lg">
              <Package className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
              Sipariş Detayları
            </h2>
            {order.customOrderDetails ? (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold text-gray-900">
                    {order.customOrderDetails.title}
                  </h3>
                  <p className="text-gray-600">
                    {order.customOrderDetails.description}
                  </p>
                </div>
                {order.customOrderDetails.requirements.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                      Gereksinimler:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      {order.customOrderDetails.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {order.customOrderDetails.features.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">
                      Özellikler:
                    </h4>
                    <ul className="list-inside list-disc space-y-1 text-gray-600">
                      {order.customOrderDetails.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center gap-6 border-t pt-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {order.customOrderDetails.deliveryTime} gün teslimat
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <RefreshCw className="h-4 w-4" />
                    <span className="text-sm">
                      {order.customOrderDetails.revisions} revizyon
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                Paket siparişi - detaylar yükleniyor...
              </p>
            )}
          </Card>

          {/* Requirements */}
          {order.requirements.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Gereksinimler
              </h2>
              <div className="space-y-4">
                {order.requirements.map((req) => (
                  <div
                    key={req.id}
                    className="border-primary-500 border-l-4 pl-4"
                  >
                    <h3 className="mb-1 font-medium text-gray-900">
                      {req.title}
                      {req.isRequired && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </h3>
                    <p className="mb-2 text-sm text-gray-600">
                      {req.description}
                    </p>
                    {req.response && (
                      <div className="mt-2 rounded-lg bg-gray-50 p-3">
                        <div className="mb-1 text-sm font-medium text-gray-700">
                          Yanıtınız:
                        </div>
                        <div className="text-sm text-gray-900">
                          {Array.isArray(req.response.value)
                            ? req.response.value.join(', ')
                            : req.response.value}
                        </div>
                        {req.response.files &&
                          req.response.files.length > 0 && (
                            <div className="mt-2">
                              <div className="mb-1 text-xs text-gray-600">
                                Dosyalar:
                              </div>
                              {req.response.files.map((file, idx) => (
                                <a
                                  key={idx}
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  Dosya {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(req.response.submittedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Deliverables */}
          {order.deliverables.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                Teslimatlar
              </h2>
              <div className="space-y-4">
                {order.deliverables.map((deliverable) => (
                  <div
                    key={deliverable.id}
                    className={`rounded-lg border p-4 ${
                      deliverable.isAccepted
                        ? 'border-green-200 bg-green-50'
                        : deliverable.rejectedAt
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-medium text-gray-900">
                        {deliverable.title}
                      </h3>
                      {deliverable.isAccepted && (
                        <span className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Onaylandı
                        </span>
                      )}
                      {deliverable.rejectedAt && (
                        <span className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                          <XCircle className="h-3 w-3" />
                          Reddedildi
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-sm text-gray-600">
                      {deliverable.description}
                    </p>
                    {deliverable.files && deliverable.files.length > 0 && (
                      <div className="mb-3">
                        <div className="mb-2 text-xs font-medium text-gray-700">
                          Dosyalar:
                        </div>
                        <div className="space-y-1">
                          {deliverable.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 flex items-center gap-2 text-sm"
                            >
                              <Download className="h-4 w-4" />
                              Dosya {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {deliverable.rejectionReason && (
                      <div className="mb-3 rounded border border-red-200 bg-red-100 p-3">
                        <div className="mb-1 text-xs font-medium text-red-800">
                          Red Nedeni:
                        </div>
                        <div className="text-sm text-red-700">
                          {deliverable.rejectionReason}
                        </div>
                      </div>
                    )}
                    {deliverable.revisionNotes && (
                      <div className="mb-3 rounded border border-yellow-200 bg-yellow-50 p-3">
                        <div className="mb-1 text-xs font-medium text-yellow-800">
                          Revizyon Notları:
                        </div>
                        <div className="text-sm text-yellow-700">
                          {deliverable.revisionNotes}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Teslim: {formatDate(deliverable.deliveredAt)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Timeline */}
          <OrderTimeline
            events={order.communications.map((comm) => ({
              id: comm.id,
              status: comm.type,
              title: getTimelineLabel(comm.type, comm.from),
              description: comm.message,
              timestamp: comm.timestamp,
              actor:
                comm.from === 'buyer'
                  ? 'Siz'
                  : comm.from === 'seller'
                    ? order.seller?.name || 'Satıcı'
                    : 'Sistem',
              isCompleted: true,
              isCurrent: false,
            }))}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Escrow Status */}
          {order.paymentStatus === 'paid' && (
            <EscrowStatus
              escrow={{
                status: order.status === 'completed' ? 'RELEASED' : 'HELD',
                amount: order.amount,
                currency: order.currency,
                heldAt: order.createdAt,
                releasedAt: order.completedAt,
                releaseCondition:
                  'Teslimatı onayladıktan sonra satıcıya aktarılacak',
              }}
            />
          )}

          {/* Actions */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">İşlemler</h2>
            <div className="space-y-3">
              {canApproveDelivery && (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setApproveModalOpen(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Teslimatı Onayla
                </Button>
              )}
              {canRequestRevision && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setRevisionModalOpen(true)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Revizyon Talep Et
                </Button>
              )}
              {canDispute && (
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setDisputeModalOpen(true)}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Anlaşmazlık Bildir
                </Button>
              )}
              {isCompleted && (
                <OrderReviewButton
                  orderId={order.id}
                  orderStatus={order.status}
                  orderTitle={order.customOrderDetails?.title}
                  completedAt={order.completedAt}
                  hasExistingReview={false}
                  variant="primary"
                  size="md"
                />
              )}
            </div>
          </Card>

          {/* Order Info */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold">Sipariş Bilgileri</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 text-gray-500">Sipariş Numarası</div>
                <div className="font-medium text-gray-900">
                  #{order.orderNumber}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-500">Durum</div>
                <div className="font-medium text-gray-900">
                  {getStatusText(order.status)}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-500">Tutar</div>
                <div className="font-medium text-gray-900">
                  {formatCurrency(order.amount, order.currency)}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-500">Ödeme Durumu</div>
                <div className="font-medium text-gray-900">
                  {order.paymentStatus === 'paid'
                    ? 'Ödendi'
                    : order.paymentStatus === 'pending'
                      ? 'Beklemede'
                      : order.paymentStatus}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-500">Teslim Tarihi</div>
                <div className="font-medium text-gray-900">
                  {formatDate(order.deliveryDate)}
                </div>
              </div>
              <div>
                <div className="mb-1 text-gray-500">Oluşturma Tarihi</div>
                <div className="font-medium text-gray-900">
                  {formatDate(order.createdAt)}
                </div>
              </div>
              {order.completedAt && (
                <div>
                  <div className="mb-1 text-gray-500">Tamamlanma Tarihi</div>
                  <div className="font-medium text-gray-900">
                    {formatDate(order.completedAt)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Milestones */}
          {order.milestones.length > 0 && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Kilometre Taşları</h2>
              <div className="space-y-3">
                {order.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`rounded-lg border p-3 ${
                      milestone.status === 'completed'
                        ? 'border-green-200 bg-green-50'
                        : milestone.status === 'overdue'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-1 text-sm font-medium text-gray-900">
                      {milestone.title}
                    </div>
                    <div className="mb-2 text-xs text-gray-600">
                      {milestone.description}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {formatCurrency(milestone.amount, order.currency)}
                      </span>
                      <span
                        className={
                          milestone.status === 'completed'
                            ? 'text-green-600'
                            : milestone.status === 'overdue'
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }
                      >
                        {milestone.status === 'completed'
                          ? 'Tamamlandı'
                          : milestone.status === 'overdue'
                            ? 'Gecikti'
                            : milestone.status === 'in_progress'
                              ? 'Devam Ediyor'
                              : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      {approveModalOpen && order.deliverables.length > 0 && (
        <ApproveDeliveryModal
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          orderId={order.id}
          orderTitle={
            order.customOrderDetails?.title || `Sipariş #${order.orderNumber}`
          }
          deliveryNote={
            order.deliverables[order.deliverables.length - 1]?.description
          }
          attachments={order.deliverables[order.deliverables.length - 1]?.files}
          freelancerName={order.seller?.name || 'Satıcı'}
          amount={order.amount}
          currency={order.currency}
          onSuccess={handleModalSuccess}
        />
      )}
      {revisionModalOpen && (
        <RequestRevisionModal
          isOpen={revisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          orderId={order.id}
          orderTitle={
            order.customOrderDetails?.title || `Sipariş #${order.orderNumber}`
          }
          currentRevisionCount={
            order.deliverables.filter((d) => d.revisionRequested).length
          }
          maxRevisions={order.customOrderDetails?.revisions || 1}
          deliveryNote={
            order.deliverables[order.deliverables.length - 1]?.description
          }
          onSuccess={handleModalSuccess}
        />
      )}
      {disputeModalOpen && order && (
        <DisputeModal
          isOpen={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          orderId={order.id}
          orderNumber={order.orderNumber}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
