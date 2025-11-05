/**
 * ============================================================================
 * SESSION TIMEOUT MODAL - User Session Expiry Warning
 * ============================================================================
 * Modal that appears before session expires, giving user option to extend
 *
 * Features:
 * - Shows countdown timer
 * - "Extend Session" button
 * - "Logout" button
 * - Auto-closes on session extend
 * - Accessible (keyboard navigation, ARIA labels)
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 5, 2025
 * @sprint Sprint 1.2 - Session Management UI
 */

'use client';

import React from 'react';
import { Clock, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { UnifiedButton } from '@/components/ui/UnifiedButton';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionTimeoutModalProps {
  /** Whether modal is open */
  isOpen: boolean;

  /** Remaining time in seconds */
  remainingSeconds: number;

  /** Called when user clicks "Extend Session" */
  onExtend: () => void;

  /** Called when user clicks "Logout" */
  onLogout: () => void;

  /** Optional: Called when modal closes */
  onClose?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Session timeout warning modal
 *
 * @example
 * ```tsx
 * <SessionTimeoutModal
 *   isOpen={isExpiringSoon}
 *   remainingSeconds={remainingSeconds}
 *   onExtend={extendSession}
 *   onLogout={handleLogout}
 * />
 * ```
 */
export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  remainingSeconds,
  onExtend,
  onLogout,
  onClose,
}) => {
  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (mins === 0) {
      return `${secs} saniye`;
    }

    return `${mins} dakika ${secs} saniye`;
  };

  // Determine urgency level for styling
  const isUrgent = remainingSeconds < 60; // Less than 1 minute
  const isCritical = remainingSeconds < 30; // Less than 30 seconds

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        aria-labelledby="session-timeout-title"
        aria-describedby="session-timeout-description"
      >
        {/* Header with Icon */}
        <div className="flex flex-col items-center gap-4 p-6">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isCritical
                ? 'bg-red-100 text-red-600'
                : isUrgent
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            <AlertTriangle className="h-8 w-8" />
          </div>

          {/* Title */}
          <DialogTitle
            id="session-timeout-title"
            className="text-center text-2xl font-bold text-gray-900"
          >
            Oturum Süreniz Dolmak Üzere
          </DialogTitle>

          {/* Description */}
          <DialogDescription
            id="session-timeout-description"
            className="text-center text-gray-600"
          >
            Güvenliğiniz için oturumunuz yakında otomatik olarak kapatılacak.
            Çalışmanıza devam etmek için oturumunuzu uzatabilirsiniz.
          </DialogDescription>
        </div>

        {/* Countdown Timer */}
        <div className="border-y border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <Clock
              className={`h-6 w-6 ${
                isCritical
                  ? 'animate-pulse text-red-600'
                  : isUrgent
                    ? 'text-orange-600'
                    : 'text-gray-600'
              }`}
            />
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  isCritical
                    ? 'text-red-600'
                    : isUrgent
                      ? 'text-orange-600'
                      : 'text-gray-900'
                }`}
              >
                {formatTime(remainingSeconds)}
              </div>
              <div className="text-sm text-gray-500">Kalan süre</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 p-6">
          {/* Extend Session Button (Primary) */}
          <UnifiedButton
            onClick={onExtend}
            variant="primary"
            size="lg"
            className="w-full"
            leftIcon={<RefreshCw className="h-5 w-5" />}
          >
            Oturumu Uzat
          </UnifiedButton>

          {/* Logout Button (Secondary) */}
          <UnifiedButton
            onClick={onLogout}
            variant="outline"
            size="lg"
            className="w-full"
            leftIcon={<LogOut className="h-5 w-5" />}
          >
            Çıkış Yap
          </UnifiedButton>
        </div>

        {/* Info Text */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <p className="text-center text-xs text-gray-500">
            Herhangi bir işlem yapmazsanız, güvenliğiniz için oturumunuz
            otomatik olarak kapatılacak ve giriş sayfasına yönlendirileceksiniz.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// COMPONENT DISPLAY NAME (for debugging)
// ============================================================================

SessionTimeoutModal.displayName = 'SessionTimeoutModal';

// ============================================================================
// EXPORTS
// ============================================================================

export default SessionTimeoutModal;
