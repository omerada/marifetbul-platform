'use client';

/**
 * ================================================
 * PAYMENT PROOF CONFIRMATION COMPONENT
 * ================================================
 * Satıcının ödeme kanıtını görüntüleyip onaylaması/reddetmesi için UI
 *
 * Features:
 * - Dekont önizlemesi
 * - Ödeme detayları görüntüleme
 * - Onay/Red butonları
 * - Not ekleme
 * - İtiraz etme özelliği
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Check, X, Flag, Eye, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/shared/formatters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { orderService } from '@/lib/infrastructure/services/api/orderService';
import { toast } from 'sonner';
import type { ManualPaymentProofResponse } from '@/types/backend-aligned';

interface PaymentProofConfirmationProps {
  orderId: string;
  proof: ManualPaymentProofResponse;
  onConfirm?: () => void;
  onReject?: () => void;
}

export function PaymentProofConfirmation({
  orderId,
  proof,
  onConfirm,
  onReject,
}: PaymentProofConfirmationProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [confirmNotes, setConfirmNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!confirmNotes.trim()) {
      toast.error('Lütfen onay notunuzu giriniz');
      return;
    }

    setIsProcessing(true);
    try {
      await orderService.confirmPaymentProof(orderId, {
        confirmed: true,
        reason: confirmNotes,
      });

      toast.success('Ödeme onaylandı', {
        description: 'Sipariş PAID durumuna geçirildi',
      });

      setConfirmDialogOpen(false);
      onConfirm?.();
    } catch (err: any) {
      toast.error('Hata', {
        description: err.response?.data?.message || 'Onay işlemi başarısız',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Lütfen reddetme sebebini giriniz');
      return;
    }

    setIsProcessing(true);
    try {
      await orderService.confirmPaymentProof(orderId, {
        confirmed: false,
        reason: rejectReason,
      });

      toast.success('Ödeme reddedildi', {
        description: 'Alıcı bilgilendirildi',
      });

      setRejectDialogOpen(false);
      onReject?.();
    } catch (err: any) {
      toast.error('Hata', {
        description: err.response?.data?.message || 'Red işlemi başarısız',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDispute = async () => {
    if (!disputeReason.trim() || disputeReason.length < 20) {
      toast.error('İtiraz sebebi en az 20 karakter olmalıdır');
      return;
    }

    setIsProcessing(true);
    try {
      await orderService.disputePaymentProof(orderId, {
        disputeReason,
        requestedResolution: 'Admin incelemesi talep ediyorum',
      });

      toast.success('İtiraz oluşturuldu', {
        description: 'Platform admini en kısa sürede inceleyecek',
      });

      setDisputeDialogOpen(false);
      onReject?.();
    } catch (err: any) {
      toast.error('Hata', {
        description: err.response?.data?.message || 'İtiraz oluşturulamadı',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      'default' | 'secondary' | 'destructive' | 'outline'
    > = {
      PENDING: 'outline',
      CONFIRMED: 'default',
      REJECTED: 'destructive',
      DISPUTED: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status === 'PENDING' && 'Bekliyor'}
        {status === 'CONFIRMED' && 'Onaylandı'}
        {status === 'REJECTED' && 'Reddedildi'}
        {status === 'DISPUTED' && 'İtiraz Edildi'}
      </Badge>
    );
  };

  const isPending = proof.sellerConfirmationStatus === 'PENDING';

  return (
    <div className="space-y-6">
      {/* Durum Özeti */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ödeme Onayı Bekleniyor</p>
              <p className="text-muted-foreground text-sm">
                Hesabınıza ödeme düştüğünü onaylamanız gerekiyor
              </p>
            </div>
            {getStatusBadge(proof.sellerConfirmationStatus)}
          </div>
        </AlertDescription>
      </Alert>

      {/* Ödeme Detayları */}
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Ödeme Detayları</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Referans Numarası</Label>
            <p className="font-mono text-sm">{proof.paymentReference}</p>
          </div>

          <div>
            <Label className="text-muted-foreground">Yüklenme Zamanı</Label>
            <p className="text-sm">
              {formatDate(proof.createdAt, 'LONG', { includeTime: true })}
            </p>
          </div>

          {proof.buyerNotes && (
            <div className="col-span-2">
              <Label className="text-muted-foreground">Alıcı Notları</Label>
              <p className="bg-muted rounded-md p-3 text-sm">
                {proof.buyerNotes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dekont Önizleme */}
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ödeme Kanıtı</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Görüntüle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(proof.proofFileUrl, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              İndir
            </Button>
          </div>
        </div>

        {proof.proofFileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <img
            src={proof.proofFileUrl}
            alt="Ödeme Dekontu"
            className="max-h-96 w-full rounded border object-contain"
          />
        ) : (
          <div className="bg-muted flex h-48 items-center justify-center rounded border">
            <p className="text-muted-foreground">PDF önizlemesi mevcut değil</p>
          </div>
        )}
      </div>

      {/* Alıcı Onay Durumu */}
      {proof.buyerConfirmationStatus === 'CONFIRMED' && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            <div>
              <p className="font-medium">Alıcı ödeme yaptığını onayladı</p>
              <p className="text-muted-foreground text-sm">
                {formatDate(proof.buyerConfirmedAt!, 'LONG', {
                  includeTime: true,
                })}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Aksiyon Butonları */}
      {isPending && (
        <div className="flex gap-3">
          <Button onClick={() => setConfirmDialogOpen(true)} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Ödeme Alındı, Onayla
          </Button>

          <Button
            variant="destructive"
            onClick={() => setRejectDialogOpen(true)}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Ödeme Alınmadı, Reddet
          </Button>

          <Button variant="outline" onClick={() => setDisputeDialogOpen(true)}>
            <Flag className="mr-2 h-4 w-4" />
            İtiraz Et
          </Button>
        </div>
      )}

      {/* Onaylama Diyaloğu */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Alındığını Onayla</DialogTitle>
            <DialogDescription>
              Hesabınıza ödeme düştüğünü onaylamak üzeresiniz. Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Onay Notunuz</Label>
              <Textarea
                placeholder="Örn: Ödeme 10 Kasım 14:30'da hesabıma yansıdı, teşekkürler"
                value={confirmNotes}
                onChange={(e) => setConfirmNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleConfirm} disabled={isProcessing}>
              {isProcessing ? 'İşleniyor...' : 'Onaylıyorum'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reddetme Diyaloğu */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödemeyi Reddet</DialogTitle>
            <DialogDescription>
              Hesabınıza ödeme düşmediyse veya tutar yanlışsa reddedebilirsiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Reddetme Sebebi</Label>
              <Textarea
                placeholder="Örn: Hesabıma ödeme yansımadı, banka hesap hareketlerimi kontrol ettim"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? 'İşleniyor...' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* İtiraz Diyaloğu */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İtiraz Oluştur</DialogTitle>
            <DialogDescription>
              Ödeme kanıtı sahte veya şüpheli görünüyorsa itiraz edebilirsiniz.
              Platform admini konuyu inceleyecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>İtiraz Sebebi</Label>
              <Textarea
                placeholder="Detaylı olarak açıklayınız (min 20 karakter)..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={5}
                maxLength={1000}
              />
              <p className="text-muted-foreground mt-1 text-xs">
                {disputeReason.length}/1000 karakter
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDisputeDialogOpen(false)}
            >
              İptal
            </Button>
            <Button onClick={handleDispute} disabled={isProcessing}>
              {isProcessing ? 'Gönderiliyor...' : 'İtiraz Et'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Önizleme Diyaloğu */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Ödeme Kanıtı Önizleme</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {proof.proofFileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <img
                src={proof.proofFileUrl}
                alt="Ödeme Dekontu"
                className="w-full"
              />
            ) : (
              <iframe
                src={proof.proofFileUrl}
                className="h-[70vh] w-full"
                title="PDF Önizleme"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
