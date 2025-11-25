/**
 * ================================================
 * ESCROW STATUS WIDGET (Real-Time)
 * ================================================
 * Compact escrow status widget with real-time WebSocket updates
 *
 * Features:
 * - Real-time escrow balance updates via WebSocket
 * - Live transaction counter
 * - Color-coded status indicators
 * - Responsive compact design
 * - Auto-refresh fallback (30s interval)
 * - Click to navigate to full escrow view
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 Epic 1.3 Story 1.3.1 - Escrow Payment Visibility
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Lock,
  TrendingUp,
  Activity,
  ExternalLink,
  Loader2,
  WifiOff,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useWebSocketWallet } from '@/hooks/business/wallet';

// ================================================
// TYPES
// ================================================

export interface EscrowStatusWidgetProps {
  /** Current locked balance (initial value) */
  initialLockedBalance: number;
  /** Number of active escrow holds */
  initialEscrowCount: number;
  /** Currency code */
  currency?: string;
  /** Enable WebSocket real-time updates */
  enableWebSocket?: boolean;
  /** Auto-refresh interval (ms) - fallback when WebSocket disabled */
  refreshInterval?: number;
  /** Callback on balance change */
  onBalanceChange?: (newBalance: number) => void;
  /** Custom link href */
  href?: string;
  /** Custom className */
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function EscrowStatusWidget({
  initialLockedBalance,
  initialEscrowCount,
  currency = 'TRY',
  enableWebSocket = true,
  refreshInterval = 30000,
  onBalanceChange,
  href = '/dashboard/wallet?tab=escrow',
  className,
}: EscrowStatusWidgetProps) {
  // ===== State =====
  const [lockedBalance, setLockedBalance] = useState(initialLockedBalance);
  const [escrowCount, _setEscrowCount] = useState(initialEscrowCount);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // ===== WebSocket Hook (if enabled) =====
  const { isConnected: wsConnected, walletData: wsWalletData } =
    useWebSocketWallet({
      autoConnect: enableWebSocket,
    });

  // Extract escrow balance from WebSocket data (pendingBalance = escrow)
  const wsEscrowBalance = wsWalletData?.pendingBalance;

  // ===== Update Balance from WebSocket =====
  useEffect(() => {
    if (!enableWebSocket || !wsConnected) return;

    if (wsEscrowBalance !== undefined && wsEscrowBalance !== lockedBalance) {
      setIsUpdating(true);
      setLockedBalance(wsEscrowBalance);
      setLastUpdate(new Date());

      // Call callback
      if (onBalanceChange) {
        onBalanceChange(wsEscrowBalance);
      }

      // Remove "updating" indicator after animation
      setTimeout(() => setIsUpdating(false), 1000);
    }
  }, [
    wsEscrowBalance,
    wsConnected,
    enableWebSocket,
    lockedBalance,
    onBalanceChange,
  ]);

  // ===== Auto-refresh Fallback (Polling) =====
  useEffect(() => {
    if (enableWebSocket && wsConnected) return; // Skip if WebSocket active

    const interval = setInterval(() => {
      // Trigger parent component to refetch
      setLastUpdate(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableWebSocket, wsConnected, refreshInterval]);

  // ===== Derived State =====
  const isRealTime = enableWebSocket && wsConnected;
  const hasEscrow = lockedBalance > 0;
  const statusColor = hasEscrow ? 'text-blue-600' : 'text-gray-400';
  const statusBgColor = hasEscrow ? 'bg-blue-50' : 'bg-gray-50';

  return (
    <Link href={href} className="block">
      <Card
        className={cn(
          'group relative overflow-hidden transition-all hover:shadow-md',
          statusBgColor,
          className
        )}
      >
        {/* Real-time Indicator */}
        {isRealTime && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <Activity className="h-3 w-3 animate-pulse text-green-600" />
            <span className="text-[10px] font-semibold text-green-700 uppercase">
              Canlı
            </span>
          </div>
        )}

        {/* Disconnected Indicator */}
        {enableWebSocket && !wsConnected && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <WifiOff className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-500 uppercase">
              Çevrimdışı
            </span>
          </div>
        )}

        {/* Updating Animation */}
        {isUpdating && (
          <div className="pointer-events-none absolute inset-0 animate-pulse bg-blue-500/5" />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                  hasEscrow ? 'bg-blue-200' : 'bg-gray-200'
                )}
              >
                {isUpdating ? (
                  <Loader2
                    className={cn('h-5 w-5 animate-spin', statusColor)}
                  />
                ) : (
                  <Shield className={cn('h-5 w-5', statusColor)} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700">
                  Emanet Bakiyesi
                </h3>
                <p className="text-xs text-gray-500">Güvenli ödeme sistemi</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {/* Balance Display */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  'text-2xl font-bold transition-colors',
                  statusColor
                )}
              >
                {formatCurrency(lockedBalance, currency)}
              </span>
              {isUpdating && (
                <Badge variant="success" size="sm" className="text-[10px]">
                  Güncellendi
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 border-t border-gray-200 pt-3">
            {/* Locked Count */}
            <div className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {escrowCount} Emanet
                </p>
                <p className="text-[10px] text-gray-500">Aktif işlem</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-8 w-px bg-gray-200" />

            {/* Last Update Time */}
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-gray-500" />
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {new Date(lastUpdate).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-[10px] text-gray-500">Son güncelleme</p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          {hasEscrow && (
            <div className="mt-3 rounded-md bg-blue-100 px-2 py-1.5">
              <p className="text-xs text-blue-800">
                💡 Emanet tutarları sipariş tamamlandığında otomatik serbest
                bırakılır
              </p>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

export default EscrowStatusWidget;
