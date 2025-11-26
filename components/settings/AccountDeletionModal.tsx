/**
 * ================================================
 * ACCOUNT DELETION MODAL COMPONENT
 * ================================================
 * Sprint 1 - Story 1.1: GDPR Compliance - Account Deletion Flow
 *
 * Two-step deletion process:
 * 1. Confirmation step: Password + reason
 * 2. Verification step: Email code verification
 *
 * Features:
 * - Password verification
 * - Optional reason selection
 * - Email verification code
 * - 7-day grace period warning
 * - Cancel option
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  initiateAccountDeletion,
  verifyAccountDeletion,
} from '@/lib/api/account-deletion';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { AlertTriangle, Mail, Shield } from 'lucide-react';

// ==================== Types ====================

interface AccountDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeletionStep = 'confirm' | 'verify';

const DELETION_REASONS = [
  { value: 'not_using', label: 'Artık kullanmıyorum' },
  { value: 'privacy_concerns', label: 'Gizlilik endişeleri' },
  { value: 'found_alternative', label: 'Alternatif buldum' },
  { value: 'too_expensive', label: 'Çok pahalı' },
  { value: 'technical_issues', label: 'Teknik sorunlar' },
  { value: 'other', label: 'Diğer' },
];

// ==================== Component ====================

export function AccountDeletionModal({
  isOpen,
  onClose,
}: AccountDeletionModalProps) {
  const router = useRouter();

  // State
  const [step, setStep] = useState<DeletionStep>('confirm');
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string>('');

  // ==================== Handlers ====================

  const handleInitiate = async () => {
    if (!password) {
      toast.error('Şifrenizi girmelisiniz');
      return;
    }

    setIsLoading(true);

    try {
      const response = await initiateAccountDeletion({
        password,
        reason: reason || undefined,
      });

      setExpiresAt(response.expiresAt);
      setStep('verify');

      toast.success(
        'Doğrulama kodu email adresinize gönderildi. Lütfen kontrol edin.'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Hesap silme işlemi başlatılamadı';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('6 haneli doğrulama kodunu girin');
      return;
    }

    setIsLoading(true);

    try {
      await verifyAccountDeletion({ verificationCode });

      toast.success(
        'Hesap silme işlemi doğrulandı. Hesabınız 7 gün içinde silinecektir.'
      );

      // Logout and redirect
      setTimeout(() => {
        router.push('/logout');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Doğrulama başarısız';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setReason('');
    setVerificationCode('');
    setStep('confirm');
    onClose();
  };

  // ==================== Render ====================

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'confirm' ? (
          <ConfirmStep
            password={password}
            setPassword={setPassword}
            reason={reason}
            setReason={setReason}
            isLoading={isLoading}
            onConfirm={handleInitiate}
            onCancel={handleCancel}
          />
        ) : (
          <VerifyStep
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            expiresAt={expiresAt}
            isLoading={isLoading}
            onVerify={handleVerify}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ==================== Step Components ====================

interface ConfirmStepProps {
  password: string;
  setPassword: (value: string) => void;
  reason: string;
  setReason: (value: string) => void;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmStep({
  password,
  setPassword,
  reason,
  setReason,
  isLoading,
  onConfirm,
  onCancel,
}: ConfirmStepProps) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <DialogTitle className="text-xl">Hesabı Sil</DialogTitle>
            <DialogDescription className="mt-1">
              Bu işlem geri alınamaz
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Warning */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="mb-2 font-semibold text-amber-900">
            ⚠️ Dikkat Edilmesi Gerekenler
          </h4>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• Tüm kişisel bilgileriniz silinecek</li>
            <li>• Aktif siparişleriniz varsa işlem yapılamaz</li>
            <li>• 7 gün içinde iptal edebilirsiniz</li>
            <li>• Finansal kayıtlar yasal olarak saklanır</li>
          </ul>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Şifreniz
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Mevcut şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-muted-foreground text-xs">
            Güvenlik için şifrenizi doğrulamanız gerekiyor
          </p>
        </div>

        {/* Reason (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="reason">Sebep (İsteğe bağlı)</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger disabled={isLoading} placeholder="Sebep seçin" />
            <SelectContent>
              {DELETION_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={isLoading || !password}
        >
          {isLoading ? 'İşlem Yapılıyor...' : 'Devam Et'}
        </Button>
      </DialogFooter>
    </>
  );
}

interface VerifyStepProps {
  verificationCode: string;
  setVerificationCode: (value: string) => void;
  expiresAt: string;
  isLoading: boolean;
  onVerify: () => void;
  onCancel: () => void;
}

function VerifyStep({
  verificationCode,
  setVerificationCode,
  expiresAt,
  isLoading,
  onVerify,
  onCancel,
}: VerifyStepProps) {
  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-3">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <DialogTitle className="text-xl">Email Doğrulama</DialogTitle>
            <DialogDescription className="mt-1">
              Doğrulama kodunu girin
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Info */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            📧 Email adresinize 6 haneli bir doğrulama kodu gönderdik. Lütfen
            email kutunuzu kontrol edin.
          </p>
        </div>

        {/* Verification Code */}
        <div className="space-y-2">
          <Label htmlFor="code">Doğrulama Kodu</Label>
          <Input
            id="code"
            type="text"
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setVerificationCode(value);
            }}
            disabled={isLoading}
            className="text-center text-2xl tracking-widest"
          />
        </div>

        {/* Expiry Warning */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            ⏱️ Kod 7 gün geçerlidir. Son tarih:{' '}
            {expiresAt
              ? new Date(expiresAt).toLocaleString('tr-TR')
              : 'Yükleniyor...'}
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          İptal
        </Button>
        <Button
          variant="destructive"
          onClick={onVerify}
          disabled={isLoading || verificationCode.length !== 6}
        >
          {isLoading ? 'Doğrulanıyor...' : 'Hesabı Sil'}
        </Button>
      </DialogFooter>
    </>
  );
}
