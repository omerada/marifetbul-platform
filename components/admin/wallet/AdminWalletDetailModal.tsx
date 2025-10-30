/**
 * ================================================
 * ADMIN WALLET DETAIL MODAL
 * ================================================
 * Detailed wallet information modal for admins
 *
 * Features:
 * - View wallet details
 * - View user information
 * - View transaction history
 * - View payout history
 * - Manual balance adjustment
 * - Freeze/unfreeze wallet
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created October 30, 2025
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  walletAdminApi,
  formatCurrency,
  formatDate,
  getRelativeTime,
  type AdminWalletDetail,
} from '@/lib/api/admin/wallet-admin-api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Mail,
  Phone,
  Lock,
  Unlock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

// ================================================
// TYPES
// ================================================

export interface AdminWalletDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: AdminWalletDetail | null;
  onRefresh: () => void;
}

// ================================================
// COMPONENT
// ================================================

export const AdminWalletDetailModal: React.FC<AdminWalletDetailModalProps> = ({
  isOpen,
  onClose,
  wallet,
  onRefresh,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdjustBalance, setShowAdjustBalance] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SUBTRACT'>(
    'ADD'
  );
  const [adjustmentReason, setAdjustmentReason] = useState('');

  if (!wallet) return null;

  // ==================== HANDLERS ====================

  const handleAdjustBalance = async () => {
    if (!adjustmentAmount || !adjustmentReason) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    const amount = parseFloat(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Geçerli bir tutar girin');
      return;
    }

    if (adjustmentReason.length < 10) {
      toast.error('Neden en az 10 karakter olmalı');
      return;
    }

    setIsLoading(true);
    try {
      await walletAdminApi.adjustBalance(wallet.user.id, {
        amount,
        type: adjustmentType,
        reason: adjustmentReason,
      });

      toast.success('Bakiye güncellendi');
      setShowAdjustBalance(false);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to adjust balance:', error);
      toast.error('Bakiye güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreezeWallet = async () => {
    const reason = prompt('Dondurma nedeni (minimum 10 karakter):');
    if (!reason || reason.length < 10) {
      toast.error('Geçerli bir neden girin');
      return;
    }

    setIsLoading(true);
    try {
      await walletAdminApi.freezeWallet(wallet.user.id, { reason });
      toast.success('Cüzdan donduruldu');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to freeze wallet:', error);
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfreezeWallet = async () => {
    setIsLoading(true);
    try {
      await walletAdminApi.unfreezeWallet(wallet.user.id);
      toast.success('Cüzdan aktif edildi');
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Failed to unfreeze wallet:', error);
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER ====================

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cüzdan Detayları</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {wallet.user.avatarUrl ? (
                  <img
                    src={wallet.user.avatarUrl}
                    alt={wallet.user.fullName}
                    className="h-16 w-16 rounded-full"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                    <User className="h-8 w-8 text-gray-500" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {wallet.user.fullName}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {wallet.user.email}
                    </span>
                    {wallet.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {wallet.user.phone}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant={wallet.user.verified ? 'success' : 'secondary'}
                    >
                      {wallet.user.verified ? 'Doğrulanmış' : 'Doğrulanmamış'}
                    </Badge>
                    <Badge variant="outline">{wallet.user.role}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {wallet.wallet.status === 'ACTIVE' ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleFreezeWallet}
                    disabled={isLoading}
                  >
                    <Lock className="mr-1 h-4 w-4" />
                    Dondur
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleUnfreezeWallet}
                    disabled={isLoading}
                  >
                    <Unlock className="mr-1 h-4 w-4" />
                    Aktifleştir
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Mevcut Bakiye
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(wallet.wallet.currentBalance)}
                  </p>
                </div>
                <Wallet className="h-10 w-10 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Bekleyen Bakiye
                  </p>
                  <p className="mt-2 text-2xl font-bold text-orange-600">
                    {formatCurrency(wallet.wallet.pendingBalance)}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Toplam Kazanç
                  </p>
                  <p className="mt-2 text-2xl font-bold text-green-600">
                    {formatCurrency(wallet.stats.totalEarned)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600">Tamamlanan Sipariş</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {wallet.stats.completedOrders}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Bekleyen Ödeme</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {wallet.stats.pendingPayouts}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Toplam Ödeme</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatCurrency(wallet.stats.totalPaid)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600">Ortalama İşlem</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {formatCurrency(
                  wallet.stats.completedOrders > 0
                    ? wallet.stats.totalEarned / wallet.stats.completedOrders
                    : 0
                )}
              </p>
            </Card>
          </div>

          {/* Balance Adjustment */}
          {showAdjustBalance ? (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bakiye Düzenleme
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdjustBalance(false)}
                  >
                    İptal
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="adjustmentType">İşlem Tipi</Label>
                    <select
                      id="adjustmentType"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={adjustmentType}
                      onChange={(e) =>
                        setAdjustmentType(e.target.value as 'ADD' | 'SUBTRACT')
                      }
                    >
                      <option value="ADD">Ekle (+)</option>
                      <option value="SUBTRACT">Çıkar (-)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="adjustmentAmount">Tutar (₺)</Label>
                    <Input
                      id="adjustmentAmount"
                      type="number"
                      placeholder="0.00"
                      value={adjustmentAmount}
                      onChange={(e) => setAdjustmentAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adjustmentReason">
                    Neden (minimum 10 karakter)
                  </Label>
                  <textarea
                    id="adjustmentReason"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Bakiye düzenleme nedeni..."
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Bu işlem geri alınamaz ve kayıt altına alınacaktır.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleAdjustBalance} disabled={isLoading}>
                    {isLoading ? 'İşleniyor...' : 'Bakiye Düzenle'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowAdjustBalance(true)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Bakiye Düzenle
              </Button>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="transactions">
            <TabsList>
              <TabsTrigger value="transactions">Son İşlemler</TabsTrigger>
              <TabsTrigger value="payouts">Son Ödemeler</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              {wallet.recentTransactions.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  İşlem bulunamadı
                </Card>
              ) : (
                <div className="space-y-2">
                  {wallet.recentTransactions.map((transaction) => (
                    <Card key={transaction.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {transaction.type === 'CREDIT' ? (
                            <div className="rounded-full bg-green-100 p-2">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="rounded-full bg-red-100 p-2">
                              <TrendingDown className="h-5 w-5 text-red-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              {getRelativeTime(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-semibold ${
                              transaction.type === 'CREDIT'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'CREDIT' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bakiye: {formatCurrency(transaction.balanceAfter)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payouts" className="space-y-4">
              {wallet.recentPayouts.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                  Ödeme bulunamadı
                </Card>
              ) : (
                <div className="space-y-2">
                  {wallet.recentPayouts.map((payout) => (
                    <Card key={payout.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payout.method === 'BANK_TRANSFER'
                              ? 'Banka Havalesi'
                              : payout.method}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(payout.requestedAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatCurrency(payout.amount)}
                          </p>
                          <Badge
                            variant={
                              payout.status === 'COMPLETED'
                                ? 'success'
                                : payout.status === 'PENDING'
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {payout.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminWalletDetailModal;
