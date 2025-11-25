/**
 * Dispute Detail View Component
 *
 * Production-ready minimal dispute detail page with:
 * - Full dispute information display
 * - Evidence display
 * - Status tracking
 * - Admin resolution display
 *
 * @module components/domains/disputes/DisputeDetailView
 * @version 1.0.0
 * @production-ready ✅
 *
 * @note Advanced features (Timeline, Evidence Upload, Gallery) will be
 * integrated in future iterations after confirming component interfaces.
 */

'use client';

import useSWR from 'swr';
import Image from 'next/image';
import {
  AlertCircle,
  Calendar,
  User,
  FileText,
  Shield,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { getDispute } from '@/lib/api/disputes';
import {
  DisputeResponse,
  disputeStatusLabels,
  disputeStatusColors,
  disputeReasonLabels,
} from '@/types/dispute';
import logger from '@/lib/infrastructure/monitoring/logger';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface DisputeDetailViewProps {
  /** Dispute ID to display */
  disputeId: string;
  /** Current user ID (to determine permissions) */
  currentUserId?: string;
  /** Whether current user is admin */
  isAdmin?: boolean;
  /** Callback when dispute is updated */
  onDisputeUpdate?: (dispute: DisputeResponse) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DisputeDetailView({
  disputeId,
  isAdmin = false,
}: DisputeDetailViewProps) {
  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const {
    data: dispute,
    error,
    isLoading,
  } = useSWR<DisputeResponse>(
    disputeId ? `/api/disputes/${disputeId}` : null,
    () => getDispute(disputeId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">İtiraz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            İtiraz Yüklenemedi
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            İtiraz bilgileri alınamadı. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // STATUS BADGE
  // ============================================================================

  const statusColor = disputeStatusColors[dispute.status];
  const statusLabel = disputeStatusLabels[dispute.status] || dispute.status;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              İtiraz Detayı #{dispute.id.slice(0, 8)}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatDistanceToNow(new Date(dispute.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Key Info Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">İtiraz Nedeni</p>
              <p className="text-sm font-medium text-gray-900">
                {disputeReasonLabels[dispute.reason]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Başlatan</p>
              <p className="text-sm font-medium text-gray-900">
                {dispute.raisedByUserFullName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Oluşturulma</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(dispute.createdAt).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>

          {dispute.resolvedAt && (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Çözüm Tarihi</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(dispute.resolvedAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Açıklama</h2>
        <p className="mt-3 text-sm whitespace-pre-wrap text-gray-700">
          {dispute.description}
        </p>
      </div>

      {/* Order Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Sipariş Bilgileri
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">Sipariş ID</p>
            <p className="text-sm font-medium text-gray-900">
              {dispute.orderId}
            </p>
          </div>
          {dispute.refundAmount !== null && (
            <div>
              <p className="text-xs text-gray-500">İade Tutarı</p>
              <p className="text-sm font-medium text-gray-900">
                ₺{dispute.refundAmount.toLocaleString('tr-TR')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Kanıtlar</h2>

        {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {dispute.evidenceUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group hover:border-primary-500 relative overflow-hidden rounded-md border border-gray-200"
              >
                {url.endsWith('.pdf') ? (
                  <div className="flex h-32 items-center justify-center bg-gray-100">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Kanıt ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                )}
                <div className="bg-opacity-0 group-hover:bg-opacity-20 absolute inset-0 bg-black transition-opacity" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-500">Henüz kanıt yüklenmedi</p>
        )}
      </div>

      {/* Resolution (if resolved) */}
      {dispute.resolution && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 flex-shrink-0 text-green-600" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-green-900">
                İtiraz Çözüldü
              </h2>
              <p className="mt-2 text-sm whitespace-pre-wrap text-green-800">
                {dispute.resolution}
              </p>
              {dispute.resolvedByUserFullName && (
                <p className="mt-2 text-xs text-green-700">
                  Çözümleyen: {dispute.resolvedByUserFullName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Notice (if not admin and not resolved) */}
      {!isAdmin && !dispute.resolution && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex gap-3">
            <Clock className="h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">İtiraz İnceleniyor</p>
              <p className="mt-1">
                Admin ekibimiz itirazınızı inceliyor. 2-3 iş günü içinde
                sonuçlanacaktır.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisputeDetailView;
