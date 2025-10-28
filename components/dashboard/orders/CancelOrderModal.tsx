/**
 * ================================================
 * CANCEL ORDER MODAL
 * ================================================
 * Modal for cancelling orders with reason selection
 *
 * Features:
 * - Cancellation reason dropdown
 * - Optional note textarea
 * - Refund policy display
 * - Cancel order API call
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button, Textarea, Label } from '@/components/ui';
import {
  orderApi,
  enrichOrder,
  unwrapOrderResponse,
  type OrderWithComputed,
} from '@/lib/api/orders';
import type { OrderCancellationReason } from '@/types/backend-aligned';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface CancelOrderModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** The order to cancel */
  order: OrderWithComputed;
  /** User role (buyer or seller) */
  userRole: 'buyer' | 'seller';
  /** Callback after successful cancellation */
  onSuccess?: (updatedOrder: OrderWithComputed) => void;
}

// ================================================
// CONSTANTS
// ================================================

const CANCELLATION_REASONS: Record<
  OrderCancellationReason,
  { label: string; description: string }
> = {
  BUYER_REQUEST: {
    label: 'Alıcı Talebi',
    description: 'Artık bu hizmete ihtiyacım yok',
  },
  SELLER_UNAVAILABLE: {
    label: 'Satıcı Müsait Değil',
    description: 'Satıcı işi tamamlayamıyor',
  },
  REQUIREMENTS_NOT_MET: {
    label: 'Gereksinimler Karşılanmadı',
    description: 'İş beklentileri karşılanmadı',
  },
  PAYMENT_ISSUE: {
    label: 'Ödeme Sorunu',
    description: 'Ödeme ile ilgili bir sorun var',
  },
  MUTUAL_AGREEMENT: {
    label: 'Karşılıklı Anlaşma',
    description: 'Her iki taraf da iptal etmeyi kabul etti',
  },
  FRAUD_SUSPECTED: {
    label: 'Dolandırıcılık Şüphesi',
    description: 'Şüpheli aktivite tespit edildi',
  },
  TERMS_VIOLATION: {
    label: 'Şartlar İhlali',
    description: 'Platform şartları ihlal edildi',
  },
  OTHER: {
    label: 'Diğer',
    description: 'Yukarıdakilerden hiçbiri',
  },
};

// ================================================
// COMPONENT
// ================================================

