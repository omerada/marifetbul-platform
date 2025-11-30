'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  Zap,
  HardDrive,
  Wifi,
  Monitor,
  Smartphone,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Browser API type extensions
interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface ExtendedNavigator extends Navigator {
  connection?: {
    type: string;
    downlink: number;
    rtt: number;
    effectiveType: string;
  };
  deviceMemory?: number;
}

// Performance metrics types
interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  bundleSize: {
    js: number;
    css: number;
    images: number;
    total: number;
  };
  memoryUsage: {
    used: number;
    total: number;
    limit: number;
  };
  networkInfo: {
    type: string;
    downlink: number;
    rtt: number;
    effectiveType: string;
  };
  deviceInfo: {
    deviceMemory: number;
    hardwareConcurrency: number;
    platform: string;
    userAgent: string;
  };
  renderMetrics: {
    fps: number;
    frameDrops: number;
    totalFrames: number;
  };
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  // Get Core Web Vitals
  const getCoreWebVitals = useCallback((): CoreWebVitals => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    const FCP =
      paint.find((entry) => entry.name === 'first-contentful-paint')
        ?.startTime || 0;
    const LCP = 0; // Would need web-vitals library for accurate LCP
    const FID = 0; // Would need user interaction measurement
    const CLS = 0; // Would need layout shift measurement
    const TTFB = navigation.responseStart - navigation.requestStart;

    return {
      LCP,
      FID,
      CLS,
      FCP,
      TTFB,
    };
  }, []);

  // Get bundle size information
  const getBundleSize = useCallback(() => {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];

    let js = 0,
      css = 0,
      images = 0;

    resources.forEach((resource) => {
      const size = resource.transferSize || 0;
      const url = resource.name;

      if (url.includes('.js')) {
        js += size;
      } else if (url.includes('.css')) {
        css += size;
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        images += size;
      }
    });

    return {
      js,
      css,
      images,
      total: js + css + images,
    };
  }, []);

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as ExtendedPerformance).memory;
      if (memory) {
        return {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
        };
      }
    }

    return {
      used: 0,
      total: 0,
      limit: 0,
    };
  }, []);

  // Get network information
  const getNetworkInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as ExtendedNavigator).connection;
      if (connection) {
        return {
          type: connection.type || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          effectiveType: connection.effectiveType || 'unknown',
        };
      }
    }

    return {
      type: 'unknown',
      downlink: 0,
      rtt: 0,
      effectiveType: 'unknown',
    };
  }, []);

  // Get device information
  const getDeviceInfo = useCallback(() => {
    const extendedNavigator = navigator as ExtendedNavigator;
    return {
      deviceMemory: extendedNavigator.deviceMemory || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };
  }, []);

  // Monitor FPS
  const updateFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastFrameTimeRef.current >= 1000) {
      const fps = Math.round(
        (frameCountRef.current * 1000) / (now - lastFrameTimeRef.current)
      );
      lastFrameTimeRef.current = now;
      frameCountRef.current = 0;
      return fps;
    }

    return 0;
  }, []);

  // Collect all metrics
  const collectMetrics = useCallback(() => {
    const coreWebVitals = getCoreWebVitals();
    const bundleSize = getBundleSize();
    const memoryUsage = getMemoryUsage();
    const networkInfo = getNetworkInfo();
    const deviceInfo = getDeviceInfo();
    const fps = updateFPS();

    const newMetrics: PerformanceMetrics = {
      coreWebVitals,
      bundleSize,
      memoryUsage,
      networkInfo,
      deviceInfo,
      renderMetrics: {
        fps,
        frameDrops: 0,
        totalFrames: frameCountRef.current,
      },
    };

    setMetrics(newMetrics);
    setLastUpdate(new Date());
  }, [
    getCoreWebVitals,
    getBundleSize,
    getMemoryUsage,
    getNetworkInfo,
    getDeviceInfo,
    updateFPS,
  ]);

  // Start/stop monitoring
  const toggleMonitoring = () => {
    if (isMonitoring) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsMonitoring(false);
    } else {
      collectMetrics(); // Initial collection
      intervalRef.current = setInterval(collectMetrics, 2000);
      setIsMonitoring(true);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get performance score color
  const getScoreColor = (
    value: number,
    thresholds: { good: number; fair: number }
  ) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.fair) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get performance badge
  const getPerformanceBadge = (
    value: number,
    thresholds: { good: number; fair: number }
  ) => {
    if (value <= thresholds.good)
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          İyi
        </Badge>
      );
    if (value <= thresholds.fair)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Orta
        </Badge>
      );
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        Kötü
      </Badge>
    );
  };

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Monitor className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold">Performance Monitor</h3>
          <p className="mb-4 text-gray-600">
            Web sitesinin performans metriklerini izleyin
          </p>
          <Button onClick={toggleMonitoring}>
            <Activity className="mr-2 h-4 w-4" />
            Monitörü Başlat
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Monitor
              </CardTitle>
              {lastUpdate && (
                <p className="mt-1 text-sm text-gray-500">
                  Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                </p>
              )}
            </div>
            <Button
              onClick={toggleMonitoring}
              variant={isMonitoring ? 'destructive' : 'primary'}
            >
              <RefreshCw
                className={cn('mr-2 h-4 w-4', isMonitoring && 'animate-spin')}
              />
              {isMonitoring ? 'Durdur' : 'Başlat'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Core Web Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">LCP</div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    getScoreColor(metrics.coreWebVitals.LCP, {
                      good: 2500,
                      fair: 4000,
                    })
                  )}
                >
                  {metrics.coreWebVitals.LCP.toFixed(0)}ms
                </div>
              </div>
              {getPerformanceBadge(metrics.coreWebVitals.LCP, {
                good: 2500,
                fair: 4000,
              })}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">FCP</div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    getScoreColor(metrics.coreWebVitals.FCP, {
                      good: 1800,
                      fair: 3000,
                    })
                  )}
                >
                  {metrics.coreWebVitals.FCP.toFixed(0)}ms
                </div>
              </div>
              {getPerformanceBadge(metrics.coreWebVitals.FCP, {
                good: 1800,
                fair: 3000,
              })}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">TTFB</div>
                <div
                  className={cn(
                    'text-lg font-semibold',
                    getScoreColor(metrics.coreWebVitals.TTFB, {
                      good: 800,
                      fair: 1800,
                    })
                  )}
                >
                  {metrics.coreWebVitals.TTFB.toFixed(0)}ms
                </div>
              </div>
              {getPerformanceBadge(metrics.coreWebVitals.TTFB, {
                good: 800,
                fair: 1800,
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bundle Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Bundle Boyutu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">JavaScript</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.bundleSize.js)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CSS</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.bundleSize.css)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Görseller</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.bundleSize.images)}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Toplam</span>
                <span className="text-sm font-semibold">
                  {formatBytes(metrics.bundleSize.total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Bellek Kullanımı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Kullanılan</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.memoryUsage.used)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Toplam</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.memoryUsage.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Limit</span>
                <span className="text-sm font-medium">
                  {formatBytes(metrics.memoryUsage.limit)}
                </span>
              </div>
            </div>

            {metrics.memoryUsage.total > 0 && (
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{
                    width: `${(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100}%`,
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Ağ Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tür</span>
                <span className="text-sm font-medium">
                  {metrics.networkInfo.effectiveType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Downlink</span>
                <span className="text-sm font-medium">
                  {metrics.networkInfo.downlink} Mbps
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">RTT</span>
                <span className="text-sm font-medium">
                  {metrics.networkInfo.rtt}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Device Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Cihaz Bilgisi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bellek</span>
                <span className="text-sm font-medium">
                  {metrics.deviceInfo.deviceMemory || 'N/A'} GB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CPU Çekirdek</span>
                <span className="text-sm font-medium">
                  {metrics.deviceInfo.hardwareConcurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Platform</span>
                <span className="text-sm font-medium">
                  {metrics.deviceInfo.platform}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Render Metrikleri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FPS</span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      metrics.renderMetrics.fps >= 50
                        ? 'text-green-600'
                        : metrics.renderMetrics.fps >= 30
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    )}
                  >
                    {metrics.renderMetrics.fps}
                  </span>
                  {metrics.renderMetrics.fps >= 50 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : metrics.renderMetrics.fps >= 30 ? (
                    <Info className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Önerileri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">İyi Performans</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• LCP &lt; 2.5s</li>
                <li>• FCP &lt; 1.8s</li>
                <li>• TTFB &lt; 800ms</li>
                <li>• FPS &gt; 50</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">
                Optimizasyon Gerekli
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Bundle boyutunu küçültün</li>
                <li>• Görselleri optimize edin</li>
                <li>• Lazy loading kullanın</li>
                <li>• Cache stratejilerini iyileştirin</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
