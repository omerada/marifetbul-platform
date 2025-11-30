/**
 * NetworkStatusIndicator Component
 *
 * Visual indicator for network connectivity status.
 * Shows offline/slow/online states with appropriate styling.
 *
 * @module components/shared/dashboard
 */

'use client';

import { useNetworkStatus } from '@/lib/shared/utils/networkStatus';
import { WifiOff, Wifi, WifiLow } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui';

export interface NetworkStatusIndicatorProps {
  /** Show as compact badge instead of full alert */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * NetworkStatusIndicator
 *
 * Displays current network connectivity status:
 * - Online: Green badge/alert (auto-hides in compact mode)
 * - Slow: Yellow warning
 * - Offline: Red error message
 */
export function NetworkStatusIndicator({
  compact = false,
  className = '',
}: NetworkStatusIndicatorProps) {
  const { isOnline, isOffline, isSlow } = useNetworkStatus();

  // Don't show anything if online and compact mode
  if (compact && isOnline && !isSlow) {
    return null;
  }

  // Compact badge mode
  if (compact) {
    return (
      <div
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          isOffline
            ? 'bg-red-100 text-red-700'
            : isSlow
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-green-100 text-green-700'
        } ${className}`}
      >
        {isOffline ? (
          <WifiOff className="h-3.5 w-3.5" />
        ) : isSlow ? (
          <WifiLow className="h-3.5 w-3.5" />
        ) : (
          <Wifi className="h-3.5 w-3.5" />
        )}
        <span>
          {isOffline ? 'Çevrimdışı' : isSlow ? 'Yavaş Bağlantı' : 'Çevrimiçi'}
        </span>
      </div>
    );
  }

  // Full alert mode (only show if not online)
  if (isOnline && !isSlow) {
    return null;
  }

  return (
    <Alert
      variant={isOffline ? 'destructive' : 'default'}
      className={`${
        isSlow ? 'border-yellow-300 bg-yellow-50' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        {isOffline ? (
          <WifiOff className="h-5 w-5" />
        ) : isSlow ? (
          <WifiLow className="h-5 w-5 text-yellow-600" />
        ) : (
          <Wifi className="h-5 w-5" />
        )}
        <AlertDescription>
          {isOffline ? (
            <div>
              <p className="font-semibold">İnternet Bağlantısı Yok</p>
              <p className="mt-1 text-sm">
                Veriler güncellenmeyecek. Lütfen bağlantınızı kontrol edin.
              </p>
            </div>
          ) : isSlow ? (
            <div>
              <p className="font-semibold text-yellow-700">Yavaş Bağlantı</p>
              <p className="mt-1 text-sm text-yellow-600">
                Veriler yavaş yüklenebilir. Güncelleme sıklığı azaltıldı.
              </p>
            </div>
          ) : (
            <p>Bağlantı kuruldu</p>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
