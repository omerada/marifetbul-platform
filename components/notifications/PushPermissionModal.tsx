'use client';

/**
 * ================================================
 * PUSH PERMISSION MODAL
 * ================================================
 * Modal for requesting push notification permission
 *
 * Features:
 * - Clear explanation of notification benefits
 * - One-time user prompt with smart timing
 * - Handles "Not Now" with 7-day cooldown
 * - Graceful error handling
 * - Responsive design
 * - Accessible (ARIA labels)
 *
 * Sprint: Push Notification System - Phase 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 12, 2025
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Bell, Check, X } from 'lucide-react';
import {
  subscribeToPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
} from '@/lib/infrastructure/services/push-notification.service';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface PushPermissionModalProps {
  /** Show modal on mount if eligible (default: true) */
  autoShow?: boolean;
  /** Days to wait before asking again after "Not Now" (default: 7) */
  cooldownDays?: number;
  /** Optional callback after permission granted */
  onPermissionGranted?: () => void;
  /** Optional callback after permission denied */
  onPermissionDenied?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'push_permission_modal';
const BENEFITS = [
  {
    icon: Bell,
    title: 'Sipariş Güncellemeleri',
    description: 'Sipariş durumu değişikliklerinden anında haberdar olun',
  },
  {
    icon: Check,
    title: 'Yeni Mesajlar',
    description: 'Gelen mesajları kaçırmayın, hemen yanıt verin',
  },
  {
    icon: Bell,
    title: 'Önemli Bildirimler',
    description: 'Ödeme, teklif ve yorum bildirimleri',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user should be prompted
 */
function shouldShowPrompt(cooldownDays: number): boolean {
  if (typeof window === 'undefined') return false;

  // Check browser support
  if (!isPushNotificationSupported()) {
    return false;
  }

  // Check existing permission
  const permission = getNotificationPermission();
  if (permission !== 'default') {
    // Already granted or denied
    return false;
  }

  // Check cooldown
  const lastPromptData = localStorage.getItem(STORAGE_KEY);
  if (!lastPromptData) {
    return true; // First time
  }

  try {
    const { lastPromptDate, dismissed } = JSON.parse(lastPromptData);
    if (!dismissed) {
      return true; // Not dismissed before
    }

    const daysSinceLastPrompt =
      (Date.now() - new Date(lastPromptDate).getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastPrompt >= cooldownDays;
  } catch {
    return true;
  }
}

/**
 * Save prompt state to localStorage
 */
function savePromptState(dismissed: boolean) {
  if (typeof window === 'undefined') return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      lastPromptDate: new Date().toISOString(),
      dismissed,
    })
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PushPermissionModal({
  autoShow = true,
  cooldownDays = 7,
  onPermissionGranted,
  onPermissionDenied,
}: PushPermissionModalProps) {
  // ==================== STATE ====================

  const { isAuthenticated, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ==================== EFFECTS ====================

  /**
   * Auto-show modal if eligible
   */
  useEffect(() => {
    if (!autoShow || !isAuthenticated || !user) {
      return;
    }

    // Delay prompt slightly to not interrupt user experience
    const timer = setTimeout(() => {
      if (shouldShowPrompt(cooldownDays)) {
        setIsOpen(true);
        logger.info('Push permission modal shown to user');
      }
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [autoShow, isAuthenticated, user, cooldownDays]);

  // ==================== HANDLERS ====================

  /**
   * Handle enable notifications
   */
  const handleEnable = async () => {
    setIsLoading(true);

    try {
      const result = await subscribeToPushNotifications();

      if (result.success) {
        // Save state and close
        savePromptState(false);
        setIsOpen(false);

        toast.success('Bildirimler aktif!', {
          description: 'Artık önemli güncellemelerden haberdar olacaksınız.',
        });

        onPermissionGranted?.();
        logger.info('User granted push notification permission');
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch (error) {
      logger.error('Push permission request failed', error as Error);

      toast.error('Bildirim izni alınamadı', {
        description: 'Lütfen tarayıcı ayarlarınızdan bildirimlere izin verin.',
      });

      onPermissionDenied?.();
      savePromptState(false);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle "Not Now" - dismiss with cooldown
   */
  const handleNotNow = () => {
    savePromptState(true); // Dismissed
    setIsOpen(false);
    logger.info('User dismissed push permission modal');
  };

  /**
   * Handle close (X button) - same as "Not Now"
   */
  const handleClose = () => {
    handleNotNow();
  };

  // ==================== RENDER ====================

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle>Bildirimleri Aç</DialogTitle>
              <DialogDescription>
                Önemli güncellemelerden haberdar olun
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Benefits */}
        <div className="space-y-4 py-4">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      'bg-gray-100 text-gray-600'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <div className="pb-4">
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-sm text-blue-800">
              💡 Bildirimleri istediğiniz zaman ayarlardan kapatabilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleNotNow}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="mr-2 h-4 w-4" />
            Şimdi Değil
          </Button>
          <Button
            variant="primary"
            onClick={handleEnable}
            disabled={isLoading}
            loading={isLoading}
            className="flex-1"
          >
            <Check className="mr-2 h-4 w-4" />
            İzin Ver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PushPermissionModal;
