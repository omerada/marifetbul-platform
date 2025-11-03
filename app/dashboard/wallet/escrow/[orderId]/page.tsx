/**
 * ================================================
 * ESCROW DETAIL PAGE
 * ================================================
 * Detailed view of individual escrow payment
 *
 * Features:
 * - Full payment details
 * - Transaction timeline
 * - Order information
 * - Action controls
 * - Dispute integration
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Escrow System Enhancement
 */

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  EscrowStatusBadge,
  EscrowTimeline,
  EscrowActionPermissions,
  createEscrowTimelineEvent,
  type EscrowTimelineEvent,
} from '@/components/domains/wallet';
import { getEscrowPaymentDetails } from '@/lib/api/wallet';
import type { EscrowPaymentDetails } from '@/types/business/features/wallet';
import { EscrowPageClient } from './EscrowPageClient';

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface EscrowDetailPageProps {
  params: {
    orderId: string;
  };
}

export default async function EscrowDetailPage({
  params,
}: EscrowDetailPageProps) {
  // Fetch escrow payment details
  let escrowData: EscrowPaymentDetails;

  try {
    escrowData = await getEscrowPaymentDetails(params.orderId);
  } catch (error) {
    console.error('Failed to fetch escrow details:', error);
    notFound();
  }

  // Build timeline events from payment history
  const timelineEvents: EscrowTimelineEvent[] = escrowData.history.map(
    (event: EscrowPaymentDetails['history'][0]) =>
      createEscrowTimelineEvent(event.type, {
        id: event.id,
        timestamp: event.timestamp,
        actor: event.actor,
        metadata: event.metadata,
      })
  );

  // Format amount
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: escrowData.currency,
  }).format(escrowData.amount);

  // Determine user role (would come from auth in real app)
  const userRole =
    escrowData.buyerId === 'CURRENT_USER_ID' ? 'BUYER' : 'SELLER';

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/wallet/escrow">
            <UnifiedButton variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </UnifiedButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Emanet Detayları
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sipariş #{params.orderId.slice(0, 8)}
            </p>
          </div>
        </div>
        <EscrowStatusBadge status={escrowData.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Payment Information */}
          <Card>
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Ödeme Bilgileri
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Tutar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formattedAmount}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Durum</p>
                  <EscrowStatusBadge status={escrowData.status} />
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">
                    Oluşturulma Tarihi
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-muted-foreground h-4 w-4" />
                    <p className="text-sm text-gray-900">
                      {new Date(escrowData.createdAt).toLocaleDateString(
                        'tr-TR',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>

                {escrowData.autoReleaseDate && (
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">
                      Otomatik Serbest Bırakma
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-muted-foreground h-4 w-4" />
                      <p className="text-sm text-gray-900">
                        {new Date(
                          escrowData.autoReleaseDate
                        ).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Order Information */}
          <Card>
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sipariş Bilgileri
                </h2>
                <Link href={`/dashboard/orders/${escrowData.orderId}`}>
                  <UnifiedButton variant="outline" size="sm">
                    <Package className="mr-2 h-4 w-4" />
                    Siparişi Görüntüle
                  </UnifiedButton>
                </Link>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">
                    Sipariş Başlığı
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {escrowData.orderTitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">Alıcı</p>
                    <Link
                      href={`/profile/${escrowData.buyerId}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {escrowData.buyerName}
                    </Link>
                  </div>

                  <div>
                    <p className="text-muted-foreground mb-1 text-xs">Satıcı</p>
                    <Link
                      href={`/profile/${escrowData.sellerId}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {escrowData.sellerName}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <EscrowTimeline events={timelineEvents} />
        </div>

        {/* Right Column - Actions */}
        <div className="space-y-6">
          {/* Actions */}
          <EscrowPageClient
            paymentId={escrowData.id}
            orderId={escrowData.orderId}
            orderNumber={params.orderId.slice(0, 8)}
            status={escrowData.status}
            userRole={userRole}
            canRelease={escrowData.canRelease}
            canDispute={escrowData.canDispute}
          />

          {/* Permissions */}
          <EscrowActionPermissions
            userRole={userRole}
            canRelease={escrowData.canRelease}
            canDispute={escrowData.canDispute}
            status={escrowData.status}
          />

          {/* Help Card */}
          <Card>
            <div className="p-6">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Yardıma mı ihtiyacınız var?
              </h3>
              <p className="text-muted-foreground mb-4 text-xs">
                Emanet sistemi ve işlemler hakkında sorularınız varsa destek
                ekibimizle iletişime geçebilirsiniz.
              </p>
              <Link href="/support">
                <UnifiedButton variant="outline" size="sm" className="w-full">
                  Destek Talebi Oluştur
                </UnifiedButton>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: EscrowDetailPageProps) {
  return {
    title: `Emanet Detayları - Sipariş #${params.orderId.slice(0, 8)} | MarifetBul`,
    description: 'Emanet ödeme detayları ve işlem geçmişi',
  };
}
