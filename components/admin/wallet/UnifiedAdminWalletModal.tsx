/**
 * ================================================
 * UNIFIED ADMIN WALLET MODAL
 * ================================================
 * Single, consolidated modal for all admin wallet operations
 *
 * Replaces:
 * - AdminUserWalletModal (domains/admin/payouts)
 * - AdminWalletDetailModal (admin/wallet)
 *
 * Features:
 * - View wallet details and balances
 * - View transaction history
 * - View payout history
 * - Manual balance adjustment
 * - Freeze/unfreeze wallet
 * - User information display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 2 - Modal Consolidation
 */

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  User,
  Mail,
  Lock,
  Unlock,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  X,
} from 'lucide-react';
import {
  payoutAdminApi,
  formatCurrency,
  formatDate,
} from '@/lib/api/admin/payout-admin-api';
import {
  walletAdminApi,
  type AdminWalletDetail,
} from '@/lib/api/admin/wallet-admin-api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  WalletResponse,
  Transaction,
  Payout,
} from '@/types/business/features/wallet';

// ================================================
// TYPES
// ================================================

export interface UnifiedAdminWalletModalProps {
  /**
   * User ID to load wallet for
   * If provided, modal will fetch wallet data
   */
  userId?: string | null;

  /**
   * Pre-loaded wallet detail object
   * If provided, skips initial fetch
   */
  wallet?: AdminWalletDetail | null;

  /**
   * Modal open state
   */
  isOpen: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Callback after data refresh
   */
  onRefresh?: () => void;

  /**
   * Initial tab to show
   */
  initialTab?: 'overview' | 'transactions' | 'payouts' | 'actions';
}

type TabType = 'overview' | 'transactions' | 'payouts' | 'actions';

// ================================================
// COMPONENT
// ================================================

export const UnifiedAdminWalletModal: React.FC<
  UnifiedAdminWalletModalProps
