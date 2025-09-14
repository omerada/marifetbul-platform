// ================================================
// MEMORY MANAGEMENT AUDIT SYSTEM
// ================================================
// Comprehensive system for detecting and preventing memory leaks
// Audits hooks, stores, WebSocket connections, and event listeners

import { useEffect, useRef, useCallback, useState } from 'react';

// ================================================
// MEMORY LEAK DETECTION TYPES
// ================================================

export interface MemoryLeakReport {
  component: string;
  leakType: MemoryLeakType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  fix: string;
  detectedAt: string;
  stackTrace?: string;
}

export type MemoryLeakType =
  | 'missing-cleanup'
  | 'unclosed-websocket'
  | 'dangling-event-listener'
  | 'uncanceled-timeout'
  | 'uncanceled-interval'
  | 'unclosed-subscription'
  | 'circular-reference'
  | 'large-object-retention'
  | 'infinite-re-render';

export interface CleanupFunction {
  (): void;
}

export interface MemoryMetrics {
  usedHeapSize: number;
  totalHeapSize: number;
  heapSizeLimit: number;
  memoryUsagePercentage: number;
  componentCount: number;
  listenerCount: number;
  timeoutCount: number;
  intervalCount: number;
  websocketCount: number;
}

// ================================================
// MEMORY AUDIT UTILITIES
// ================================================

class MemoryAuditor {
  private static instance: MemoryAuditor;
  private reports: MemoryLeakReport[] = [];
  private isEnabled: boolean = process.env.NODE_ENV === 'development';
  private trackingEnabled: boolean = false;

  // Tracking maps for active resources
  private activeTimeouts = new Map<number, string>();
  private activeIntervals = new Map<number, string>();
  private activeListeners = new Map<
    string,
    { element: EventTarget; type: string; listener: EventListener }
  >();
  private activeWebSockets = new Map<WebSocket, string>();
  private activeSubscriptions = new Map<string, CleanupFunction>();

  static getInstance(): MemoryAuditor {
    if (!MemoryAuditor.instance) {
      MemoryAuditor.instance = new MemoryAuditor();
    }
    return MemoryAuditor.instance;
  }

  enable(): void {
    this.isEnabled = true;
    this.startTracking();
  }

  disable(): void {
    this.isEnabled = false;
    this.stopTracking();
  }

  startTracking(): void {
    if (
      !this.isEnabled ||
      this.trackingEnabled ||
      typeof window === 'undefined'
    )
      return;

    this.trackingEnabled = true;
    this.startMemoryMonitoring();
  }

  stopTracking(): void {
    this.trackingEnabled = false;
    this.reports = [];
    this.activeTimeouts.clear();
    this.activeIntervals.clear();
    this.activeListeners.clear();
    this.activeWebSockets.clear();
    this.activeSubscriptions.clear();
  }

