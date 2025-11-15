/**
 * ================================================
 * USER DISPUTE DETAIL PAGE
 * ================================================
 * Sprint 1 - Day 4.2: User-facing dispute detail page
 *
 * Features:
 * - View dispute details
 * - Add evidence
 * - View messages
 * - Escalate dispute
 * - View resolution
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
  escalateDispute,
} from '@/lib/api/disputes';
import type { DisputeResponse, DisputeEvidence } from '@/types/dispute';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import {
  disputeStatusLabels,
  disputeReasonLabels,
  disputeStatusColors,
  isDisputeResolved,
} from '@/types/dispute';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { DisputeMessaging } from '@/components/domains/disputes';
import { EvidenceUploadV2 } from '@/components/domains/disputes/EvidenceUploadV2';
import { EvidenceGallery } from '@/components/domains/disputes/EvidenceGallery';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Shield,
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Flag,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatDate } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';

// ================================================
// TYPES
// ================================================

interface UserDisputeDetailPageProps {
  params: Promise<{ id: string }>;
}

// ================================================
// COMPONENT
// ================================================

export default function UserDisputeDetailPage({
  params,
}: UserDisputeDetailPageProps) {
  const router = useRouter();
  authSelectors.useIsAuthenticated(); // Ensure authenticated
  const [disputeId, setDisputeId] = useState<string>('');
  const [dispute, setDispute] = useState<DisputeResponse | null>(null);
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
  const [isEscalating, setIsEscalating] = useState(false);

  const socket = useWebSocket();

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
      const [disputeData, evidenceData, timelineData] = await Promise.all([
        getDispute(disputeId),
        getDisputeEvidence(disputeId),
        getDisputeTimeline(disputeId),
      ]);

      setDispute(disputeData);
      setEvidence(evidenceData);
      setTimeline(timelineData);
    } catch (error) {
      logger.error(
        'Failed to fetch dispute data:',
        error instanceof Error ? error : new Error(String(error))
      );
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

  // WebSocket subscription for real-time updates
  useEffect(() => {
    if (!socket.isConnected || !disputeId) return;

    const subscriptionId = socket.subscribe(
      `/topic/disputes/${disputeId}`,
      (message: unknown) => {
        try {
          if (!message || typeof message !== 'object' || !('body' in message)) {
            return;
          }

          const msgBody = (message as { body: string }).body;
          const payload = JSON.parse(msgBody);

          // Handle different event types
          if (payload.type === 'DISPUTE_STATUS_CHANGED') {
            toast.info('İtiraz Durumu Güncellendi', {
              description: `Yeni durum: ${disputeStatusLabels[payload.newStatus as keyof typeof disputeStatusLabels]}`,
            });
            fetchDisputeData();
          } else if (payload.type === 'EVIDENCE_UPLOADED') {
            toast.success('Yeni Kanıt Eklendi', {
              description: 'Kanıt listesi güncellendi',
            });
            fetchDisputeData();
          } else if (payload.type === 'DISPUTE_MESSAGE') {
            // Message component handles this via its own WebSocket
          }
        } catch (err) {
          logger.error(
            'Failed to parse dispute WebSocket update',
            err instanceof Error ? err : new Error(String(err))
          );
        }
      }
    );

    return () => {
      socket.unsubscribe(subscriptionId);
    };
  }, [socket, disputeId, fetchDisputeData]);

  // Handle escalate dispute
  const handleEscalate = async () => {
    if (!disputeId) return;

    setIsEscalating(true);
    try {
      await escalateDispute(disputeId, 'Kullanıcı tarafından yükseltildi');
      toast.success('İtiraz Yükseltildi', {
        description: 'İtirazınız yöneticilere yönlendirildi.',
      });
      fetchDisputeData(); // Refresh data
    } catch (error) {
      logger.error(
        'Failed to escalate dispute:',
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error('İşlem Başarısız', {
        description: 'İtiraz yükseltilirken bir hata oluştu.',
      });
    } finally {
      setIsEscalating(false);
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
        <Link href="/dashboard/disputes">
          <Button variant="primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            İtirazlarıma Dön
          </Button>
        </Link>
      </div>
    );
  }

  const isResolved = isDisputeResolved(dispute);
  const canEscalate = !isResolved && dispute.status === 'OPEN';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/dashboard/disputes"
            className="text-gray-600 hover:text-gray-900"
          >
            İtirazlarım
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

          <Badge className={disputeStatusColors[dispute.status]}>
            {disputeStatusLabels[dispute.status]}
          </Badge>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Info & Messages (2/3 width) */}
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
                    <p className="mt-1 flex items-center gap-2 text-gray-900">
                      <Flag className="h-4 w-4 text-gray-400" />
                      {disputeReasonLabels[dispute.reason]}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Açıklama
                  </label>
                  <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm whitespace-pre-wrap text-gray-900">
                    {dispute.description}
                  </p>
                </div>

                <div className="border-t pt-4">
                  <Link
                    href={`/dashboard/orders/${dispute.orderId}`}
                    className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Package className="h-4 w-4" />
                    Sipariş Detayına Git
                  </Link>
                </div>
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
                  <FileText className="h-5 w-5 text-purple-600" />
                  Mesajlar
                </h2>
              </div>
              <div className="h-[600px]">
                <DisputeMessaging disputeId={disputeId} />
              </div>
            </Card>
          </div>

          {/* Right Column - Actions & Evidence (1/3 width) */}
          <div className="space-y-6">
            {/* Evidence Upload */}
            {!isResolved && (
              <Card className="p-6">
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Upload className="h-5 w-5 text-purple-600" />
                  Kanıt Yükle
                </h2>
                <EvidenceUploadV2
                  disputeId={disputeId}
                  onUploadComplete={fetchDisputeData}
                />
              </Card>
            )}

            {/* Actions Card */}
            {!isResolved && canEscalate && (
              <Card className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  İşlemler
                </h2>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEscalate}
                  disabled={isEscalating}
                  className="w-full text-red-700 hover:bg-red-50"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  {isEscalating ? 'Yükseltiliyor...' : 'İtirazı Yükselt'}
                </Button>
              </Card>
            )}

            {/* Evidence Gallery */}
            <Card className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-purple-600" />
                Kanıtlar ({evidence.length})
              </h2>

              <EvidenceGallery evidence={evidence} />
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
    </div>
  );
}
