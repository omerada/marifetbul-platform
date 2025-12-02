'use client';

/**
 * ================================================
 * RESOLVE FLAG MODAL
 * ================================================
 * Modal for resolving flagged comments with moderation action
 * Admin/Moderator interface for flag resolution
 *
 * Sprint 1: Comment Moderation UI Completion
 * Backend API: POST /api/v1/blog/admin/flags/{id}/resolve
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since December 2, 2025
 */

import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  resolveFlag,
  ModerationAction,
  type CommentFlag,
  type ResolveFlagRequest,
} from '@/lib/api/comment-flagging';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface ResolveFlagModalProps {
  flag: CommentFlag;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ================================================
// MODERATION ACTION OPTIONS
// ================================================

const ACTION_OPTIONS: Array<{
  value: ModerationAction;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: ModerationAction.APPROVED,
    label: 'Onay - Yorum Uygun',
    description: 'Flag geçersiz, yorum uygun görüldü',
    color: 'text-green-600',
  },
  {
    value: ModerationAction.REMOVED,
    label: 'Kaldır - Yorum Silindi',
    description: 'Yorum politika ihlali nedeniyle kaldırıldı',
    color: 'text-red-600',
  },
  {
    value: ModerationAction.EDITED,
    label: 'Düzenle - Yorum Düzeltildi',
    description: 'Yorum düzenlendi ve uygun hale getirildi',
    color: 'text-blue-600',
  },
  {
    value: ModerationAction.WARNING_SENT,
    label: 'Uyarı - Kullanıcıya Bildirildi',
    description: 'Kullanıcıya uyarı gönderildi',
    color: 'text-yellow-600',
  },
  {
    value: ModerationAction.USER_BANNED,
    label: 'Yasakla - Kullanıcı Yasaklandı',
    description: 'Ciddi ihlal, kullanıcı yasaklandı',
    color: 'text-red-800',
  },
  {
    value: ModerationAction.NO_ACTION,
    label: 'İşlem Yok - İncelendi',
    description: 'Flag incelendi, işlem gerekmedi',
    color: 'text-gray-600',
  },
];

// ================================================
// COMPONENT
// ================================================

export function ResolveFlagModal({
  flag,
  isOpen,
  onClose,
  onSuccess,
}: ResolveFlagModalProps) {
  // ================================================
  // STATE
  // ================================================

  const [action, setAction] = useState<ModerationAction>(
    ModerationAction.NO_ACTION
  );
  const [resolutionNote, setResolutionNote] = useState('');
  const [banUser, setBanUser] = useState(false);
  const [banDurationDays, setBanDurationDays] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ================================================
  // VALIDATION
  // ================================================

  const isValid = resolutionNote.trim().length >= 10;

  // ================================================
  // HANDLERS
  // ================================================

  const handleResolve = async () => {
    if (!isValid) {
      toast.error('Lütfen yeterli detay sağlayın (en az 10 karakter)');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: ResolveFlagRequest = {
        action,
        resolutionNote,
      };

      // Add ban info if user_banned action
      if (action === ModerationAction.USER_BANNED || banUser) {
        request.banUser = true;
        request.banDurationDays = banDurationDays;
      }

      await resolveFlag(flag.id, request);

      logger.info('Flag resolved', {
        flagId: flag.id,
        action,
        banUser,
      });

      toast.success('Flag başarıyla çözüldü');

      // Success callback
      onSuccess?.();

      // Reset and close
      handleClose();
    } catch (error) {
      logger.error('Failed to resolve flag', error as Error, {
        flagId: flag.id,
      });

      toast.error('Flag çözülemedi. Lütfen tekrar deneyin.', {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAction(ModerationAction.NO_ACTION);
      setResolutionNote('');
      setBanUser(false);
      setBanDurationDays(7);
      onClose();
    }
  };

  // ================================================
  // RENDER
  // ================================================

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Flag&apos;i Çöz
              </h3>
              <p className="text-sm text-gray-500">Flag ID: {flag.id}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 px-6 py-4">
          {/* Flag Info */}
          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-sm">
              <p className="font-medium text-orange-900">
                Raporlayan: {flag.reporterName}
              </p>
              <p className="mt-1 text-orange-800">
                <span className="font-medium">Neden:</span> {flag.reason}
              </p>
              {flag.customReason && (
                <p className="mt-1 text-orange-700 italic">
                  &quot;{flag.customReason}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Moderation Action Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Moderasyon Eylemi <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {ACTION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 transition-all ${
                    action === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="action"
                    value={option.value}
                    checked={action === option.value}
                    onChange={(e) =>
                      setAction(e.target.value as ModerationAction)
                    }
                    disabled={isSubmitting}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${option.color}`}>
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Resolution Note (Required) */}
          <div>
            <label
              htmlFor="resolutionNote"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Çözüm Notu <span className="text-red-500">*</span>
            </label>
            <textarea
              id="resolutionNote"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="Bu flag'i neden ve nasıl çözdünüz? Detaylı açıklama sağlayın..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-green-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              rows={4}
              minLength={10}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              En az 10 karakter ({resolutionNote.length}/10)
            </p>
          </div>

          {/* Ban Options (if applicable) */}
          {(action === ModerationAction.USER_BANNED ||
            action === ModerationAction.REMOVED) && (
            <div className="rounded-lg bg-red-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <label className="flex items-center gap-2 font-medium text-red-900">
                    <input
                      type="checkbox"
                      checked={
                        banUser || action === ModerationAction.USER_BANNED
                      }
                      onChange={(e) => setBanUser(e.target.checked)}
                      disabled={action === ModerationAction.USER_BANNED}
                      className="rounded"
                    />
                    Kullanıcıyı Yasakla
                  </label>

                  {(banUser || action === ModerationAction.USER_BANNED) && (
                    <div className="mt-3">
                      <label className="mb-1 block text-sm font-medium text-red-800">
                        Yasak Süresi (Gün)
                      </label>
                      <select
                        value={banDurationDays}
                        onChange={(e) =>
                          setBanDurationDays(Number(e.target.value))
                        }
                        className="w-full rounded-lg border border-red-300 px-3 py-2 focus:ring-2 focus:ring-red-500"
                      >
                        <option value={1}>1 Gün</option>
                        <option value={3}>3 Gün</option>
                        <option value={7}>7 Gün (1 Hafta)</option>
                        <option value={14}>14 Gün (2 Hafta)</option>
                        <option value={30}>30 Gün (1 Ay)</option>
                        <option value={90}>90 Gün (3 Ay)</option>
                        <option value={365}>365 Gün (1 Yıl)</option>
                        <option value={-1}>Kalıcı</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex gap-2 rounded-lg bg-amber-50 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Dikkat</p>
              <p className="mt-1">
                Bu eylem geri alınamaz. Kararınızdan emin olduğunuzdan emin
                olun.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-gray-50 px-6 py-4">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
          <button
            onClick={handleResolve}
            disabled={!isValid || isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Çözülüyor...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Flag&apos;i Çöz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResolveFlagModal;