  // ================================================
  // MEMORY MONITORING
  // ================================================

  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      this.checkForMemoryLeaks();
      this.analyzeMemoryUsage();
    }, 10000); // Check every 10 seconds
  }

  private checkForMemoryLeaks(): void {
    // Check for dangling timeouts
    if (this.activeTimeouts.size > 10) {
      this.addReport({
        component: 'Global',
        leakType: 'uncanceled-timeout',
        severity: 'medium',
        description: `${this.activeTimeouts.size} uncanceled timeouts detected`,
        fix: 'Ensure all setTimeout calls are cleared with clearTimeout in useEffect cleanup',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for dangling intervals
    if (this.activeIntervals.size > 5) {
      this.addReport({
        component: 'Global',
        leakType: 'uncanceled-interval',
        severity: 'high',
        description: `${this.activeIntervals.size} uncanceled intervals detected`,
        fix: 'Ensure all setInterval calls are cleared with clearInterval in useEffect cleanup',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for dangling event listeners
    if (this.activeListeners.size > 50) {
      this.addReport({
        component: 'Global',
        leakType: 'dangling-event-listener',
        severity: 'high',
        description: `${this.activeListeners.size} uncleaned event listeners detected`,
        fix: 'Ensure all addEventListener calls have corresponding removeEventListener in cleanup',
        detectedAt: new Date().toISOString(),
      });
    }

    // Check for unclosed WebSockets
    if (this.activeWebSockets.size > 3) {
      this.addReport({
        component: 'Global',
        leakType: 'unclosed-websocket',
        severity: 'critical',
        description: `${this.activeWebSockets.size} unclosed WebSocket connections detected`,
        fix: 'Ensure all WebSocket connections are properly closed in cleanup',
        detectedAt: new Date().toISOString(),
      });
    }
  }

  private analyzeMemoryUsage(): void {
    const metrics = this.getMemoryMetrics();

    if (metrics.memoryUsagePercentage > 80) {
      this.addReport({
        component: 'Global',
        leakType: 'large-object-retention',
        severity: 'critical',
        description: `High memory usage: ${metrics.memoryUsagePercentage.toFixed(1)}%`,
        fix: 'Review component state, large objects, and cached data for potential memory leaks',
        detectedAt: new Date().toISOString(),
      });
    }
  }

  getMemoryMetrics(): MemoryMetrics {
    let memory = { usedHeapSize: 0, totalHeapSize: 0, heapSizeLimit: 0 };

    if (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in performance
    ) {
      memory = (performance as any).memory;
    }

    return {
      usedHeapSize: memory.usedHeapSize,
      totalHeapSize: memory.totalHeapSize,
      heapSizeLimit: memory.heapSizeLimit,
      memoryUsagePercentage:
        memory.heapSizeLimit > 0
          ? (memory.usedHeapSize / memory.heapSizeLimit) * 100
          : 0,
      componentCount: 0, // Would need React DevTools integration
      listenerCount: this.activeListeners.size,
      timeoutCount: this.activeTimeouts.size,
      intervalCount: this.activeIntervals.size,
      websocketCount: this.activeWebSockets.size,
    };
  }

  private getStackTrace(): string {
    return new Error().stack || '';
  }

  addReport(report: MemoryLeakReport): void {
    this.reports.push(report);

    if (process.env.NODE_ENV === 'development') {
      console.warn('Memory leak detected:', report);
    }
  }

  getReports(): MemoryLeakReport[] {
    return [...this.reports];
  }

  clearReports(): void {
    this.reports = [];
  }

  // ================================================
  // RESOURCE TRACKING
  // ================================================

  trackTimeout(timeoutId: number, description: string): void {
    this.activeTimeouts.set(timeoutId, description);
  }

  untrackTimeout(timeoutId: number): void {
    this.activeTimeouts.delete(timeoutId);
  }

  trackInterval(intervalId: number, description: string): void {
    this.activeIntervals.set(intervalId, description);
  }

  untrackInterval(intervalId: number): void {
    this.activeIntervals.delete(intervalId);
  }

  trackEventListener(
    key: string,
    element: EventTarget,
    type: string,
    listener: EventListener
  ): void {
    this.activeListeners.set(key, { element, type, listener });
  }

  untrackEventListener(key: string): void {
    this.activeListeners.delete(key);
  }

  trackWebSocket(ws: WebSocket, url: string): void {
    this.activeWebSockets.set(ws, url);
  }

  untrackWebSocket(ws: WebSocket): void {
    this.activeWebSockets.delete(ws);
  }

  trackSubscription(key: string, cleanup: CleanupFunction): void {
    this.activeSubscriptions.set(key, cleanup);
  }

  untrackSubscription(key: string): void {
    this.activeSubscriptions.delete(key);
  }

  forceCleanupAll(): void {
    // Cleanup all tracked resources
    this.activeTimeouts.forEach((_, timeout) => clearTimeout(timeout));
    this.activeIntervals.forEach((_, interval) => clearInterval(interval));
    this.activeWebSockets.forEach((_, ws) => ws.close());
    this.activeSubscriptions.forEach((cleanup) => cleanup());

    this.activeTimeouts.clear();
    this.activeIntervals.clear();
    this.activeWebSockets.clear();
    this.activeSubscriptions.clear();
  }
}

// ================================================
// MEMORY MANAGEMENT HOOKS
// ================================================

/**
 * Hook for automatic memory leak detection and cleanup
 */
function useMemoryLeakDetection(componentName: string) {
  const auditor = MemoryAuditor.getInstance();
  const cleanupFunctions = useRef<CleanupFunction[]>([]);

  useEffect(() => {
    auditor.enable();

    return () => {
      // Run all cleanup functions
      cleanupFunctions.current.forEach((cleanup) => cleanup());
      cleanupFunctions.current = [];
    };
  }, [auditor]);

  const addCleanup = useCallback((cleanup: CleanupFunction) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  const trackTimeout = useCallback(
    (timeoutId: number, description: string) => {
      auditor.trackTimeout(timeoutId, description);
      addCleanup(() => {
        clearTimeout(timeoutId);
        auditor.untrackTimeout(timeoutId);
      });
    },
    [addCleanup, auditor]
  );

  const trackInterval = useCallback(
    (intervalId: number, description: string) => {
      auditor.trackInterval(intervalId, description);
      addCleanup(() => {
        clearInterval(intervalId);
        auditor.untrackInterval(intervalId);
      });
    },
    [addCleanup, auditor]
  );

  const trackEventListener = useCallback(
    (
      element: EventTarget,
      type: string,
      listener: EventListener,
      options?: boolean | AddEventListenerOptions
    ) => {
      const key = `${componentName}-${type}-${Date.now()}`;
      element.addEventListener(type, listener, options);
      auditor.trackEventListener(key, element, type, listener);
      addCleanup(() => {
        element.removeEventListener(type, listener, options as any);
        auditor.untrackEventListener(key);
      });
    },
    [addCleanup, auditor, componentName]
  );

  const trackWebSocket = useCallback(
    (ws: WebSocket, url: string) => {
      auditor.trackWebSocket(ws, url);
      addCleanup(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
        auditor.untrackWebSocket(ws);
      });
    },
    [addCleanup, auditor]
  );

  const trackSubscription = useCallback(
    (
      unsubscribe: CleanupFunction,
      key: string = `${componentName}-${Date.now()}`
    ) => {
      auditor.trackSubscription(key, unsubscribe);
      addCleanup(() => {
        unsubscribe();
        auditor.untrackSubscription(key);
      });
    },
    [addCleanup, auditor, componentName]
  );

  return {
    addCleanup,
    trackTimeout,
    trackInterval,
    trackEventListener,
    trackWebSocket,
    trackSubscription,
  };
}

/**
 * Hook for safe useEffect with automatic cleanup tracking
 */
function useSafeEffect(
  effect: () => CleanupFunction | void,
  deps: React.DependencyList,
  componentName?: string
) {
  const { addCleanup } = useMemoryLeakDetection(componentName || 'Unknown');

  useEffect(() => {
    const cleanup = effect();
    if (cleanup) {
      addCleanup(cleanup);
    }
  }, deps);
}

/**
 * Hook for safe timeout with automatic cleanup
 */
function useSafeTimeout(callback: () => void, delay: number | null) {
  const { trackTimeout } = useMemoryLeakDetection('useSafeTimeout');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (delay !== null) {
      timeoutRef.current = window.setTimeout(callback, delay);
      trackTimeout(timeoutRef.current, 'useSafeTimeout');
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay, trackTimeout]);
}

/**
 * Hook for safe interval with automatic cleanup
 */
function useSafeInterval(callback: () => void, delay: number | null) {
  const { trackInterval } = useMemoryLeakDetection('useSafeInterval');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (delay !== null) {
      intervalRef.current = window.setInterval(callback, delay);
      trackInterval(intervalRef.current, 'useSafeInterval');
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, delay, trackInterval]);
}

/**
 * Hook for safe event listeners with automatic cleanup
 */
function useSafeEventListener<T extends EventTarget>(
  target: T | null,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) {
  const { trackEventListener } = useMemoryLeakDetection('useSafeEventListener');

  useEffect(() => {
    if (!target) return;

    trackEventListener(target, type, listener, options);
  }, [target, type, listener, options, trackEventListener]);
}

/**
 * Hook for safe WebSocket with automatic cleanup
 */
function useSafeWebSocket(
  url: string,
  options?: {
    onOpen?: (event: Event) => void;
    onMessage?: (event: MessageEvent) => void;
    onError?: (event: Event) => void;
    onClose?: (event: CloseEvent) => void;
  }
) {
  const { trackWebSocket } = useMemoryLeakDetection('useSafeWebSocket');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);

  useEffect(() => {
    const ws = new WebSocket(url);
    setSocket(ws);
    trackWebSocket(ws, url);

    ws.onopen = (event) => {
      setReadyState(ws.readyState);
      options?.onOpen?.(event);
    };

    ws.onmessage = (event) => {
      options?.onMessage?.(event);
    };

    ws.onerror = (event) => {
      setReadyState(ws.readyState);
      options?.onError?.(event);
    };

    ws.onclose = (event) => {
      setReadyState(ws.readyState);
      options?.onClose?.(event);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url, trackWebSocket]);

  const sendMessage = useCallback(
    (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    },
    [socket]
  );

  return {
    socket,
    readyState,
    sendMessage,
  };
}

// ================================================
// STORE MEMORY MANAGEMENT
// ================================================

/**
 * Hook for monitoring store subscription memory leaks
 */
function useStoreMemoryMonitor(storeName: string) {
  const subscriptionCount = useRef(0);
  const maxSubscriptions = 10; // Threshold for warning

  const trackSubscription = useCallback(() => {
    subscriptionCount.current++;

    if (subscriptionCount.current > maxSubscriptions) {
      MemoryAuditor.getInstance().addReport({
        component: storeName,
        leakType: 'unclosed-subscription',
        severity: 'medium',
        description: `Too many subscriptions (${subscriptionCount.current}) for store ${storeName}`,
        fix: 'Check if store subscriptions are properly cleaned up',
        detectedAt: new Date().toISOString(),
      });
    }

    return () => {
      subscriptionCount.current--;
    };
  }, [storeName, maxSubscriptions]);

  return { trackSubscription };
}

// ================================================
// EXPORTS
// ================================================

export const memoryAuditor = MemoryAuditor.getInstance();

export {
  useSafeEffect,
  useSafeTimeout,
  useSafeInterval,
  useSafeEventListener,
  useSafeWebSocket,
  useMemoryLeakDetection,
  useStoreMemoryMonitor,
};

export default MemoryAuditor;
