'use client';

/**
 * SYSTEM HEALTH WIDGET v4.0.0
 * Sprint 1 - Story 1.3.3 (Phase 2): Migrated to Centralized State
 * Now uses useAdminDashboard hook - no local state or API calls
 */

'use client';

import React, { useMemo, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Progress } from '@/components/ui/Progress';
import {
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Database,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useAdminDashboard } from '@/hooks';

interface SystemHealthWidgetProps {
  className?: string;
  refreshInterval?: number; // Deprecated
}

const StatusIcon = memo(function StatusIcon({ status }: { status: string }) {
  if (status === 'healthy')
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === 'warning')
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  if (status === 'critical')
    return <XCircle className="h-4 w-4 text-red-500" />;
  return <Activity className="h-4 w-4 text-gray-400" />;
});

const ServiceStatusBadge = memo(function ServiceStatusBadge({
  name,
  isHealthy,
  icon: Icon,
}: {
  name: string;
  isHealthy: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'h-4 w-4',
            isHealthy ? 'text-green-500' : 'text-red-500'
          )}
        />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <Badge variant={isHealthy ? 'success' : 'destructive'}>
        {isHealthy ? 'Online' : 'Offline'}
      </Badge>
    </div>
  );
});

export function SystemHealthWidget({
  className,
  refreshInterval: _refreshInterval = 30000,
}: SystemHealthWidgetProps) {
  const { systemHealth, isHealthy, isLoading, error, lastUpdated, refresh } =
    useAdminDashboard();

  useMemo(() => {
    if (systemHealth) {
      logger.debug('SystemHealthWidget: Data from store', {
        status: systemHealth.status,
        uptime: systemHealth.uptime,
      });
    }
  }, [systemHealth]);

  const displayHealth = useMemo(() => {
    if (!systemHealth) return null;
    const uptimeHours = Math.round((systemHealth.uptime / 3600) * 100) / 100;
    const memoryPercentage = systemHealth.heapUsagePercent || 0;
    const memoryUsageGB = Math.round((memoryPercentage / 100) * 4 * 100) / 100;
    return {
      status: systemHealth.status,
      uptimeHours,
      uptimePercentage: isHealthy ? 99.9 : 50,
      memoryUsageGB,
      memoryTotal: 4,
      memoryPercentage,
      memoryStatus:
        memoryPercentage > 85
          ? 'critical'
          : memoryPercentage > 70
            ? 'warning'
            : 'healthy',
      databaseHealthy: systemHealth.databaseHealthy,
      elasticsearchHealthy: systemHealth.elasticsearchHealthy,
      activeConnections: systemHealth.activeConnections,
      responseTime: systemHealth.responseTime,
      errorRate: systemHealth.errorRate,
      lastCheck: new Date(systemHealth.lastCheck),
    };
  }, [systemHealth, isHealthy]);

  const lastUpdateTime = useMemo(() => {
    if (!lastUpdated) return undefined;
    return new Date(lastUpdated).toLocaleTimeString('tr-TR');
  }, [lastUpdated]);

  const hasAlerts =
    displayHealth &&
    (displayHealth.status === 'critical' ||
      displayHealth.memoryStatus === 'critical' ||
      !displayHealth.databaseHealthy ||
      !displayHealth.elasticsearchHealthy);

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Server className="h-5 w-5" />
          System Health
          {displayHealth && <StatusIcon status={displayHealth.status} />}
        </CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdateTime && (
            <span className="text-muted-foreground text-xs">
              {lastUpdateTime}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && !displayHealth ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="text-muted-foreground h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : displayHealth ? (
          <div className="space-y-4">
            {hasAlerts && (
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    System Health Issues Detected
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <StatusIcon status={displayHealth.status} />
                </div>
                <div className="text-2xl font-bold">
                  {displayHealth.uptimeHours}h
                </div>
                <Progress
                  value={displayHealth.uptimePercentage}
                  className="h-2"
                />
                <p className="text-muted-foreground text-xs">
                  {displayHealth.uptimePercentage}% availability
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory</span>
                  <StatusIcon status={displayHealth.memoryStatus} />
                </div>
                <div className="text-2xl font-bold">
                  {displayHealth.memoryUsageGB} GB
                  <span className="text-muted-foreground text-sm font-normal">
                    {' '}
                    / {displayHealth.memoryTotal} GB
                  </span>
                </div>
                <Progress
                  value={displayHealth.memoryPercentage}
                  className="h-2"
                />
                <p className="text-muted-foreground text-xs">
                  {displayHealth.memoryPercentage.toFixed(1)}% used
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Response Time</span>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">
                  {displayHealth.responseTime}ms
                </div>
                <p className="text-muted-foreground text-xs">
                  Average response
                </p>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">DB Connections</span>
                  <Database
                    className={cn(
                      'h-4 w-4',
                      displayHealth.databaseHealthy
                        ? 'text-green-500'
                        : 'text-red-500'
                    )}
                  />
                </div>
                <div className="text-2xl font-bold">
                  {displayHealth.activeConnections}
                </div>
                <p className="text-muted-foreground text-xs">
                  Active connections
                </p>
              </div>
            </div>
            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold">Services</h3>
              <div className="space-y-2">
                <ServiceStatusBadge
                  name="Database"
                  isHealthy={displayHealth.databaseHealthy}
                  icon={Database}
                />
                <ServiceStatusBadge
                  name="Elasticsearch"
                  isHealthy={displayHealth.elasticsearchHealthy}
                  icon={Globe}
                />
              </div>
            </div>
            {displayHealth.errorRate > 0 && (
              <div className="rounded-lg bg-orange-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-orange-700">
                    Error Rate
                  </span>
                  <span className="text-sm font-bold text-orange-700">
                    {displayHealth.errorRate.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Server className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Health Data</h3>
            <p className="text-muted-foreground text-sm">
              System health information will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SystemHealthWidget;