export function CancelOrderModal({
  isOpen,
  onClose,
  order,
  userRole,
  onSuccess,
}: CancelOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState<OrderCancellationReason | ''>('');
  const [note, setNote] = useState('');

  // ================================================
  // COMPUTED VALUES
  // ================================================

  const isValid = reason !== '';
  const canGetRefund =
    order.status === 'PAID' ||
    order.status === 'IN_PROGRESS' ||
    order.status === 'DELIVERED';

  // ================================================
  // HANDLERS
  // ================================================

  const handleCancel = async () => {
    if (!isValid) {
      toast.error('Hata', {
        description: 'Lütfen iptal nedeni seçin.',
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await orderApi.cancelOrder(order.id, {
        reason: reason as OrderCancellationReason,
        note: note.trim() || undefined,
      });

      const data = unwrapOrderResponse(response);
      const updatedOrder = enrichOrder(data);

      toast.success('Sipariş iptal edildi!', {
        description: canGetRefund
          ? 'İade işlemi başlatıldı.'
          : 'Sipariş başarıyla iptal edildi.',
      });

      onSuccess?.(updatedOrder);
      onClose();
    } catch (error) {
      toast.error('Hata', {
        description:
          error instanceof Error ? error.message : 'Sipariş iptal edilemedi.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      setNote('');
      onClose();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="text-destructive h-5 w-5" />
            Siparişi İptal Et
          </DialogTitle>
          <DialogDescription>
            Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Sipariş Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sipariş:</span>
                <span className="font-medium">#{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paket:</span>
                <span className="font-medium">
                  {order.packageDetails?.packageTitle ||
                    order.customDescription ||
                    'Özel Sipariş'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Durum:</span>
                <span className="font-medium">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam Tutar:</span>
                <span className="font-medium">
                  {order.financials.total.toFixed(2)}{' '}
                  {order.financials.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Reason */}
          <div>
            <Label htmlFor="reason" className="mb-2 block text-sm font-medium">
              İptal Nedeni <span className="text-destructive">*</span>
            </Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value as OrderCancellationReason)
              }
              disabled={isLoading}
              className={cn(
                'border-input bg-background w-full rounded-md border px-3 py-2 text-sm',
                'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="">İptal nedeni seçin...</option>
              {Object.entries(CANCELLATION_REASONS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label} - {value.description}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Note */}
          <div>
            <Label htmlFor="note" className="mb-2 block text-sm font-medium">
              Ek Açıklama (İsteğe Bağlı)
            </Label>
            <Textarea
              id="note"
              placeholder="İptal nedeni hakkında daha fazla bilgi ekleyin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isLoading}
              rows={4}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-muted-foreground mt-2 text-xs">
              {note.length}/1000 karakter
            </p>
          </div>

          {/* Refund Policy */}
          {canGetRefund && (
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
              <h4 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-100">
                İade Politikası
              </h4>
              <ul className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
                {order.status === 'PAID' && (
                  <>
                    <li>• Ödemeniz tam olarak iade edilecektir</li>
                    <li>• İade işlemi 3-5 iş günü içinde tamamlanır</li>
                  </>
                )}
                {order.status === 'IN_PROGRESS' && (
                  <>
                    <li>• İş başlamış olduğu için kısmi iade yapılabilir</li>
                    <li>• Satıcının onayı gerekebilir</li>
                    <li>• İade miktarı yapılan işe göre belirlenir</li>
                  </>
                )}
                {order.status === 'DELIVERED' && (
                  <>
                    <li>
                      • İş teslim edildiği için iade politikası farklı olabilir
                    </li>
                    <li>• Her iki tarafın onayı gerekebilir</li>
                    <li>• İade miktarı müzakereye açık olabilir</li>
                  </>
                )}
                <li>• İade ödeme yönteminize geri gönderilir</li>
                <li>
                  • Sorularınız için destek ekibimizle iletişime geçebilirsiniz
                </li>
              </ul>
            </div>
          )}

          {/* Warning Notice */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-yellow-900 dark:text-yellow-100">
              <AlertTriangle className="h-4 w-4" />
              Önemli Uyarı
            </h4>
            <ul className="space-y-1 text-xs text-yellow-800 dark:text-yellow-200">
              <li>• Bu işlem geri alınamaz</li>
              <li>
                • Sık iptal işlemleri hesap değerlendirmenizi olumsuz
                etkileyebilir
              </li>
              <li>
                • İptal nedeni kayıt altına alınır ve her iki tarafla paylaşılır
              </li>
              {userRole === 'buyer' && (
                <li>
                  • Satıcıyla önce iletişime geçmeyi düşünün - sorun çözülebilir
                </li>
              )}
              {userRole === 'seller' && (
                <li>
                  • Alıcıyla önce iletişime geçmeyi düşünün - sorun çözülebilir
                </li>
              )}
              <li>• Gereksiz iptaller platform politikalarına aykırıdır</li>
            </ul>
          </div>

          {/* Fraud/Violation Warning */}
          {(reason === 'FRAUD_SUSPECTED' || reason === 'TERMS_VIOLATION') && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <h4 className="mb-2 text-sm font-semibold text-red-900 dark:text-red-100">
                Ciddi İhlal Bildirimi
              </h4>
              <p className="text-xs text-red-800 dark:text-red-200">
                Bu nedeni seçtiyseniz, lütfen ek açıklama bölümünde detaylı
                bilgi verin. Destek ekibimiz durumu inceleyecek ve gerekli
                önlemleri alacaktır. Yanlış bildirimler hesabınıza zarar
                verebilir.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Vazgeç
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading || !isValid}
            className="min-w-[120px]"
          >
            {isLoading ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
