'use client';

/**
 * ================================================
 * USER WARNING MODAL
 * ================================================
 * Modal for issuing warnings to users
 *
 * Features:
 * - 9 warning reason options
 * - Details input
 * - Optional content reference
 * - Auto-escalation warning display
 *
 * Sprint: Moderator Reporting & Actions
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 */

'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/uiDialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useUserModeration } from '@/hooks/business/useUserModeration';

/**
 * Warning reason options (must match backend enum)
 */
const WARNING_REASONS = [
  { value: 'SPAM', label: 'Spam İçerik' },
  { value: 'HARASSMENT', label: 'Taciz/Rahatsızlık' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Uygunsuz İçerik' },
  { value: 'FAKE_INFORMATION', label: 'Sahte Bilgi' },
  { value: 'COPYRIGHT_VIOLATION', label: 'Telif Hakkı İhlali' },
  { value: 'PRICE_MANIPULATION', label: 'Fiyat Manipülasyonu' },
  { value: 'POOR_SERVICE_QUALITY', label: 'Düşük Hizmet Kalitesi' },
  { value: 'POLICY_VIOLATION', label: 'Politika İhlali' },
  { value: 'OTHER', label: 'Diğer' },
] as const;

/**
 * Props for UserWarningModal
 */
interface UserWarningModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  currentWarningsCount: number;
  onSuccess?: () => void;
}

/**
 * User Warning Modal Component
 */
export function UserWarningModal({
  open,
  onClose,
  userId,
  currentWarningsCount,
  onSuccess,
}: UserWarningModalProps) {
  // State
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [contentReference, setContentReference] = useState('');

  // Hooks
  const { issueWarningToUser, isLoading } = useUserModeration();

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setReason('');
      setDetails('');
      setContentReference('');
    }
  }, [open]);

  /**
   * Handle warning submission
   */
  const handleSubmit = async () => {
    if (!reason || !details.trim()) {
      return;
    }

    const success = await issueWarningToUser({
      userId,
      reason,
      details,
      relatedContentRef: contentReference || undefined,
    });

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  /**
   * Get next warning level badge
   */
  const getNextLevel = () => {
    if (currentWarningsCount === 0) return 'LEVEL_1';
    if (currentWarningsCount === 1) return 'LEVEL_2';
    return 'LEVEL_3';
  };

  /**
   * Get escalation warning message
   */
  const getEscalationWarning = () => {
    if (currentWarningsCount === 0) {
      return 'Bu kullanıcının ilk uyarısı olacak.';
    }
    if (currentWarningsCount === 1) {
      return 'Bu kullanıcının 2. uyarısı olacak. Dikkatli olun!';
    }
    return 'Bu kullanıcının 3. uyarısı olacak ve otomatik olarak 7 gün askıya alınacak!';
  };

  /**
   * Get level badge color
   */
  const getLevelBadgeColor = () => {
    if (currentWarningsCount === 0) return 'bg-yellow-100 text-yellow-800';
    if (currentWarningsCount === 1) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Kullanıcıya Uyarı Ver
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem kullanıcının moderasyon geçmişine kaydedilecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Escalation Warning */}
          <div
            className={`rounded-lg p-4 ${
              currentWarningsCount >= 2
                ? 'border border-red-200 bg-red-50'
                : 'border border-blue-200 bg-blue-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`mt-0.5 h-5 w-5 ${
                  currentWarningsCount >= 2 ? 'text-red-600' : 'text-blue-600'
                }`}
              />
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    Mevcut Uyarılar: {currentWarningsCount}
                  </span>
                  <Badge className={getLevelBadgeColor()}>
                    Sonraki Seviye: {getNextLevel()}
                  </Badge>
                </div>
                <p
                  className={`text-sm ${
                    currentWarningsCount >= 2 ? 'text-red-700' : 'text-blue-700'
                  }`}
                >
                  {getEscalationWarning()}
                </p>
              </div>
            </div>
          </div>

          {/* Warning Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="required">
              Uyarı Nedeni
            </Label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Neden seçiniz...</option>
              {WARNING_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="required">
              Detaylar
            </Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Uyarı sebebi hakkında detaylı açıklama yazın..."
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Bu açıklama kullanıcıya gösterilecektir.
            </p>
          </div>

          {/* Content Reference (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="contentReference">
              İçerik Referansı (Opsiyonel)
            </Label>
            <Input
              id="contentReference"
              type="text"
              value={contentReference}
              onChange={(e) => setContentReference(e.target.value)}
              placeholder="Örn: /marketplace/packages/abc123"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              İlgili içeriğin URL&apos;sini veya ID&apos;sini girebilirsiniz.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className={`${
              isLoading || !reason || !details.trim()
                ? 'cursor-not-allowed opacity-50'
                : 'bg-yellow-600 hover:bg-yellow-700'
            } text-white`}
          >
            {isLoading ? 'Gönderiliyor...' : 'Uyarı Ver'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
