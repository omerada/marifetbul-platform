'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Progress } from '@/components/ui/Progress';
import {
  Server,
  Cpu,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Database,
  Globe,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/shared/utils/logger';

interface SystemHealthData {
  uptime: {
    value: number;
    status: 'healthy' | 'warning' | 'critical';
    percentage: number;
  };
  responseTime: {
    value: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
  };
  errorRate: {
    value: number;
    status: 'healthy' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
  };
  cpu: {
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  memory: {
    usage: number;
    total: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  disk: {
    usage: number;
    total: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    maxConnections: number;
    responseTime: number;
  };
  services: {
    name: string;
    status: 'online' | 'offline' | 'maintenance';
    responseTime?: number;
  }[];
  lastUpdate: Date;
}

interface SystemHealthWidgetProps {
  className?: string;
  refreshInterval?: number;
}

export default function SystemHealthWidget({
  className,
  refreshInterval = 30000, // 30 seconds default
}: SystemHealthWidgetProps) {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealthData = async () => {
    try {
      setIsLoading(true);

      // Fetch real system health data from backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch('/api/v1/admin/system/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Graceful degradation - don't crash the entire dashboard
          if (response.status === 401 || response.status === 403) {
            logger.warn(
              '[SystemHealthWidget] Authentication error, skipping health check'
            );
            return;
          }
          throw new Error(`Health check failed: ${response.status}`);
        }

        const backendData = await response.json();

        // Transform backend data to widget format with safe defaults
        const uptimeSeconds = backendData.uptime?.seconds || 0;
        const uptimeHours = uptimeSeconds / 3600;
        const uptimePercentage = backendData.healthy ? 99.9 : 50;

        const transformedData: SystemHealthData = {
          uptime: {
            value: Math.round(uptimeHours * 100) / 100, // Hours with 2 decimals
            status: backendData.healthy ? 'healthy' : 'critical',
            percentage: uptimePercentage,
          },
          responseTime: {
            value: 0, // Can be calculated from metrics if available
            status: 'healthy',
            trend: 'stable',
          },
          errorRate: {
            value: 0,
            status: 'healthy',
            trend: 'down',
          },
          cpu: {
            usage: 0, // Not available from current backend endpoint
            status: 'healthy',
          },
          memory: {
            // Memory comes in bytes, convert to GB with 2 decimals
            usage:
              backendData.memory?.heapUsed && backendData.memory.heapUsed > 0
                ? Math.round(
                    (backendData.memory.heapUsed / (1024 * 1024 * 1024)) * 100
                  ) / 100
                : 0,
            total:
              backendData.memory?.heapMax && backendData.memory.heapMax > 0
                ? Math.round(
                    (backendData.memory.heapMax / (1024 * 1024 * 1024)) * 100
                  ) / 100
                : 4, // Default 4GB if not available
            status:
              (backendData.memory?.heapUsagePercent || 0) > 85
                ? 'critical'
                : (backendData.memory?.heapUsagePercent || 0) > 70
                  ? 'warning'
                  : 'healthy',
          },
          disk: {
            usage: 0, // Not available from current backend endpoint
            total: 100,
            status: 'healthy',
          },
          database: {
            // Show total connections (active + idle)
            connections:
              (backendData.database?.activeConnections || 0) +
              (backendData.database?.idleConnections || 0),
            maxConnections:
              backendData.database?.maxConnections &&
              backendData.database.maxConnections > 0
                ? backendData.database.maxConnections
                : 100, // Default max if 0
            responseTime: 0,
            status: backendData.database?.healthy ? 'healthy' : 'critical',
          },
          services: [
            {
              name: 'Database',
              status: backendData.database?.healthy ? 'online' : 'offline',
              responseTime: 0,
            },
            {
              name: 'Elasticsearch',
              status: backendData.elasticsearch?.healthy ? 'online' : 'offline',
              responseTime: 0,
            },
            {
              name: 'Redis',
              status: backendData.redis?.healthy ? 'online' : 'offline',
              responseTime: 0,
            },
          ],
          lastUpdate: new Date(backendData.timestamp || Date.now()),
        };

        setHealthData(transformedData);
        setLastRefresh(new Date());

        logger.debug(
          '[SystemHealthWidget] System health data fetched successfully'
        );
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          logger.warn('[SystemHealthWidget] Health check timed out');
          return;
        }

        throw fetchError;
      }
    } catch (error) {
      logger.error('[SystemHealthWidget] Failed to fetch health data:', error);

      // Graceful degradation - keep previous data if available
      if (!healthData) {
        setHealthData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, refreshInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshInterval]);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!healthData) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Sistem Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallStatus =
    healthData.cpu.status === 'critical' ||
    healthData.memory.status === 'critical' ||
    healthData.database.status === 'critical' ||
    healthData.errorRate.status === 'critical'
      ? 'critical'
      : healthData.cpu.status === 'warning' ||
          healthData.memory.status === 'warning' ||
          healthData.database.status === 'warning' ||
          healthData.errorRate.status === 'warning'
        ? 'warning'
        : 'healthy';

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Sistem Durumu
            {getStatusIcon(overallStatus)}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              Son güncelleme: {lastRefresh.toLocaleTimeString('tr-TR')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchHealthData}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw
                className={cn('h-4 w-4', isLoading && 'animate-spin')}
              />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Core Metrics - Compact Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-blue-600">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium">Çalışma</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {healthData.uptime.value}sa
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-green-600">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Yanıt</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {healthData.responseTime.value}ms
            </div>
          </div>

          <div className="rounded-lg bg-emerald-50 p-3">
            <div className="mb-1 flex items-center gap-2 text-emerald-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Hata</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {healthData.errorRate.value}%
            </div>
          </div>
        </div>

        {/* Resource Usage - Compact */}
        <div className="rounded-lg border bg-gray-50 p-3">
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
            <Server className="h-3 w-3" />
            Kaynak Kullanımı
          </h4>
          <div className="space-y-2">
            {/* CPU backend'de yok - memory usage percentage göster */}
            <div className="flex items-center gap-2">
              <Cpu className="h-3 w-3 text-gray-400" />
              <span className="w-12 text-xs text-gray-600">Heap</span>
              <Progress
                value={
                  healthData.memory.total > 0
                    ? (healthData.memory.usage / healthData.memory.total) * 100
                    : 0
                }
                className="h-1.5 flex-1"
              />
              <span className="w-12 text-right text-xs font-medium text-gray-900">
                {healthData.memory.total > 0
                  ? `${((healthData.memory.usage / healthData.memory.total) * 100).toFixed(1)}%`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-3 w-3 text-gray-400" />
              <span className="w-12 text-xs text-gray-600">RAM</span>
              <Progress
                value={
                  healthData.memory.total > 0
                    ? (healthData.memory.usage / healthData.memory.total) * 100
                    : 0
                }
                className="h-1.5 flex-1"
              />
              <span className="w-12 text-right text-xs font-medium text-gray-900">
                {healthData.memory.usage > 0
                  ? `${healthData.memory.usage.toFixed(2)}GB`
                  : 'N/A'}
              </span>
            </div>
            {/* CPU yerine uptime göster - disk backend'de yok */}
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-gray-400" />
              <span className="w-12 text-xs text-gray-600">Uptime</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${healthData.uptime.percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs font-medium text-gray-900">
                {healthData.uptime.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Services Status - Compact */}
        <div className="rounded-lg border bg-gray-50 p-3">
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
            <Globe className="h-3 w-3" />
            Servisler
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {healthData.services.map((service, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1 rounded-md bg-white p-2"
              >
                <span className="text-xs font-medium text-gray-700">
                  {service.name}
                </span>
                <Badge
                  variant={
                    service.status === 'online' ? 'default' : 'destructive'
                  }
                  className="px-2 py-0 text-xs"
                >
                  {service.status === 'online' ? '✓' : '✗'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Database - Compact */}
        <div className="rounded-lg border bg-gray-50 p-3">
          <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-700">
            <Database className="h-3 w-3" />
            Veritabanı
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Durum</span>
              <span className="font-medium text-gray-900">
                {healthData.database.status === 'healthy'
                  ? '✓ Sağlıklı'
                  : '✗ Hata'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bağlantı</span>
              <span className="font-medium text-gray-900">
                {healthData.database.connections}/
                {healthData.database.maxConnections}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
