/**
 * ================================================
 * PAYOUTS PAGE - Payout Management
 * ================================================
 * Manage payout requests and view payout history
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { PayoutRequestModal } from '@/components/dashboard/freelancer/wallet';
import { usePayouts } from '@/hooks/business/wallet';
import {
  DollarSign,
  ChevronLeft,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import {
  PayoutStatus,
  formatCurrency,
  PAYOUT_STATUS_INFO,
} from '@/types/business/features/wallet';

// ================================================
// PAGE COMPONENT
// ================================================

export default function PayoutsPage() {
  // ==================== STATE ====================

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==================== HOOKS ====================

  const { payouts, eligibility, limits, canRequestPayout, isLoading, refresh } =
    usePayouts();

  // ==================== HANDLERS ====================

  const handlePayoutSuccess = () => {
    refresh();
  };

  // ==================== HELPERS ====================

  const getStatusIcon = (status: PayoutStatus) => {
    switch (status) {
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="h-5 w-5 text-amber-600" />;
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'CANCELLED':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  // ==================== RENDER ====================

  return (
    <>
      <div className="container mx-auto max-w-7xl px-4 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Link
              href="/dashboard/freelancer/wallet"
              className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
              <DollarSign className="text-primary h-8 w-8" />
              Para Çekme
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">
            Para çekme taleplerinizi görüntüleyin ve yeni talep oluşturun
          </p>
        </div>

        {/* Balance & Limits Info */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Available Balance */}
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-2 text-sm">
                Çekilebilir Bakiye
              </p>
              <p className="text-primary text-3xl font-bold">
                {eligibility
                  ? formatCurrency(eligibility.availableBalance)
                  : '---'}
              </p>
            </CardContent>
          </Card>

          {/* Minimum Limit */}
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-2 text-sm">
                Minimum Çekim
              </p>
              <p className="text-2xl font-semibold">
                {limits ? formatCurrency(limits.minimumAmount) : '---'}
              </p>
            </CardContent>
          </Card>

          {/* Maximum Limit */}
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground mb-2 text-sm">
                Maksimum Çekim
              </p>
              <p className="text-2xl font-semibold">
                {limits ? formatCurrency(limits.maximumAmount) : '---'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Request Payout Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!canRequestPayout}
            className="bg-primary hover:bg-primary/90 inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            <Plus className="h-5 w-5" />
            Yeni Para Çekme Talebi
          </button>
          {!canRequestPayout && eligibility && (
            <p className="mt-2 ml-2 text-sm text-amber-600">
              {eligibility.reason ||
                'Şu anda para çekme talebi oluşturamazsınız'}
            </p>
          )}
        </div>

        {/* Payout History */}
        <div>
          <h2 className="mb-4 text-xl font-bold">Para Çekme Geçmişi</h2>

          {isLoading ? (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-4 p-4"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-gray-200" />
                      </div>
                      <div className="h-6 w-20 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : payouts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <DollarSign className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Henüz Para Çekme Talebiniz Yok
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  İlk para çekme talebinizi oluşturun
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={!canRequestPayout}
                  className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Talep Oluştur
                </button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {payouts.map((payout) => {
                    const statusInfo = PAYOUT_STATUS_INFO[payout.status];

                    return (
                      <div
                        key={payout.id}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                      >
                        {/* Status Icon */}
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                          {getStatusIcon(payout.status)}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              Para Çekme Talebi
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {new Date(payout.requestedAt).toLocaleString(
                              'tr-TR',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                          {payout.description && (
                            <p className="mt-1 truncate text-xs text-gray-600">
                              {payout.description}
                            </p>
                          )}
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payout.amount)}
                          </p>
                          {payout.estimatedArrival && (
                            <p className="text-muted-foreground mt-1 text-xs">
                              Tahmini:{' '}
                              {new Date(
                                payout.estimatedArrival
                              ).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Request Payout Modal */}
      <PayoutRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePayoutSuccess}
      />
    </>
  );
}
