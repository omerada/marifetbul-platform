/**
 * ================================================
 * BALANCE CARD COMPONENT
 * ================================================
 * Display wallet balance with visual indicators
 *
 * Features:
 * - Available, Pending, Escrow balances
 * - Animated number transitions
 * - Quick actions
 * - Currency formatting
 * - Responsive design
 *
 * Sprint 1 - Epic 1.1 - Day 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/formatters';

// ============================================================================
// TYPES
// ============================================================================

export interface BalanceCardProps {
  /** Available balance (can be withdrawn) */
  availableBalance: number;

  /** Pending balance (in escrow) */
  pendingBalance: number;

  /** Total earnings */
  totalEarnings: number;

  /** Total payouts */
  totalPayouts: number;

  /** Currency code */
  currency?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Refresh callback */
  onRefresh?: () => void;

  /** Withdraw callback */
  onWithdraw?: () => void;

  /** View transactions callback */
  onViewTransactions?: () => void;

  /** Additional CSS classes */
  className?: string;
}

interface BalanceItemProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  currency: string;
  color: string;
  delay?: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Individual balance item with animation
 */
function BalanceItem({
  icon,
  label,
  amount,
  currency,
  color,
  delay = 0,
}: BalanceItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
    >
      <div className="flex items-center space-x-3">
        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <motion.p
            key={amount}
            initial={{ scale: 1.2, color: '#3b82f6' }}
            animate={{ scale: 1, color: '#111827' }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-900"
          >
            {formatCurrency(amount, currency)}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Earnings summary card
 */
function EarningsSummary({
  totalEarnings,
  totalPayouts,
  currency,
}: {
  totalEarnings: number;
  totalPayouts: number;
  currency: string;
}) {
  const netEarnings = totalEarnings - totalPayouts;
  const isPositive = netEarnings >= 0;

  return (
    <div className="mt-6 grid grid-cols-2 gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="flex items-center space-x-2">
        <ArrowUpRight className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-xs text-gray-600">Toplam Kazanç</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalEarnings, currency)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ArrowDownLeft className="h-5 w-5 text-red-600" />
        <div>
          <p className="text-xs text-gray-600">Toplam Çekim</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalPayouts, currency)}
          </p>
        </div>
      </div>

      <div className="col-span-2 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-600">Net Kazanç</p>
          <div className="flex items-center space-x-2">
            {isPositive ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <p
              className={`text-xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(netEarnings, currency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BalanceCard Component
 *
 * Displays wallet balance with detailed breakdown and quick actions
 *
 * @example
 * ```tsx
 * <BalanceCard
 *   availableBalance={1500.50}
 *   pendingBalance={500.00}
 *   totalEarnings={5000.00}
 *   totalPayouts={3000.00}
 *   currency="TRY"
 *   onWithdraw={() => handleWithdraw()}
 *   onViewTransactions={() => router.push('/wallet/transactions')}
 * />
 * ```
 */
export function BalanceCard({
  availableBalance,
  pendingBalance,
  totalEarnings,
  totalPayouts,
  currency = 'TRY',
  isLoading = false,
  onRefresh,
  onWithdraw,
  onViewTransactions,
  className = '',
}: BalanceCardProps) {
  // Calculate total balance
  const totalBalance = availableBalance + pendingBalance;

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-6 w-6" />
            <span>Cüzdan Bakiyesi</span>
          </CardTitle>

          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="text-white hover:bg-white/20"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                🔄
              </motion.div>
            </Button>
          )}
        </div>

        {/* Total Balance */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-4"
        >
          <p className="text-sm text-blue-100">Toplam Bakiye</p>
          <motion.p
            key={totalBalance}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-1 text-4xl font-bold"
          >
            {formatCurrency(totalBalance, currency)}
          </motion.p>
        </motion.div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        {/* Available Balance */}
        <BalanceItem
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Kullanılabilir Bakiye"
          amount={availableBalance}
          currency={currency}
          color="bg-green-100"
          delay={0.1}
        />

        {/* Pending Balance */}
        <BalanceItem
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          label="Beklemede (Escrow)"
          amount={pendingBalance}
          currency={currency}
          color="bg-yellow-100"
          delay={0.2}
        />

        {/* Earnings Summary */}
        <EarningsSummary
          totalEarnings={totalEarnings}
          totalPayouts={totalPayouts}
          currency={currency}
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 border-t border-gray-200 pt-4">
          {onWithdraw && (
            <Button
              variant="primary"
              onClick={onWithdraw}
              disabled={availableBalance <= 0}
              className="w-full"
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Para Çek
            </Button>
          )}

          {onViewTransactions && (
            <Button
              variant="outline"
              onClick={onViewTransactions}
              className="w-full"
            >
              İşlem Geçmişi
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default BalanceCard;
