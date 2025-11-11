'use client';

/**
 * ================================================
 * PAYMENT PROOF UPLOAD COMPONENT
 * ================================================
 * Alıcının ödeme dekontunu yüklemesi için form
 *
 * Features:
 * - Dekont/ekran görüntüsü yükleme (JPG, PNG, PDF)
 * - Ödeme referans numarası girişi
 * - Opsiyonel IBAN doğrulaması
 * - Önizleme özelliği
 * - Dosya boyut kontrolü (max 5MB)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState } from 'react';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { formatIBAN } from '@/lib/shared/formatters';
import { validateTurkishIBAN } from '@/lib/utils/iban-validator';
import { orderService } from '@/lib/infrastructure/services/api/orderService';
import { toast } from 'sonner';

interface PaymentProofUploadProps {
  orderId: string;
  orderAmount: number;
  sellerIban: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentProofUpload({
  orderId,
  orderAmount,
  sellerIban,
  onSuccess,
  onCancel,
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [payerIban, setPayerIban] = useState('');
  const [declaredAmount, setDeclaredAmount] = useState(orderAmount.toString());
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Dosya boyut kontrolü
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Dosya boyutu maksimum 5MB olabilir');
      return;
    }

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Sadece JPG, PNG veya PDF dosyaları yüklenebilir');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Önizleme oluştur (sadece resimler için)
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const validateForm = (): boolean => {
    if (!file) {
      setError('Ödeme dekontu/ekran görüntüsü zorunludur');
      return false;
    }

    if (!paymentReference.trim()) {
      setError('Ödeme referans numarası zorunludur');
      return false;
    }

    if (paymentReference.length < 5) {
      setError('Referans numarası en az 5 karakter olmalıdır');
      return false;
    }

    // IBAN validasyonu (opsiyonel ama girilmişse doğru olmalı)
    if (payerIban && !validateIban(payerIban)) {
      setError('Geçersiz IBAN formatı (TR ile başlamalı, 26 karakter)');
      return false;
    }

    return true;
  };

  const validateIban = (iban: string): boolean => {
    const result = validateTurkishIBAN(iban);
    return result.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await orderService.uploadPaymentProof(orderId, {
        paymentReference,
        notes,
        proofFile: file,
        payerIban: payerIban.replace(/\s/g, ''),
        receiverIban: sellerIban,
        declaredAmount: parseFloat(declaredAmount),
      });

      toast.success('Ödeme kanıtı başarıyla yüklendi', {
        description: 'Satıcı bildirimi aldı ve en kısa sürede onaylayacak',
      });

      onSuccess?.();
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || 'Ödeme kanıtı yüklenirken hata oluştu';
      setError(errorMsg);
      toast.error('Hata', { description: errorMsg });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Satıcı IBAN Bilgisi */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Ödeme yapılacak hesap:</p>
            <p className="font-mono text-sm">{formatIBAN(sellerIban)}</p>
            <p className="text-muted-foreground mt-2 text-xs">
              Tutar:{' '}
              <span className="font-semibold">{orderAmount.toFixed(2)} TL</span>
            </p>
          </div>
        </AlertDescription>
      </Alert>

      {/* Dosya Yükleme */}
      <div className="space-y-2">
        <Label htmlFor="proofFile">
          Ödeme Dekontu / Ekran Görüntüsü{' '}
          <span className="text-red-500">*</span>
        </Label>

        {!file ? (
          <label
            htmlFor="proofFile"
            className="hover:bg-muted/50 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground mb-2 text-sm">
                <span className="font-semibold">Tıklayarak yükleyin</span> veya
                sürükleyin
              </p>
              <p className="text-muted-foreground text-xs">
                JPG, PNG veya PDF (max 5MB)
              </p>
            </div>
            <input
              id="proofFile"
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileSelect}
            />
          </label>
        ) : (
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-1 items-start gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Önizleme"
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <FileText className="text-muted-foreground h-16 w-16" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Ödeme Referans Numarası */}
      <div className="space-y-2">
        <Label htmlFor="paymentReference">
          Ödeme Referans Numarası <span className="text-red-500">*</span>
        </Label>
        <Input
          id="paymentReference"
          placeholder="TRX123456789 veya dekont üzerindeki işlem numarası"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          maxLength={100}
        />
        <p className="text-muted-foreground text-xs">
          Banka dekontunuzdaki işlem/referans numarasını giriniz
        </p>
      </div>

      {/* Beyan Edilen Tutar */}
      <div className="space-y-2">
        <Label htmlFor="declaredAmount">Gönderilen Tutar (TL)</Label>
        <Input
          id="declaredAmount"
          type="number"
          step="0.01"
          value={declaredAmount}
          onChange={(e) => setDeclaredAmount(e.target.value)}
          placeholder={orderAmount.toFixed(2)}
        />
        <p className="text-muted-foreground text-xs">
          Doğrulama için havale/EFT yaptığınız tutarı giriniz
        </p>
      </div>

      {/* Gönderen IBAN (Opsiyonel) */}
      <div className="space-y-2">
        <Label htmlFor="payerIban">Gönderen Hesap IBAN (Opsiyonel)</Label>
        <Input
          id="payerIban"
          placeholder="TR33 0006 1005 1978 6457 8413 26"
          value={formatIBAN(payerIban)}
          onChange={(e) => setPayerIban(e.target.value.replace(/\s/g, ''))}
          maxLength={29} // 26 + 3 boşluk
        />
        <p className="text-muted-foreground text-xs">
          Ödemeyi yaptığınız hesabın IBAN numarası (doğrulama için)
        </p>
      </div>

      {/* Notlar */}
      <div className="space-y-2">
        <Label htmlFor="notes">Ek Notlar (Opsiyonel)</Label>
        <Textarea
          id="notes"
          placeholder="Ödeme tarihi, saati veya diğer detaylar..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <p className="text-muted-foreground text-xs">
          {notes.length}/500 karakter
        </p>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Aksiyon Butonları */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isUploading}
          >
            İptal
          </Button>
        )}
        <Button
          type="submit"
          disabled={isUploading || !file}
          className="flex-1"
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Ödeme Kanıtını Gönder
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
