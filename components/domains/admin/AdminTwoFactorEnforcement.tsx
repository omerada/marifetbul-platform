/**
 * ================================================
 * ADMIN TWO-FACTOR ENFORCEMENT COMPONENT
 * ================================================
 * Sprint 1: Security & Compliance - Story 2
 *
 * Forces admin users to set up 2FA on their first login
 * or when 2FA is not enabled.
 *
 * Features:
 * - Detects if user is admin/moderator
 * - Checks 2FA status
 * - Shows mandatory 2FA setup modal
 * - Prevents access until 2FA is configured
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-26
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Alert, AlertDescription } from '@/components/ui';
import { TwoFactorSetup } from '@/components/domains/auth/TwoFactorSetup';
import { useTwoFactor } from '@/hooks/business/useTwoFactor';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { Shield, AlertTriangle } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface AdminTwoFactorEnforcementProps {
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AdminTwoFactorEnforcement Component
 *
 * Wraps admin panel content and enforces 2FA setup for admin/moderator users.
 *
 * @example
 * ```tsx
 * // In admin layout
 * <AdminTwoFactorEnforcement>
 *   <AdminDashboard />
 * </AdminTwoFactorEnforcement>
 * ```
 */
export function AdminTwoFactorEnforcement({
  children,
}: AdminTwoFactorEnforcementProps) {
  const { user, logout } = useAuthStore();
  const { status, fetchStatus, isLoading } = useTwoFactor();
  const router = useRouter();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // Determine if user is admin or moderator
  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  /**
   * Check 2FA status on mount
   */
  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      if (!user || !isAdminUser) {
        setIsCheckingStatus(false);
        return;
      }

      try {
        logger.info('[Admin2FAEnforcement] Checking 2FA status for admin user');
        await fetchStatus();
      } catch (error) {
        logger.error(
          '[Admin2FAEnforcement] Failed to check 2FA status',
          error instanceof Error ? error : new Error(String(error))
        );
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkTwoFactorStatus();
  }, [user, isAdminUser, fetchStatus]);

  /**
   * Show setup modal if admin doesn't have 2FA enabled
   */
  useEffect(() => {
    if (!isCheckingStatus && isAdminUser && status && !status.enabled) {
      logger.warn('[Admin2FAEnforcement] Admin user without 2FA detected', {
        userId: user?.id,
        role: user?.role,
      });
      setShowSetupModal(true);
    }
  }, [isCheckingStatus, isAdminUser, status, user]);

  /**
   * Handle 2FA setup completion
   */
  const handleSetupComplete = async () => {
    logger.info('[Admin2FAEnforcement] 2FA setup completed');
    setShowSetupModal(false);

    // Refresh 2FA status
    await fetchStatus();
  };

  /**
   * Handle logout if user refuses to set up 2FA
   */
  const handleLogout = () => {
    logger.info(
      '[Admin2FAEnforcement] User logged out without completing 2FA setup'
    );
    logout();
    router.push('/admin/login');
  };

  // Show loading state while checking
  if (isCheckingStatus || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-flex rounded-full bg-blue-100 p-4">
            <Shield className="h-8 w-8 animate-pulse text-blue-600" />
          </div>
          <p className="text-sm text-gray-600">
            Güvenlik kontrolleri yapılıyor...
          </p>
        </div>
      </div>
    );
  }

  // If user is admin and doesn't have 2FA, show mandatory setup modal
  if (isAdminUser && status && !status.enabled) {
    return (
      <>
        {/* Background blur effect */}
        <div className="pointer-events-none min-h-screen blur-sm">
          {children}
        </div>

        {/* Mandatory 2FA Setup Modal */}
        <Dialog open={showSetupModal} onOpenChange={() => {}}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-6">
              {/* Warning Alert */}
              <Alert
                variant="warning"
                className="border-yellow-200 bg-yellow-50"
              >
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Güvenlik Uyarısı:</strong> Admin hesapları için İki
                  Faktörlü Doğrulama (2FA) zorunludur. Devam etmek için lütfen
                  2FA kurulumunu tamamlayın.
                </AlertDescription>
              </Alert>

              {/* 2FA Setup Wizard */}
              <TwoFactorSetup
                onComplete={handleSetupComplete}
                onCancel={handleLogout}
                autoStart={true}
              />

              {/* Info text */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Neden 2FA gerekli?</strong>
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-800">
                  <li>
                    Admin hesaplarının ekstra güvenlik katmanı ile korunması
                  </li>
                  <li>Yetkisiz erişimlerin önlenmesi</li>
                  <li>Kullanıcı verilerinin güvenliğinin sağlanması</li>
                  <li>KVKK ve GDPR uyumluluk gereksinimleri</li>
                </ul>
              </div>

              {/* Cannot skip */}
              <p className="text-center text-xs text-gray-500">
                Bu adımı atlayamazsınız. Kurulumu tamamlamadan admin paneline
                erişemezsiniz.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // User is not admin or has 2FA enabled - render normally
  return <>{children}</>;
}

export default AdminTwoFactorEnforcement;
