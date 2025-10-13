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
  HardDrive,
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

      // TODO: Replace with real backend health check API
      // Suggested endpoint: GET /api/v1/admin/system/health
      // Backend should implement Spring Boot Actuator endpoints or custom health check
      // Should return real metrics from server monitoring (CPU, memory, services status)

      // Simulate API call with realistic data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

      const mockData: SystemHealthData = {
        uptime: {
          value: 99.8,
          status: 'healthy',
          percentage: 99.8,
        },
        responseTime: {
          value: 120,
          status: 'healthy',
          trend: 'stable',
        },
        errorRate: {
          value: 0.02,
          status: 'healthy',
          trend: 'down',
        },
        cpu: {
          usage: Math.random() * 30 + 20, // 20-50%
          status: 'healthy',
        },
        memory: {
          usage: Math.random() * 2 + 6, // 6-8 GB
          total: 16,
          status: 'healthy',
        },
        disk: {
          usage: Math.random() * 10 + 40, // 40-50 GB
          total: 100,
          status: 'healthy',
        },
        database: {
          status: 'healthy',
          connections: Math.floor(Math.random() * 20 + 10), // 10-30 connections
          maxConnections: 100,
          responseTime: Math.random() * 5 + 2, // 2-7ms
        },
        services: [
          {
            name: 'Web Server',
            status: 'online',
            responseTime: Math.random() * 50 + 100,
          },
          {
            name: 'Database',
            status: 'online',
            responseTime: Math.random() * 10 + 5,
          },
          {
            name: 'Redis Cache',
            status: 'online',
            responseTime: Math.random() * 5 + 1,
          },
          {
            name: 'Email Service',
            status: 'online',
            responseTime: Math.random() * 100 + 200,
          },
          {
            name: 'File Storage',
            status: 'online',
            responseTime: Math.random() * 30 + 50,
          },
        ],
        lastUpdate: new Date(),
      };

      // Add some randomization for demo purposes
      if (Math.random() < 0.1) {
        // 10% chance of warning
        mockData.cpu.status = 'warning';
        mockData.cpu.usage = Math.random() * 20 + 70; // 70-90%
      }

      if (Math.random() < 0.05) {
        // 5% chance of critical
        mockData.errorRate.status = 'critical';
        mockData.errorRate.value = Math.random() * 2 + 3; // 3-5%
        mockData.errorRate.trend = 'up';
      }

      setHealthData(mockData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const interval = setInterval(fetchHealthData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

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
      <CardContent className="space-y-6">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm font-medium">
                <Activity className="h-4 w-4" />
                Uptime
              </span>
              <Badge
                variant={
                  healthData.uptime.status === 'healthy'
                    ? 'default'
                    : 'destructive'
                }
              >
                {healthData.uptime.value}%
              </Badge>
            </div>
            <Progress value={healthData.uptime.percentage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm font-medium">
                <Zap className="h-4 w-4" />
                Yanıt Süresi
              </span>
              <Badge
                variant={
                  healthData.responseTime.status === 'healthy'
                    ? 'default'
                    : 'destructive'
                }
              >
                {healthData.responseTime.value}ms
              </Badge>
            </div>
            <div
              className={cn(
                'text-xs',
                getStatusColor(healthData.responseTime.status)
              )}
            >
              {healthData.responseTime.trend === 'up' && '↗ Artış'}
              {healthData.responseTime.trend === 'down' && '↘ Azalış'}
              {healthData.responseTime.trend === 'stable' && '→ Sabit'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm font-medium">
                <AlertTriangle className="h-4 w-4" />
                Hata Oranı
              </span>
              <Badge
                variant={
                  healthData.errorRate.status === 'healthy'
                    ? 'default'
                    : 'destructive'
                }
              >
                {healthData.errorRate.value}%
              </Badge>
            </div>
            <div
              className={cn(
                'text-xs',
                getStatusColor(healthData.errorRate.status)
              )}
            >
              {healthData.errorRate.trend === 'up' && '↗ Artış'}
              {healthData.errorRate.trend === 'down' && '↘ Azalış'}
              {healthData.errorRate.trend === 'stable' && '→ Sabit'}
            </div>
          </div>
        </div>

        {/* Resource Usage */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">
            Kaynak Kullanımı
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm">
                  <Cpu className="h-4 w-4" />
                  CPU
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    getStatusColor(healthData.cpu.status)
                  )}
                >
                  {healthData.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={healthData.cpu.usage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm">
                  <Server className="h-4 w-4" />
                  RAM
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    getStatusColor(healthData.memory.status)
                  )}
                >
                  {healthData.memory.usage.toFixed(1)}GB /{' '}
                  {healthData.memory.total}GB
                </span>
              </div>
              <Progress
                value={
                  (healthData.memory.usage / healthData.memory.total) * 100
                }
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm">
                  <HardDrive className="h-4 w-4" />
                  Disk
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    getStatusColor(healthData.disk.status)
                  )}
                >
                  {healthData.disk.usage.toFixed(1)}GB / {healthData.disk.total}
                  GB
                </span>
              </div>
              <Progress
                value={(healthData.disk.usage / healthData.disk.total) * 100}
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Veritabanı Durumu
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm">
                <Database className="h-4 w-4" />
                Durum
              </span>
              <div className="flex items-center gap-1">
                {getStatusIcon(healthData.database.status)}
                <span
                  className={cn(
                    'text-sm font-medium',
                    getStatusColor(healthData.database.status)
                  )}
                >
                  {healthData.database.status === 'healthy'
                    ? 'Sağlıklı'
                    : healthData.database.status === 'warning'
                      ? 'Uyarı'
                      : 'Kritik'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Yanıt Süresi</span>
              <span className="text-sm font-medium">
                {healthData.database.responseTime.toFixed(1)}ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Bağlantılar</span>
              <span className="text-sm font-medium">
                {healthData.database.connections} /{' '}
                {healthData.database.maxConnections}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Kullanım</span>
              <span className="text-sm font-medium">
                {(
                  (healthData.database.connections /
                    healthData.database.maxConnections) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Services Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Servis Durumu</h4>
          <div className="space-y-2">
            {healthData.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {service.responseTime && (
                    <span className="text-xs text-gray-500">
                      {service.responseTime.toFixed(0)}ms
                    </span>
                  )}
                  <Badge
                    variant={
                      service.status === 'online'
                        ? 'default'
                        : service.status === 'maintenance'
                          ? 'secondary'
                          : 'destructive'
                    }
                    size="sm"
                  >
                    {service.status === 'online'
                      ? 'Çevrimiçi'
                      : service.status === 'maintenance'
                        ? 'Bakım'
                        : 'Çevrimdışı'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
