'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Download,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui';
import {
  usePayouts,
  useWalletActions,
  useWalletUI,
} from '@/stores/walletStore';
import { formatCurrency } from '@/lib/shared/utils/format';
import type { Payout as PayoutType } from '@/lib/api/validators';

/**
 * Payout History Page Component
 * Displays user's payout history with filtering and cancellation
 */
export default function PayoutHistoryPage() {
  const router = useRouter();
  const payouts = usePayouts();
  const { fetchPayouts, cancelPayout } = useWalletActions();
  const { isLoadingPayouts, error } = useWalletUI();

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    PayoutType['status'] | 'ALL'
  >('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch payouts on mount and when page changes
  useEffect(() => {
    fetchPayouts(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter payouts by status
  const filteredPayouts =
    statusFilter === 'ALL'
      ? payouts
      : payouts.filter((p) => p.status === statusFilter);

  // Handle payout cancellation
  const handleCancelPayout = async (payoutId: string) => {
    setCancellingId(payoutId);
    try {
      await cancelPayout(payoutId);
      setShowCancelModal(false);
      setSelectedPayout(null);
    } catch (err) {
      console.error('Failed to cancel payout:', err);
    } finally {
      setCancellingId(null);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: PayoutType['status']) => {
    const variants: Record<
      PayoutType['status'],
      {
        variant:
          | 'default'
          | 'secondary'
          | 'success'
          | 'warning'
          | 'destructive';
        icon: React.ReactNode;
      }
    > = {
      PENDING: {
        variant: 'warning',
        icon: <Clock className="h-3 w-3" />,
      },
      PROCESSING: {
        variant: 'secondary',
        icon: <Loader2 className="h-3 w-3 animate-spin" />,
      },
      COMPLETED: {
        variant: 'success',
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      FAILED: {
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />,
      },
      CANCELLED: {
        variant: 'default',
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const config = variants[status];
    const labels: Record<PayoutType['status'], string> = {
      PENDING: 'Bekliyor',
      PROCESSING: 'İşleniyor',
      COMPLETED: 'Tamamlandı',
      FAILED: 'Başarısız',
      CANCELLED: 'İptal Edildi',
    };

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {labels[status]}
      </Badge>
    );
  };

  // Get method label
  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      BANK_TRANSFER: 'Banka Transferi',
      PAYPAL: 'PayPal',
      STRIPE: 'Stripe',
    };
    return labels[method] || method;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/wallet')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cüzdana Dön
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Çekim Geçmişi</h1>
            <p className="text-muted-foreground mt-1">
              Para çekim taleplerinizi görüntüleyin ve yönetin
            </p>
          </div>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-4">
        <div className="flex items-center gap-4">
          <Filter className="text-muted-foreground h-5 w-5" />
          <div className="flex flex-1 items-center gap-4">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as PayoutType['status'] | 'ALL'
                  )
                }
                className="w-full rounded-lg border p-2"
              >
                <option value="ALL">Tümü</option>
                <option value="PENDING">Bekliyor</option>
                <option value="PROCESSING">İşleniyor</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="FAILED">Başarısız</option>
                <option value="CANCELLED">İptal Edildi</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Payouts Table */}
      <Card className="p-6">
        {isLoadingPayouts && payouts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600">
            <p>{error}</p>
            <Button
              onClick={() => fetchPayouts(page)}
              className="mt-4"
              variant="outline"
            >
              Tekrar Dene
            </Button>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="text-muted-foreground py-12 text-center">
            <DollarSign className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p className="text-lg font-medium">Çekim talebi bulunamadı</p>
            <p className="mt-2 text-sm">
              {statusFilter !== 'ALL'
                ? 'Bu duruma uygun çekim talebi yok'
                : 'Henüz hiç para çekimi yapmadınız'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium">Tarih</th>
                    <th className="p-4 text-left font-medium">Tutar</th>
                    <th className="p-4 text-left font-medium">Yöntem</th>
                    <th className="p-4 text-left font-medium">Durum</th>
                    <th className="p-4 text-left font-medium">Açıklama</th>
                    <th className="p-4 text-right font-medium">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-muted/50 border-b">
                      <td className="p-4">
                        <div className="text-sm">
                          {formatDate(payout.requestedAt)}
                        </div>
                        {payout.completedAt && (
                          <div className="text-muted-foreground text-xs">
                            Tamamlandı: {formatDate(payout.completedAt)}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">
                          {formatCurrency(payout.amount, payout.currency)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {getMethodLabel(payout.method)}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(payout.status)}</td>
                      <td className="p-4">
                        <div className="text-muted-foreground max-w-xs truncate text-sm">
                          {payout.description || '-'}
                        </div>
                        {payout.failureReason && (
                          <div className="mt-1 text-xs text-red-600">
                            Hata: {payout.failureReason}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayout(payout);
                              setShowDetailModal(true);
                            }}
                          >
                            Detay
                          </Button>
                          {payout.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowCancelModal(true);
                              }}
                              disabled={cancellingId === payout.id}
                            >
                              {cancellingId === payout.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'İptal Et'
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-4 md:hidden">
              {filteredPayouts.map((payout) => (
                <Card key={payout.id} className="p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <div className="text-lg font-semibold">
                        {formatCurrency(payout.amount, payout.currency)}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {formatDate(payout.requestedAt)}
                      </div>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yöntem:</span>
                      <span>{getMethodLabel(payout.method)}</span>
                    </div>
                    {payout.description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Açıklama:</span>
                        <span className="text-right">{payout.description}</span>
                      </div>
                    )}
                    {payout.failureReason && (
                      <div className="text-xs text-red-600">
                        Hata: {payout.failureReason}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPayout(payout);
                        setShowDetailModal(true);
                      }}
                    >
                      Detay
                    </Button>
                    {payout.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowCancelModal(true);
                        }}
                        disabled={cancellingId === payout.id}
                      >
                        {cancellingId === payout.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'İptal Et'
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <div className="text-muted-foreground text-sm">
                Toplam {filteredPayouts.length} çekim talebi
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || isLoadingPayouts}
                >
                  Önceki
                </Button>
                <div className="px-4 py-2 text-sm">Sayfa {page + 1}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={payouts.length < 10 || isLoadingPayouts}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çekim Detayları</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tutar:</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(
                    selectedPayout.amount,
                    selectedPayout.currency
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Durum:</span>
                {getStatusBadge(selectedPayout.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Yöntem:</span>
                <span>{getMethodLabel(selectedPayout.method)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Talep Tarihi:</span>
                <span>{formatDate(selectedPayout.requestedAt)}</span>
              </div>

              {selectedPayout.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Tamamlanma Tarihi:
                  </span>
                  <span>{formatDate(selectedPayout.completedAt)}</span>
                </div>
              )}
              {selectedPayout.description && (
                <div>
                  <div className="text-muted-foreground mb-1">Açıklama:</div>
                  <div className="text-sm">{selectedPayout.description}</div>
                </div>
              )}
              {selectedPayout.failureReason && (
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">
                        Hata Nedeni
                      </div>
                      <div className="text-sm text-red-700">
                        {selectedPayout.failureReason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailModal(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çekim Talebini İptal Et</DialogTitle>
            <DialogDescription>
              Bu çekim talebini iptal etmek istediğinizden emin misiniz? Bu
              işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="bg-muted rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tutar:</span>
                  <span className="font-semibold">
                    {formatCurrency(
                      selectedPayout.amount,
                      selectedPayout.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span>{formatDate(selectedPayout.requestedAt)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={!!cancellingId}
            >
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                selectedPayout && handleCancelPayout(selectedPayout.id)
              }
              disabled={!!cancellingId}
            >
              {cancellingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İptal Ediliyor...
                </>
              ) : (
                'İptal Et'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
