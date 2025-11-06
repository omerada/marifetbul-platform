/**
 * ================================================
 * ADMIN DISPUTE DETAIL PAGE
 * ================================================
 * Sprint 1 - Day 2.1: Dedicated dispute detail page
 *
 * Features:
 * - Full-screen dispute detail view
 * - Evidence gallery with lightbox
 * - Complete timeline visualization
 * - Messaging interface
 * - Resolution form
 * - Real-time updates
 * - Navigation breadcrumbs
 *
 * Layout:
 * - Left column: Timeline + Messages (2/3 width)
 * - Right column: Evidence + Resolution form (1/3 width)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Dispute System
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';
import {
  getDispute,
  getDisputeEvidence,
  getDisputeTimeline,
} from '@/lib/api/disputes';
import { orderApi } from '@/lib/api/orders';
import { useAuthState } from '@/hooks/shared/useAuth';
import type { DisputeResponse, DisputeEvidence } from '@/types/dispute';
import type { OrderResponse } from '@/types/backend-aligned';
import {
  disputeStatusLabels,
  disputeReasonLabels,
  disputeStatusColors,
  isDisputeResolved,
} from '@/types/dispute';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import DisputeResolutionModal from '@/components/admin/disputes/DisputeResolutionModal';
import DisputeMessages from '@/components/domains/disputes/DisputeMessages';
import {
  ArrowLeft,
  Calendar,
  User,
  Package,
  FileText,
  Download,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

interface DisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount);
}

// ================================================
// COMPONENT
// ================================================

export default function AdminDisputeDetailPage({
  params,
}: DisputeDetailPageProps) {
  const router = useRouter();
  const { user } = useAuthState();
  const [disputeId, setDisputeId] = useState<string>('');
  const [dispute, setDispute] = useState<DisputeResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [timeline, setTimeline] = useState<
    Array<{
      id: string;
      eventType: string;
      description: string;
      timestamp: string;
      performedBy?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Resolve params promise
  useEffect(() => {
    params.then((resolvedParams) => {
      setDisputeId(resolvedParams.id);
    });
  }, [params]);

  // Fetch all dispute data
  const fetchDisputeData = useCallback(async () => {
    if (!disputeId) return;

    setIsLoading(true);
    try {
      // Fetch dispute details
      const disputeData = await getDispute(disputeId);
      setDispute(disputeData);

      // Fetch related data in parallel
      const [orderData, evidenceData, timelineData] = await Promise.allSettled([
        orderApi.getOrderById(disputeData.orderId),
        getDisputeEvidence(disputeId),
        getDisputeTimeline(disputeId),
      ]);

      if (orderData.status === 'fulfilled') {
        setOrder(orderData.value.data);
      }
      if (evidenceData.status === 'fulfilled') {
        setEvidence(evidenceData.value);
      }
      if (timelineData.status === 'fulfilled') {
        setTimeline(timelineData.value);
      }
    } catch (error) {
      logger.error('Failed to fetch dispute data:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Veri Yüklenemedi', {
        description: 'İtiraz bilgileri yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    fetchDisputeData();
  }, [fetchDisputeData]);

  // Handle resolution success
  const handleResolutionSuccess = () => {
    toast.success('İşlem Başarılı', {
      description: 'İtiraz çözümlendi ve veriler güncellendi.',
    });
    fetchDisputeData(); // Refresh data
    setIsResolutionModalOpen(false);
  };

  // Handle image download
  const handleDownloadEvidence = async (url: string, fileName: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      logger.error('Failed to download evidence:', error instanceof Error ? error : new Error(String(error)));
      toast.error('İndirme başarısız', {
        description: 'Dosya indirilemedi.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="İtiraz yükleniyor..." />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <AlertCircle className="h-16 w-16 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-900">İtiraz Bulunamadı</h2>
        <p className="text-gray-600">
          Aradığınız itiraz mevcut değil veya silinmiş olabilir.
        </p>
        <Link href="/admin/disputes">
          <Button variant="primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            İtiraz Listesine Dön
          </Button>
        </Link>
      </div>
    );
  }

  const isResolved = isDisputeResolved(dispute);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/admin/disputes"
            className="text-gray-600 hover:text-gray-900"
          >
            İtirazlar
          </Link>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-900">
            #{dispute.id.slice(0, 8)}
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Shield className="h-6 w-6 text-purple-600" />
                İtiraz Detayı
              </h1>
              <p className="mt-1 text-gray-600">
                İtiraz #{dispute.id.slice(0, 8)} • Sipariş #
                {dispute.orderId.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={disputeStatusColors[dispute.status]}>
              {disputeStatusLabels[dispute.status]}
            </Badge>
            {!isResolved && (
              <Button
                variant="primary"
                onClick={() => setIsResolutionModalOpen(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                İtirazı Çözümle
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Timeline & Messages (2/3 width) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Dispute Information Card */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                İtiraz Bilgileri
              </h2>

              <div className="space-y-4">
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

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Neden
                    </label>
                    <p className="mt-1 text-gray-900">
                      {disputeReasonLabels[dispute.reason]}
                    </p>
                  </div>

                  {order && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Sipariş Tutarı
                      </label>
                      <p className="mt-1 flex items-center gap-2 text-gray-900">
                        <Package className="h-4 w-4 text-gray-400" />
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Açıklama
                  </label>
                  <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-900">
                    {dispute.description}
                  </p>
                </div>

                {order && (
                  <div className="border-t pt-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Sipariş Detayına Git
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline Card */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Clock className="h-5 w-5 text-purple-600" />
                Zaman Çizelgesi
              </h2>

              {timeline.length === 0 ? (
                <p className="py-8 text-center text-gray-600">
                  Henüz hiçbir olay kaydedilmedi.
                </p>
              ) : (
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute top-3 bottom-3 left-5 w-0.5 bg-gray-200" />

                  {timeline.map((event) => (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Timeline Dot */}
                      <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-purple-100">
                        <div className="h-2 w-2 rounded-full bg-purple-600" />
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {event.description}
                            </p>
                            {event.performedBy && (
                              <p className="mt-1 text-sm text-gray-600">
                                {event.performedBy}
                              </p>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(event.timestamp), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Messages Section */}
            <Card className="overflow-hidden p-0">
              <div className="border-b bg-white px-6 py-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  Mesajlar
                </h2>
              </div>
              <div className="h-[600px]">
                <DisputeMessages
                  disputeId={disputeId}
                  currentUserId={user?.id || 'admin'}
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Evidence & Resolution (1/3 width) */}
          <div className="space-y-6">
            {/* Evidence Gallery */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-purple-600" />
                Kanıtlar ({evidence.length})
              </h2>

              {evidence.length === 0 ? (
                <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Henüz kanıt yüklenmedi
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
                    >
                      {/* Evidence Preview */}
                      <div
                        className="relative aspect-video cursor-pointer bg-gray-100"
                        onClick={() => setSelectedImage(item.fileUrl)}
                      >
                        <Image
                          src={item.fileUrl}
                          alt={item.fileName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-10" />
                      </div>

                      {/* Evidence Info */}
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.fileName}
                        </p>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(item.uploadedAt), {
                              addSuffix: true,
                              locale: tr,
                            })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDownloadEvidence(
                                item.fileUrl,
                                item.fileName
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Resolution Summary (if resolved) */}
            {isResolved && dispute.resolution && (
              <Card className="border-green-200 bg-green-50 p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-green-900">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Çözüm
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-green-700">
                      Çözüm Tarihi
                    </label>
                    <p className="mt-1 text-sm text-green-900">
                      {formatDate(dispute.resolvedAt)}
                    </p>
                  </div>

                  {dispute.resolvedByUserFullName && (
                    <div>
                      <label className="text-sm font-medium text-green-700">
                        Çözümleyen
                      </label>
                      <p className="mt-1 text-sm text-green-900">
                        {dispute.resolvedByUserFullName}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-green-700">
                      Açıklama
                    </label>
                    <p className="mt-1 text-sm whitespace-pre-wrap text-green-900">
                      {dispute.resolution}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {dispute && order && (
        <DisputeResolutionModal
          isOpen={isResolutionModalOpen}
          onClose={() => setIsResolutionModalOpen(false)}
          dispute={dispute}
          orderTotalAmount={order.totalAmount}
          onSuccess={handleResolutionSuccess}
        />
      )}

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative h-full w-full max-w-6xl">
            <Image
              src={selectedImage}
              alt="Evidence"
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
