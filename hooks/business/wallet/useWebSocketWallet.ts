/**
 * ================================================
 * USE WEBSOCKET WALLET HOOK
 * ================================================
 * Real-time wallet updates via WebSocket connection
 *
 * Features:
 * - Auto-connect/disconnect WebSocket
 * - Real-time balance updates
 * - Real-time transaction notifications
 * - Connection state management
 * - Automatic reconnection
 * - Toast notifications for updates
 *
 * Sprint 1 - Epic 1.1 - Day 3
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { WebSocketManager } from '@/lib/infrastructure/services/websocket';
import { logger } from '@/lib/shared/utils/logger';
import { formatCurrency } from '@/lib/shared/utils/format';
import type {
  WalletBalance,
  Transaction,
  Wallet,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface WebSocketWalletMessage {
  type:
    | 'WALLET_UPDATE'
    | 'BALANCE_UPDATE'
    | 'NEW_TRANSACTION'
    | 'TRANSACTION_UPDATE';
  data: WalletUpdateData | BalanceUpdateData | TransactionUpdateData;
  timestamp: number;
}

export interface WalletUpdateData {
  wallet: Wallet;
}

export interface BalanceUpdateData {
  balance: WalletBalance;
}

export interface TransactionUpdateData {
  transaction: Transaction;
  isNew: boolean;
}

export interface UseWebSocketWalletOptions {
  /** User ID for WebSocket connection */
  userId?: string;

  /** Enable toast notifications */
  enableNotifications?: boolean;

  /** Auto-connect on mount */
  autoConnect?: boolean;

  /** WebSocket URL override */
  wsUrl?: string;

  /** Callback when wallet updates */
  onWalletUpdate?: (wallet: Wallet) => void;

  /** Callback when balance updates */
  onBalanceUpdate?: (balance: WalletBalance) => void;

  /** Callback when new transaction */
  onNewTransaction?: (transaction: Transaction) => void;

  /** Callback when connection state changes */
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseWebSocketWalletReturn {
  /** Connection state */
  isConnected: boolean;

  /** Connecting state */
  isConnecting: boolean;

  /** Connection error */
  error: Error | null;

  /** Latest wallet data from WebSocket */
  walletData: Wallet | null;

  /** Latest balance data from WebSocket */
  balanceData: WalletBalance | null;

  /** Latest transaction from WebSocket */
  latestTransaction: Transaction | null;

  /** Manual connect */
  connect: () => Promise<void>;

  /** Manual disconnect */
  disconnect: () => void;

  /** Reconnect */
  reconnect: () => Promise<void>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get WebSocket URL for wallet connection
 */
function getWalletWebSocketUrl(userId: string, customUrl?: string): string {
  if (customUrl) return customUrl;

  const baseUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
  return `${baseUrl}/ws/wallet/${userId}`;
}

/**
 * Show toast notification for transaction
 */
function showTransactionNotification(transaction: Transaction, isNew: boolean) {
  const isCredit =
    transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';
  const amount = formatCurrency(transaction.amount, transaction.currency);

  const typeLabels: Record<string, string> = {
    CREDIT: 'Ödeme Alındı',
    DEBIT: 'Ödeme Gönderildi',
    ESCROW_HOLD: 'Escrow Beklemede',
    ESCROW_RELEASE: 'Escrow Serbest',
    PAYOUT: 'Para Çekim',
    REFUND: 'İade',
    FEE: 'Komisyon',
  };

  const title = typeLabels[transaction.type] || 'Yeni İşlem';
  const message = transaction.description || `${isCredit ? '+' : '-'}${amount}`;

  if (isNew) {
    if (isCredit) {
      toast.success(title, {
        description: message,
        duration: 5000,
      });
    } else {
      toast.info(title, {
        description: message,
        duration: 4000,
      });
    }
  }
}

/**
 * Show toast notification for balance update
 */
function showBalanceNotification(balance: WalletBalance) {
  const available = formatCurrency(balance.availableBalance, balance.currency);

  toast.info('Bakiye Güncellendi', {
    description: `Kullanılabilir: ${available}`,
    duration: 3000,
  });
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * useWebSocketWallet Hook
 *
 * Manages real-time wallet updates via WebSocket
 *
 * @example
 * ```tsx
 * function WalletDashboard() {
 *   const { isConnected, balanceData, latestTransaction } = useWebSocketWallet({
 *     userId: user.id,
 *     enableNotifications: true,
 *     onBalanceUpdate: (balance) => {
 *       console.log('Balance updated:', balance);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
 *       {balanceData && <p>Balance: {balanceData.availableBalance}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebSocketWallet(
  options: UseWebSocketWalletOptions = {}
): UseWebSocketWalletReturn {
  const {
    userId,
    enableNotifications = true,
    autoConnect = true,
    wsUrl,
    onWalletUpdate,
    onBalanceUpdate,
    onNewTransaction,
    onConnectionChange,
  } = options;

  // ========================================================================
  // STATE
  // ========================================================================

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [balanceData, setBalanceData] = useState<WalletBalance | null>(null);
  const [latestTransaction, setLatestTransaction] =
    useState<Transaction | null>(null);

  // ========================================================================
  // REFS
  // ========================================================================

  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const isCleaningUpRef = useRef(false);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  /**
   * Handle wallet update message
   */
  const handleWalletUpdate = useCallback(
    (data: unknown) => {
      try {
        const updateData = data as WalletUpdateData;

        setWalletData(updateData.wallet);

        if (onWalletUpdate) {
          onWalletUpdate(updateData.wallet);
        }

        logger.info('Wallet updated via WebSocket', {
          walletId: updateData.wallet.id,
        });
      } catch (err) {
        logger.error(
          'Failed to handle wallet update',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    },
    [onWalletUpdate]
  );

  /**
   * Handle balance update message
   */
  const handleBalanceUpdate = useCallback(
    (data: unknown) => {
      try {
        const updateData = data as BalanceUpdateData;

        setBalanceData(updateData.balance);

        if (onBalanceUpdate) {
          onBalanceUpdate(updateData.balance);
        }

        if (enableNotifications) {
          showBalanceNotification(updateData.balance);
        }

        logger.info('Balance updated via WebSocket', {
          balance: updateData.balance.availableBalance,
        });
      } catch (err) {
        logger.error(
          'Failed to handle balance update',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    },
    [enableNotifications, onBalanceUpdate]
  );

  /**
   * Handle new transaction message
   */
  const handleNewTransaction = useCallback(
    (data: unknown) => {
      try {
        const updateData = data as TransactionUpdateData;

        setLatestTransaction(updateData.transaction);

        if (onNewTransaction && updateData.isNew) {
          onNewTransaction(updateData.transaction);
        }

        if (enableNotifications) {
          showTransactionNotification(updateData.transaction, updateData.isNew);
        }

        logger.info('Transaction update via WebSocket', {
          transactionId: updateData.transaction.id,
          isNew: updateData.isNew,
        });
      } catch (err) {
        logger.error(
          'Failed to handle transaction update',
          err instanceof Error ? err : new Error(String(err))
        );
      }
    },
    [enableNotifications, onNewTransaction]
  );

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(async () => {
    if (!userId) {
      const error = new Error('User ID is required for WebSocket connection');
      setError(error);
      logger.warn('WebSocket connection skipped: no user ID');
      return;
    }

    if (wsManagerRef.current || isConnecting) {
      logger.warn('WebSocket already connecting or connected');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const url = getWalletWebSocketUrl(userId, wsUrl);

      wsManagerRef.current = WebSocketManager.getInstance({ url });

      // Register event handlers
      wsManagerRef.current.on('WALLET_UPDATE', handleWalletUpdate);
      wsManagerRef.current.on('BALANCE_UPDATE', handleBalanceUpdate);
      wsManagerRef.current.on('NEW_TRANSACTION', handleNewTransaction);
      wsManagerRef.current.on('TRANSACTION_UPDATE', handleNewTransaction);

      await wsManagerRef.current.connect();

      setIsConnected(true);
      setIsConnecting(false);

      if (onConnectionChange) {
        onConnectionChange(true);
      }

      logger.info('WebSocket connected successfully', { userId });
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('WebSocket connection failed');
      setError(error);
      setIsConnected(false);
      setIsConnecting(false);

      if (onConnectionChange) {
        onConnectionChange(false);
      }

      logger.error('WebSocket connection failed', error);
    }
  }, [
    userId,
    wsUrl,
    isConnecting,
    handleWalletUpdate,
    handleBalanceUpdate,
    handleNewTransaction,
    onConnectionChange,
  ]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (!wsManagerRef.current) return;

    try {
      // Unregister event handlers
      wsManagerRef.current.off('WALLET_UPDATE', handleWalletUpdate);
      wsManagerRef.current.off('BALANCE_UPDATE', handleBalanceUpdate);
      wsManagerRef.current.off('NEW_TRANSACTION', handleNewTransaction);
      wsManagerRef.current.off('TRANSACTION_UPDATE', handleNewTransaction);

      wsManagerRef.current.disconnect();
      wsManagerRef.current = null;

      setIsConnected(false);
      setIsConnecting(false);

      if (onConnectionChange && !isCleaningUpRef.current) {
        onConnectionChange(false);
      }

      logger.info('WebSocket disconnected');
    } catch (err) {
      logger.error(
        'Error disconnecting WebSocket',
        err instanceof Error ? err : new Error(String(err))
      );
    }
  }, [
    handleWalletUpdate,
    handleBalanceUpdate,
    handleNewTransaction,
    onConnectionChange,
  ]);

  /**
   * Reconnect WebSocket
   */
  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s before reconnecting
    await connect();
  }, [connect, disconnect]);

  // ========================================================================
  // EFFECTS
  // ========================================================================

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect && userId) {
      connect();
    }

    return () => {
      isCleaningUpRef.current = true;
      disconnect();
    };
  }, [autoConnect, userId, connect, disconnect]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    isConnected,
    isConnecting,
    error,
    walletData,
    balanceData,
    latestTransaction,
    connect,
    disconnect,
    reconnect,
  };
}

export default useWebSocketWallet;
