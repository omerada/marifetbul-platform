/**
 * Payout History Page
 * Sprint 1: Payout System
 *
 * User's payout history with:
 * - Status filtering
 * - Pagination
 * - Details modal
 * - Cancel action for pending payouts
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
  X as XIcon,
} from 'lucide-react';
import {
  getPayoutHistory,
  cancelPayout,
  canCancelPayout,
  getPayoutStatusLabel,
  getPayoutStatusColor,
  type PayoutResponse,
  type PayoutStatus,
  PayoutStatus as PayoutStatusEnum,
} from '@/lib/api/payouts';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDate } from '@/lib/utils';

// ================================================
// COMPONENT
// ================================================

export default function PayoutHistoryPage() {
  const [payouts, setPayouts] = useState<PayoutResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<PayoutResponse | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | 'ALL'>('ALL');

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    fetchPayouts();
  }, []);

  // ================================================
  // FUNCTIONS
  // ================================================

  async function fetchPayouts() {
    setIsLoading(true);
    try {
      const data = await getPayoutHistory(0, 50);
      setPayouts(data);
    } catch (_error) {
      toast.error('Para çekme geçmişi yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancelPayout(id: string) {
    if (
      !confirm('Para çekme talebini iptal etmek istediğinize emin misiniz?')
    ) {
      return;
    }

    try {
      await cancelPayout(id, 'Kullanıcı tarafından iptal edildi');
      toast.success('Para çekme talebi iptal edildi');
      fetchPayouts();
    } catch (_error) {
      toast.error('İptal işlemi başarısız');
    }
  }

  function handleViewDetails(payout: PayoutResponse) {
    setSelectedPayout(payout);
    setIsDetailModalOpen(true);
  }

  // ================================================
  // FILTERED PAYOUTS
  // ================================================

  const filteredPayouts =
    statusFilter === 'ALL'
      ? payouts
      : payouts.filter((p) => p.status === statusFilter);

  // ================================================
  // RENDER
  // ================================================

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-sm text-gray-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Para Çekme Geçmişi</h1>
        <p className="mt-2 text-gray-600">
          Tüm para çekme taleplerinizi görüntüleyin
        </p>
      </div>

      {/* Status Filter */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Durum:</span>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === 'ALL' ? 'primary' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
            >
              Tümü
            </Button>
            {Object.values(PayoutStatusEnum).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={statusFilter === status ? 'primary' : 'outline'}
                onClick={() => setStatusFilter(status)}
              >
                {getPayoutStatusLabel(status)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Payouts List */}
      {filteredPayouts.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Para çekme kaydı yok
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {statusFilter === 'ALL'
              ? 'Henüz para çekme talebi oluşturmadınız.'
              : `${getPayoutStatusLabel(statusFilter as PayoutStatus)} durumunda para çekme talebi yok.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayouts.map((payout) => (
            <Card key={payout.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    {payout.status === PayoutStatusEnum.COMPLETED ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : payout.status === PayoutStatusEnum.PENDING ? (
                      <Clock className="h-6 w-6 text-yellow-600" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {payout.amount.toFixed(2)} {payout.currency}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(payout.requestedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge color={getPayoutStatusColor(payout.status)}>
                    {getPayoutStatusLabel(payout.status)}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(payout)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Detay
                  </Button>

                  {canCancelPayout(payout) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelPayout(payout.id)}
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      İptal
                    </Button>
                  )}
                </div>
              </div>

              {payout.description && (
                <p className="mt-3 text-sm text-gray-600">
                  {payout.description}
                </p>
              )}

              {payout.failureReason && (
                <div className="mt-3 rounded-lg bg-red-50 p-3">
                  <p className="text-sm text-red-700">
                    <strong>Hata:</strong> {payout.failureReason}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPayout && (
        <PayoutDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          payout={selectedPayout}
        />
      )}
    </div>
  );
}

// ================================================
// DETAIL MODAL
// ================================================

interface PayoutDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutResponse;
}

function PayoutDetailModal({
  isOpen,
  onClose,
  payout,
}: PayoutDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Para Çekme Detayları
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tutar</p>
              <p className="text-lg font-semibold text-gray-900">
                {payout.amount.toFixed(2)} {payout.currency}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Durum</p>
              <Badge color={getPayoutStatusColor(payout.status)}>
                {getPayoutStatusLabel(payout.status)}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Talep Tarihi</p>
            <p className="text-gray-900">{formatDate(payout.requestedAt)}</p>
          </div>

          {payout.processedAt && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                İşlenme Tarihi
              </p>
              <p className="text-gray-900">{formatDate(payout.processedAt)}</p>
            </div>
          )}

          {payout.completedAt && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Tamamlanma Tarihi
              </p>
              <p className="text-gray-900">{formatDate(payout.completedAt)}</p>
            </div>
          )}

          {payout.description && (
            <div>
              <p className="text-sm font-medium text-gray-500">Açıklama</p>
              <p className="text-gray-900">{payout.description}</p>
            </div>
          )}

          {payout.adminNotes && (
            <div>
              <p className="text-sm font-medium text-gray-500">Admin Notu</p>
              <p className="text-gray-900">{payout.adminNotes}</p>
            </div>
          )}

          {payout.failureReason && (
            <div className="rounded-lg bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Hata Nedeni</p>
              <p className="mt-1 text-sm text-red-600">
                {payout.failureReason}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
