/**
 * ================================================
 * ESCROW ACTIONS COMPONENT
 * ================================================
 * Action button group for escrow operations
 *
 * Features:
 * - Permission-based actions
 * - Release payment
 * - Raise dispute
 * - View details
 * - Role-based UI
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Escrow System Enhancement
 */

'use client';

import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Lock,
  Loader2,
} from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface EscrowActionsProps {
  /** Payment ID */
  paymentId: string;

  /** Order ID */
  orderId: string;

  /** Payment status */
  status:
    | 'HELD'
    | 'FROZEN'
    | 'RELEASED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'PENDING_RELEASE';

  /** Current user role */
  userRole: 'BUYER' | 'SELLER';

  /** Can release payment */
  canRelease: boolean;

  /** Can raise dispute */
  canDispute: boolean;

  /** On release action */
  onRelease: (paymentId: string) => Promise<void>;

  /** On dispute action */
  onDispute: (paymentId: string) => void;

  /** On view details */
  onViewDetails?: (orderId: string) => void;

  /** Loading state */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EscrowActions({
  paymentId,
  orderId,
  status,
  userRole,
  canRelease,
  canDispute,
  onRelease,
  onDispute,
  onViewDetails,
  isLoading = false,
  className = '',
}: EscrowActionsProps) {
  const [showReleaseConfirm, setShowReleaseConfirm] = React.useState(false);
  const [isReleasing, setIsReleasing] = React.useState(false);

  // Handle release confirmation
  const handleRelease = async () => {
    setIsReleasing(true);
    try {
      await onRelease(paymentId);
      setShowReleaseConfirm(false);
    } catch (error) {
      logger.error('Release failed', error as Error);
    } finally {
      setIsReleasing(false);
    }
  };

  // Get action availability messages
  const getActionMessage = () => {
    if (status === 'FROZEN') {
      return {
        type: 'warning' as const,
        message: 'İhtilaf nedeniyle ödeme dondurulmuş durumda',
      };
    }
    if (status === 'RELEASED') {
      return {
        type: 'success' as const,
        message: 'Ödeme başarıyla serbest bırakıldı',
      };
    }
    if (status === 'REFUNDED') {
      return {
        type: 'success' as const,
        message: 'Ödeme iade edildi',
      };
    }
    if (userRole === 'SELLER' && !canRelease) {
      return {
        type: 'info' as const,
        message: 'Alıcı siparişi onayladıktan sonra ödemeyi alabilirsiniz',
      };
    }
    return null;
  };

  const actionMessage = getActionMessage();

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Action Message */}
        {actionMessage && (
          <div
            className={`rounded-lg p-4 ${
              actionMessage.type === 'warning'
                ? 'bg-yellow-50 text-yellow-800'
                : actionMessage.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-blue-50 text-blue-800'
            }`}
          >
            <p className="text-sm font-medium">{actionMessage.message}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Release Payment Button */}
          {canRelease && (
            <UnifiedButton
              onClick={() => setShowReleaseConfirm(true)}
              variant="primary"
              size="lg"
              disabled={isLoading || status === 'FROZEN'}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {userRole === 'BUYER'
                    ? 'Ödemeyi Serbest Bırak'
                    : 'Ödemeyi Al'}
                </>
              )}
            </UnifiedButton>
          )}

          {/* Raise Dispute Button */}
          {canDispute && status !== 'FROZEN' && (
            <UnifiedButton
              onClick={() => onDispute(paymentId)}
              variant="destructive"
              size="lg"
              disabled={isLoading}
              className="flex-1"
            >
              <AlertTriangle className="mr-2 h-5 w-5" />
              İhtilaf Aç
            </UnifiedButton>
          )}

          {/* View Details Button */}
          {onViewDetails && (
            <UnifiedButton
              onClick={() => onViewDetails(orderId)}
              variant="outline"
              size="lg"
              disabled={isLoading}
            >
              <ExternalLink className="mr-2 h-5 w-5" />
              Detayları Görüntüle
            </UnifiedButton>
          )}
        </div>

        {/* Status Info */}
        {status === 'FROZEN' && (
          <div className="flex items-start gap-3 rounded-lg bg-cyan-50 p-4">
            <Lock className="h-5 w-5 flex-shrink-0 text-cyan-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-cyan-900">
                Ödeme Donduruldu
              </p>
              <p className="mt-1 text-xs text-cyan-700">
                İhtilaf çözümlenene kadar ödeme işlemleri askıya alınmıştır.
                Süreç hakkında bilgi almak için destek ekibimizle iletişime
                geçebilirsiniz.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Release Confirmation Dialog */}
      <Dialog open={showReleaseConfirm} onOpenChange={setShowReleaseConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userRole === 'BUYER' ? 'Ödemeyi Serbest Bırak' : 'Ödemeyi Al'}
            </DialogTitle>
            <DialogDescription>
              {userRole === 'BUYER'
                ? 'Siparişin teslim edildiğini ve beklentilerinizi karşıladığını onaylıyor musunuz? Bu işlem geri alınamaz.'
                : 'Ödeme hesabınıza aktarılacaktır. Devam etmek istiyor musunuz?'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-900">
              ⚠️ Önemli Uyarı
            </p>
            <p className="mt-1 text-xs text-yellow-700">
              {userRole === 'BUYER'
                ? 'Ödemeyi serbest bıraktıktan sonra ihtilaf açamazsınız. Lütfen siparişi dikkatlice kontrol edin.'
                : 'Ödeme alındıktan sonra iade işlemleri daha uzun sürebilir.'}
            </p>
          </div>

          <DialogFooter>
            <UnifiedButton
              variant="outline"
              onClick={() => setShowReleaseConfirm(false)}
              disabled={isReleasing}
            >
              İptal
            </UnifiedButton>
            <UnifiedButton
              variant="primary"
              onClick={handleRelease}
              disabled={isReleasing}
            >
              {isReleasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Onayla'
              )}
            </UnifiedButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Helper component for displaying action permissions
 */
export function EscrowActionPermissions({
  userRole,
  canRelease,
  canDispute,
  status,
}: {
  userRole: 'BUYER' | 'SELLER';
  canRelease: boolean;
  canDispute: boolean;
  status: string;
}) {
  const permissions = [];

  if (canRelease) {
    permissions.push({
      label:
        userRole === 'BUYER'
          ? 'Ödemeyi serbest bırakabilir'
          : 'Ödemeyi alabilir',
      allowed: true,
    });
  } else {
    permissions.push({
      label: userRole === 'BUYER' ? 'Ödemeyi serbest bırakma' : 'Ödemeyi alma',
      allowed: false,
      reason:
        status === 'FROZEN'
          ? 'İhtilaf nedeniyle donduruldu'
          : 'Henüz uygun değil',
    });
  }

  if (canDispute) {
    permissions.push({
      label: 'İhtilaf açabilir',
      allowed: true,
    });
  } else {
    permissions.push({
      label: 'İhtilaf açma',
      allowed: false,
      reason:
        status === 'FROZEN' ? 'Zaten bir ihtilaf var' : 'Henüz uygun değil',
    });
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-900">
        Yetkiniz olan işlemler
      </h4>
      <ul className="space-y-2">
        {permissions.map((permission, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <span
              className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                permission.allowed ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <div className="flex-1">
              <span
                className={
                  permission.allowed ? 'text-gray-900' : 'text-gray-500'
                }
              >
                {permission.label}
              </span>
              {!permission.allowed && permission.reason && (
                <span className="text-muted-foreground ml-1 text-xs">
                  ({permission.reason})
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EscrowActions;
