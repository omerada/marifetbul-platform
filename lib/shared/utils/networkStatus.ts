/**
 * ================================================
 * NETWORK STATUS UTILITY
 * ================================================
 * Provides network connectivity detection and monitoring
 * Used for offline detection and graceful degradation
 *
 * @module lib/shared/utils/networkStatus
 * @since Sprint 1 - Story 5
 */

import { useState, useEffect } from 'react';

/**
 * Network status type
 */
export type NetworkStatus = 'online' | 'offline' | 'slow' | 'unknown';

/**
 * Network change listener callback
 */
export type NetworkChangeListener = (status: NetworkStatus) => void;

/**
 * Network info interface
 */
export interface NetworkInfo {
  status: NetworkStatus;
  isOnline: boolean;
  isOffline: boolean;
  isSlow: boolean;
  effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
  downlink?: number; // Mbps
  rtt?: number; // Round-trip time in ms
  saveData?: boolean; // Data saver mode
}

/**
 * Network Status Manager Class
 */
class NetworkStatusManager {
  private listeners: Set<NetworkChangeListener> = new Set();
  private currentStatus: NetworkStatus = 'unknown';

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize network monitoring
   */
  private initialize() {
    // Set initial status
    this.currentStatus = this.detectStatus();

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Listen for connection change (if supported)
    const connection = this.getConnection();
    if (connection?.addEventListener) {
      connection.addEventListener('change', this.handleConnectionChange);
    }
  }

  /**
   * Get network connection object (if supported)
   */
  private getConnection(): {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
    addEventListener?: (event: string, handler: () => void) => void;
    removeEventListener?: (event: string, handler: () => void) => void;
  } | null {
    if (typeof navigator === 'undefined') return null;

    return (
      (navigator as never)['connection'] ||
      (navigator as never)['mozConnection'] ||
      (navigator as never)['webkitConnection']
    );
  }

  /**
   * Detect current network status
   */
  private detectStatus(): NetworkStatus {
    if (typeof navigator === 'undefined') {
      return 'unknown';
    }

    if (!navigator.onLine) {
      return 'offline';
    }

    const connection = this.getConnection();
    if (connection) {
      const effectiveType = (connection as { effectiveType?: string })
        .effectiveType;

      // Consider '2g' and 'slow-2g' as slow
      if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        return 'slow';
      }

      // Consider high RTT (> 300ms) as slow
      const rtt = (connection as { rtt?: number }).rtt;
      if (rtt && rtt > 300) {
        return 'slow';
      }
    }

    return 'online';
  }

  /**
   * Handle online event
   */
  private handleOnline = () => {
    const newStatus = this.detectStatus();
    if (newStatus !== this.currentStatus) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);
    }
  };

  /**
   * Handle offline event
   */
  private handleOffline = () => {
    this.currentStatus = 'offline';
    this.notifyListeners('offline');
  };

  /**
   * Handle connection change
   */
  private handleConnectionChange = () => {
    const newStatus = this.detectStatus();
    if (newStatus !== this.currentStatus) {
      this.currentStatus = newStatus;
      this.notifyListeners(newStatus);
    }
  };

  /**
   * Notify all listeners
   */
  private notifyListeners(status: NetworkStatus) {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.currentStatus;
  }

  /**
   * Get detailed network info
   */
  getNetworkInfo(): NetworkInfo {
    const status = this.detectStatus();
    const connection = this.getConnection();

    return {
      status,
      isOnline: status === 'online' || status === 'slow',
      isOffline: status === 'offline',
      isSlow: status === 'slow',
      effectiveType: connection
        ? (connection as { effectiveType?: string }).effectiveType
        : undefined,
      downlink: connection
        ? (connection as { downlink?: number }).downlink
        : undefined,
      rtt: connection ? (connection as { rtt?: number }).rtt : undefined,
      saveData: connection
        ? (connection as { saveData?: boolean }).saveData
        : undefined,
    };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    const status = this.detectStatus();
    return status === 'online' || status === 'slow';
  }

  /**
   * Check if offline
   */
  isOffline(): boolean {
    return this.detectStatus() === 'offline';
  }

  /**
   * Check if connection is slow
   */
  isSlow(): boolean {
    return this.detectStatus() === 'slow';
  }

  /**
   * Subscribe to network status changes
   */
  subscribe(listener: NetworkChangeListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Unsubscribe from network status changes
   */
  unsubscribe(listener: NetworkChangeListener) {
    this.listeners.delete(listener);
  }

  /**
   * Cleanup and remove event listeners
   */
  cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);

      const connection = this.getConnection();
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', this.handleConnectionChange);
      }
    }

    this.listeners.clear();
  }
}

// Create singleton instance
export const networkStatus = new NetworkStatusManager();

/**
 * React hook for network status
 * @example
 * ```tsx
 * const { isOnline, isOffline, status } = useNetworkStatus();
 * ```
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>(
    typeof window !== 'undefined' ? networkStatus.getStatus() : 'unknown'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = networkStatus.subscribe(setStatus);
    return unsubscribe;
  }, []);

  return {
    status,
    isOnline: status === 'online' || status === 'slow',
    isOffline: status === 'offline',
    isSlow: status === 'slow',
  };
}

// For non-React usage
export { networkStatus as default };