> = ({
  userId: propUserId,
  wallet: propWallet,
  isOpen,
  onClose,
  onRefresh,
  initialTab = 'overview',
}) => {
  // ==================== STATE ====================

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isLoading, setIsLoading] = useState(false);

  // Wallet data
  const [wallet, setWallet] = useState<
    WalletResponse | AdminWalletDetail | null
  >(propWallet || null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);

  // Balance adjustment
  const [showAdjustBalance, setShowAdjustBalance] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'ADD' | 'SUBTRACT'>(
    'ADD'
  );
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (isOpen) {
      if (propWallet) {
        // Use provided wallet object
        setWallet(propWallet);
        setActiveTab(initialTab);
      } else if (propUserId) {
        // Fetch wallet data
        fetchWalletData(propUserId);
      }
    }
  }, [isOpen, propUserId, propWallet, initialTab]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('overview');
      setShowAdjustBalance(false);
      setAdjustmentAmount('');
      setAdjustmentReason('');
    }
  }, [isOpen]);

  // ==================== DATA FETCHING ====================

  const fetchWalletData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [walletData, transactionsData, payoutsData] = await Promise.all([
        payoutAdminApi.getUserWallet(userId),
        payoutAdminApi.getUserTransactions(userId, 0, 10),
        payoutAdminApi.getUserPayouts(userId),
      ]);

      setWallet(walletData);
      setTransactions(transactionsData.content);
      setPayouts(payoutsData);
    } catch (error) {
      logger.error(
        'Failed to fetch wallet data:',
        error instanceof Error ? error : undefined
      );
      toast.error('Cüzdan verileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    const userId = propUserId || (wallet as AdminWalletDetail)?.user?.id;
    if (userId) {
      fetchWalletData(userId);
      onRefresh?.();
    }
  };

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

    const userId = propUserId || (wallet as AdminWalletDetail)?.user?.id;
    if (!userId) {
      toast.error('Kullanıcı ID bulunamadı');
      return;
    }

    setIsLoading(true);
    try {
      await walletAdminApi.adjustBalance(userId, {
        amount,
        type: adjustmentType,
        reason: adjustmentReason,
      });

      toast.success('Bakiye güncellendi');
      setShowAdjustBalance(false);
      setAdjustmentAmount('');
      setAdjustmentReason('');
      refreshData();
    } catch (error) {
      logger.error(
        'Failed to adjust balance:',
        error instanceof Error ? error : undefined
      );
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

    const userId = propUserId || (wallet as AdminWalletDetail)?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      await walletAdminApi.freezeWallet(userId, { reason });
      toast.success('Cüzdan donduruldu');
      refreshData();
    } catch (error) {
      logger.error(
        'Failed to freeze wallet:',
        error instanceof Error ? error : undefined
      );
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfreezeWallet = async () => {
    const userId = propUserId || (wallet as AdminWalletDetail)?.user?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      await walletAdminApi.unfreezeWallet(userId);
      toast.success('Cüzdan aktif edildi');
      refreshData();
    } catch (error) {
      logger.error(
        'Failed to unfreeze wallet:',
        error instanceof Error ? error : undefined
      );
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== RENDER HELPERS ====================

  const getBalance = () => {
    if (!wallet) return { available: 0, pending: 0, total: 0 };

    // Handle both WalletResponse and AdminWalletDetail types
    if ('balance' in wallet && wallet.balance) {
      return {
        available: wallet.balance.availableBalance || 0,
        pending: wallet.balance.pendingBalance || 0,
        total: wallet.balance.totalEarnings || 0,
      };
    }

    return {
      available: (wallet as any).availableBalance || 0,
      pending: (wallet as any).pendingBalance || 0,
      total: (wallet as any).totalEarnings || 0,
    };
  };

  const getWalletStatus = () => {
    if (!wallet) return 'UNKNOWN';
    return (wallet as any).status || 'ACTIVE';
  };

  const getUserInfo = () => {
    if (!wallet) return null;

    // AdminWalletDetail has user object
    if ('user' in wallet && wallet.user) {
      return wallet.user;
    }

    return null;
  };

  // ==================== RENDER ====================

  if (!isOpen) return null;

  const balance = getBalance();
  const status = getWalletStatus();
  const userInfo = getUserInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-xl font-semibold">
                Admin Cüzdan Yönetimi
              </span>
              {propUserId && (
                <p className="mt-1 text-sm font-normal text-gray-600">
                  ID: {propUserId.substring(0, 20)}...
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
              <TabsTrigger value="transactions">
                İşlemler {transactions.length > 0 && `(${transactions.length})`}
              </TabsTrigger>
              <TabsTrigger value="payouts">
                Para Çekme {payouts.length > 0 && `(${payouts.length})`}
              </TabsTrigger>
              <TabsTrigger value="actions">İşlemler</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              {/* Balance Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Kullanılabilir Bakiye
                      </p>
                      <p className="mt-1 text-2xl font-bold text-green-900">
                        {formatCurrency(balance.available)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </Card>

                <Card className="border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Bekleyen Bakiye
                      </p>
                      <p className="mt-1 text-2xl font-bold text-yellow-900">
                        {formatCurrency(balance.pending)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </Card>

                <Card className="border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Toplam Kazanç
                      </p>
                      <p className="mt-1 text-2xl font-bold text-blue-900">
                        {formatCurrency(balance.total)}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </Card>
              </div>

              {/* User Info (if available) */}
              {userInfo && (
                <Card className="p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Kullanıcı Bilgileri
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">İsim</p>
                        <p className="font-medium text-gray-900">
                          {userInfo.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">
                          {userInfo.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Wallet Stats */}
              <Card className="border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Cüzdan Bilgileri
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Durum</p>
                    <p className="mt-1 font-medium text-gray-900">
                      {status === 'ACTIVE' ? '✅ Aktif' : '❌ Pasif'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Para Birimi</p>
                    <p className="mt-1 font-medium text-gray-900">TRY</p>
                  </div>
                  {(wallet as any)?.createdAt && (
                    <div>
                      <p className="text-gray-600">Oluşturulma</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {formatDate((wallet as any).createdAt)}
                      </p>
                    </div>
                  )}
                  {(wallet as any)?.updatedAt && (
                    <div>
                      <p className="text-gray-600">Son Güncelleme</p>
                      <p className="mt-1 font-medium text-gray-900">
                        {formatDate((wallet as any).updatedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions">
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div className="py-12 text-center">
                    <Wallet className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Henüz işlem yok
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.amount > 0
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? (
                            <ArrowDownRight className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.amount > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <Badge
                          variant={
                            (transaction as any).status === 'COMPLETED'
                              ? 'success'
                              : 'warning'
                          }
                        >
                          {(transaction as any).status || 'PENDING'}
                        </Badge>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Payouts Tab */}
            <TabsContent value="payouts">
              <div className="space-y-2">
                {payouts.length === 0 ? (
                  <div className="py-12 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                      Henüz para çekme talebi yok
                    </p>
                  </div>
                ) : (
                  payouts.map((payout) => (
                    <Card
                      key={payout.id}
                      className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                          <TrendingDown className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Para Çekme Talebi #{payout.id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(
                              (payout as any).createdAt ||
                                new Date().toISOString()
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-blue-600">
                          {formatCurrency(payout.amount)}
                        </p>
                        <StatusBadge
                          type="PAYOUT"
                          status={payout.status as any}
                          size="sm"
                          showIcon
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Actions Tab */}
            <TabsContent value="actions" className="space-y-4">
              {/* Balance Adjustment */}
              <Card className="p-4">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <DollarSign className="h-5 w-5" />
                  Bakiye Ayarlama
                </h3>

                {!showAdjustBalance ? (
                  <Button
                    onClick={() => setShowAdjustBalance(true)}
                    variant="outline"
                    fullWidth
                  >
                    Bakiye Ayarla
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adjustment-type">İşlem Tipi</Label>
                        <select
                          id="adjustment-type"
                          value={adjustmentType}
                          onChange={(e) =>
                            setAdjustmentType(
                              e.target.value as 'ADD' | 'SUBTRACT'
                            )
                          }
                          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                          <option value="ADD">Ekle (+)</option>
                          <option value="SUBTRACT">Çıkar (-)</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="adjustment-amount">Tutar</Label>
                        <Input
                          id="adjustment-amount"
                          type="number"
                          value={adjustmentAmount}
                          onChange={(e) => setAdjustmentAmount(e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="adjustment-reason">
                        Neden (min 10 karakter)
                      </Label>
                      <Input
                        id="adjustment-reason"
                        value={adjustmentReason}
                        onChange={(e) => setAdjustmentReason(e.target.value)}
                        placeholder="Bakiye ayarlama nedeni..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleAdjustBalance} loading={isLoading}>
                        Bakiye Güncelle
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAdjustBalance(false);
                          setAdjustmentAmount('');
                          setAdjustmentReason('');
                        }}
                        variant="outline"
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Freeze/Unfreeze Wallet */}
              <Card className="p-4">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  {status === 'FROZEN' ? (
                    <Unlock className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                  Cüzdan Durumu
                </h3>

                {status === 'FROZEN' ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <p className="text-sm text-red-800">
                        Bu cüzdan dondurulmuş durumda
                      </p>
                    </div>
                    <Button
                      onClick={handleUnfreezeWallet}
                      loading={isLoading}
                      variant="outline"
                      fullWidth
                    >
                      <Unlock className="mr-2 h-4 w-4" />
                      Cüzdanı Aktif Et
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleFreezeWallet}
                    loading={isLoading}
                    variant="destructive"
                    fullWidth
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Cüzdanı Dondur
                  </Button>
                )}
              </Card>

              {/* Refresh Data */}
              <Card className="p-4">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Veri Yenileme
                </h3>
                <Button
                  onClick={refreshData}
                  loading={isLoading}
                  variant="outline"
                  fullWidth
                >
                  Verileri Yenile
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <div className="grid grid-cols-3 gap-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
    <Skeleton className="h-48" />
  </div>
);

// ================================================
// EXPORTS
// ================================================

UnifiedAdminWalletModal.displayName = 'UnifiedAdminWalletModal';

export default UnifiedAdminWalletModal;
