/**
 * ================================================
 * USER QUICK ACTIONS COMPONENT
 * ================================================
 * Quick action buttons for user management
 * Part of Story 4: User Management Completion
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1 Story 4.1
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import {
  Ban,
  CheckCircle,
  UserX,
  MessageSquare,
  Wallet,
  ShoppingCart,
  Shield,
  XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks';
import { adminUsersApi } from '@/lib/api/admin-users';
import type { AdminUserResponse } from '@/lib/api/admin-users';

interface UserQuickActionsProps {
  user: AdminUserResponse;
  onUserUpdate?: (updatedUser: AdminUserResponse) => void;
  className?: string;
}

/**
 * User Quick Actions Component
 */
export function UserQuickActions({
  user,
  onUserUpdate,
  className = '',
}: UserQuickActionsProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  /**
   * Suspend/Unsuspend User
   */
  const handleSuspendToggle = async () => {
    setIsLoading('suspend');
    try {
      const response =
        user.status === 'SUSPENDED'
          ? await adminUsersApi.activateUser(user.id)
          : await adminUsersApi.suspendUser(user.id, {
              reason: 'Admin action',
            });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'İşlem başarısız');
      }

      success(
        'Başarılı',
        user.status === 'SUSPENDED'
          ? 'Kullanıcı aktif edildi'
          : 'Kullanıcı askıya alındı'
      );

      if (onUserUpdate) {
        onUserUpdate(response.data);
      }
    } catch (_err) {
      showError('Hata', 'İşlem başarısız oldu');
    } finally {
      setIsLoading(null);
    }
  };

  /**
   * Ban/Unban User
   */
  const handleBanToggle = async () => {
    setIsLoading('ban');
    try {
      const response =
        user.status === 'BANNED'
          ? await adminUsersApi.unbanUser(user.id)
          : await adminUsersApi.banUser(user.id, {
              reason: 'Admin action',
              permanent: false,
            });

      if (!response.success || !response.data) {
        throw new Error(response.message || 'İşlem başarısız');
      }

      success(
        'Başarılı',
        user.status === 'BANNED'
          ? 'Kullanıcı yasağı kaldırıldı'
          : 'Kullanıcı yasaklandı'
      );

      if (onUserUpdate) {
        onUserUpdate(response.data);
      }
    } catch (_err) {
      showError('Hata', 'İşlem başarısız oldu');
    } finally {
      setIsLoading(null);
    }
  };

  /**
   * Navigate to Wallet
   */
  const handleViewWallet = () => {
    router.push(`/admin/users/${user.id}/wallet`);
  };

  /**
   * Navigate to Orders
   */
  const handleViewOrders = () => {
    router.push(`/admin/users/${user.id}/orders`);
  };

  /**
   * Navigate to Messages (placeholder)
   */
  const handleSendMessage = () => {
    router.push(`/admin/messages?userId=${user.id}`);
  };

  /**
   * Navigate to Edit
   */
  const handleEdit = () => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const isSuspended = user.status === 'SUSPENDED';
  const isBanned = user.status === 'BANNED';

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold">Hızlı İşlemler</h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Suspend/Activate */}
        <Button
          variant={isSuspended ? 'primary' : 'outline'}
          className="w-full"
          onClick={handleSuspendToggle}
          disabled={isLoading !== null || isBanned}
        >
          {isSuspended ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Aktif Et
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Askıya Al
            </>
          )}
        </Button>

        {/* Ban/Unban */}
        <Button
          variant={isBanned ? 'primary' : 'destructive'}
          className="w-full"
          onClick={handleBanToggle}
          disabled={isLoading !== null}
        >
          {isBanned ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Yasağı Kaldır
            </>
          ) : (
            <>
              <UserX className="mr-2 h-4 w-4" />
              Yasakla
            </>
          )}
        </Button>

        {/* Edit User */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleEdit}
          disabled={isLoading !== null}
        >
          <Shield className="mr-2 h-4 w-4" />
          Düzenle
        </Button>

        {/* Send Message */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSendMessage}
          disabled={isLoading !== null}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Mesaj Gönder
        </Button>

        {/* View Wallet */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleViewWallet}
          disabled={isLoading !== null}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Cüzdan
        </Button>

        {/* View Orders */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleViewOrders}
          disabled={isLoading !== null}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Siparişler
        </Button>
      </div>

      {/* Warning for banned users */}
      {isBanned && (
        <div className="bg-destructive/10 border-destructive/20 mt-4 flex items-start gap-2 rounded-lg border p-3">
          <XCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
          <p className="text-destructive text-sm">
            Bu kullanıcı yasaklanmıştır. Yasağı kaldırmadan diğer işlemleri
            yapamazsınız.
          </p>
        </div>
      )}
    </Card>
  );
}

export default UserQuickActions;
