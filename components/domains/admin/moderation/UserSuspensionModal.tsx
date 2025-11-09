'use client';

/**
 * ================================================
 * USER SUSPENSION MODAL
 * ================================================
 * Modal for suspending user accounts
 *
 * Features:
 * - 4 suspension type options
 * - 11 suspension reason options
 * - Duration input (for TEMPORARY type)
 * - Internal notes
 *
 * Sprint: Moderator Reporting & Actions
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { Ban } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useUserModeration } from '@/hooks/business/useUserModeration';

/**
 * Suspension type options (must match backend enum)
 */
const SUSPENSION_TYPES = [
  {
    value: 'TEMPORARY',
    label: 'Geçici Askıya Alma',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'PERMANENT',
    label: 'Kalıcı Askıya Alma',
    color: 'bg-red-100 text-red-800',
  },
  {
    value: 'SELLER_RESTRICTED',
    label: 'Satıcı Kısıtlaması',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'BUYER_RESTRICTED',
    label: 'Alıcı Kısıtlaması',
    color: 'bg-blue-100 text-blue-800',
  },
] as const;

/**
 * Suspension reason options (must match backend enum)
 */
const SUSPENSION_REASONS = [
  { value: 'REPEATED_WARNINGS', label: 'Tekrarlayan Uyarılar' },
  { value: 'SERIOUS_VIOLATION', label: 'Ciddi İhlal' },
  { value: 'FRAUD', label: 'Dolandırıcılık' },
  { value: 'IDENTITY_THEFT', label: 'Kimlik Hırsızlığı' },
  { value: 'PAYMENT_FRAUD', label: 'Ödeme Dolandırıcılığı' },
  { value: 'MULTIPLE_ACCOUNTS', label: 'Çoklu Hesap Kullanımı' },
  { value: 'ABUSIVE_BEHAVIOR', label: 'Kötü Davranış' },
  { value: 'LEGAL_REQUEST', label: 'Yasal Talep' },
  { value: 'SELLER_MISCONDUCT', label: 'Satıcı Uygunsuzluğu' },
  { value: 'BUYER_MISCONDUCT', label: 'Alıcı Uygunsuzluğu' },
  { value: 'OTHER', label: 'Diğer' },
] as const;

/**
 * Props for UserSuspensionModal
 */
interface UserSuspensionModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

/**
 * User Suspension Modal Component
 */
export function UserSuspensionModal({
  open,
  onClose,
  userId,
  onSuccess,
}: UserSuspensionModalProps) {
  // State
  const [suspensionType, setSuspensionType] = useState('');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [internalNotes, setInternalNotes] = useState('');

  // Hooks
  const { suspendUserAccount, isLoading } = useUserModeration();

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setSuspensionType('');
      setReason('');
      setDetails('');
      setDurationDays('7');
      setInternalNotes('');
    }
  }, [open]);

  /**
   * Handle suspension submission
   */
  const handleSubmit = async () => {
    if (!suspensionType || !reason || !details.trim()) {
      return;
    }

    // Validate duration for TEMPORARY type
    if (suspensionType === 'TEMPORARY') {
      const days = parseInt(durationDays);
      if (isNaN(days) || days < 1) {
        return;
      }
    }

    const success = await suspendUserAccount({
      userId,
      suspensionType: suspensionType as
        | 'TEMPORARY'
        | 'PERMANENT'
        | 'SELLER_RESTRICTED'
        | 'BUYER_RESTRICTED',
      reason,
      details,
      durationDays:
        suspensionType === 'TEMPORARY' ? parseInt(durationDays) : undefined,
      internalNotes: internalNotes || undefined,
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  /**
   * Get selected type badge
   */
  const getSelectedTypeBadge = () => {
    const selected = SUSPENSION_TYPES.find((t) => t.value === suspensionType);
    return selected ? (
      <Badge className={selected.color}>{selected.label}</Badge>
    ) : null;
  };

  /**
   * Check if form is valid
   */
  const isFormValid = () => {
    if (!suspensionType || !reason || !details.trim()) return false;
    if (suspensionType === 'TEMPORARY') {
      const days = parseInt(durationDays);
      return !isNaN(days) && days >= 1;
    }
    return true;
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-600" />
            Kullanıcıyı Askıya Al
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem kullanıcının hesap erişimini kısıtlayacaktır. Dikkatli
            olun!
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Critical Warning */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Ban className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="mb-1 text-sm font-semibold text-red-800">
                  Kritik İşlem
                </p>
                <p className="text-sm text-red-700">
                  Askıya alma işlemi kullanıcının hesap erişimini sınırlar veya
                  tamamen engeller. Bu kararı vermeden önce tüm detayları gözden
                  geçirin.
                </p>
              </div>
            </div>
          </div>

          {/* Suspension Type */}
          <div className="space-y-2">
            <Label htmlFor="suspensionType" className="required">
              Askıya Alma Tipi
            </Label>
            <select
              id="suspensionType"
              value={suspensionType}
              onChange={(e) => setSuspensionType(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Tip seçiniz...</option>
              {SUSPENSION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {suspensionType && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Seçilen:</span>
                {getSelectedTypeBadge()}
              </div>
            )}
          </div>

          {/* Duration (for TEMPORARY type only) */}
          {suspensionType === 'TEMPORARY' && (
            <div className="space-y-2">
              <Label htmlFor="durationDays" className="required">
                Süre (Gün)
              </Label>
              <Input
                id="durationDays"
                type="number"
                min="1"
                max="365"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Askıya alma süresi 1-365 gün arasında olabilir.
              </p>
            </div>
          )}

          {/* Suspension Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="required">
              Askıya Alma Nedeni
            </Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Neden seçiniz...</option>
              {SUSPENSION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details (Public) */}
          <div className="space-y-2">
            <Label htmlFor="details" className="required">
              Detaylar (Kullanıcıya gösterilecek)
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Askıya alma sebebini kullanıcıya açıklayın..."
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Bu açıklama kullanıcıya gösterilecektir. Açık ve profesyonel olun.
            </p>
          </div>

          {/* Internal Notes (Private) */}
          <div className="space-y-2">
            <Label htmlFor="internalNotes">
              İç Notlar (Opsiyonel - Sadece moderatörler görebilir)
            </Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="İç ekip için ek notlar..."
              rows={3}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Bu notlar kullanıcıya gösterilmez, sadece moderatör ekibi
              görebilir.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className={`${
              isLoading || !isFormValid()
                ? 'cursor-not-allowed opacity-50'
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            {isLoading ? 'İşlem Yapılıyor...' : 'Askıya Al'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
