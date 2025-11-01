/**
 * ================================================
 * SYSTEM HEALTH PANEL COMPONENT
 * ================================================
 * Real-time system health monitoring
 *
 * Sprint 3.2: Admin Dashboard Enhancement
 * @version 1.0.0
 */

'use client';

import { Server, Database, Activity, Zap } from 'lucide-react';
import type { SystemHealthMetrics } from '@/types/business/admin-dashboard';

interface SystemHealthPanelProps {
  data: SystemHealthMetrics;
  isLoading?: boolean;
}

export function SystemHealthPanel({ data, isLoading }: SystemHealthPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
          All Systems Operational
        </span>
      </div>

      <div className="space-y-4">
        {/* Server Status */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Server</h3>
                <p className="text-sm text-gray-600">
                  Uptime: {formatUptime(data.server.uptime)}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(data.server.status)}`}
            >
              {getStatusText(data.server.status)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Version: {data.server.version}</span>
            <span>•</span>
            <span className="capitalize">{data.server.environment}</span>
          </div>
        </div>

        {/* Database Status */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Database className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Database</h3>
                <p className="text-sm text-gray-600">
                  {data.database.connections.active} active /{' '}
                  {data.database.connections.max} max
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(data.database.status)}`}
            >
              {getStatusText(data.database.status)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Response: {data.database.responseTime}ms</span>
            <span>•</span>
            <span>Idle: {data.database.connections.idle}</span>
          </div>
        </div>

        {/* Redis Status */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-100 p-2">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Redis Cache</h3>
                <p className="text-sm text-gray-600">
                  {formatMemory(data.redis.memory.used)} /{' '}
                  {formatMemory(data.redis.memory.max)}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(data.redis.status)}`}
            >
              {getStatusText(data.redis.status)}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Hit Rate: {data.redis.hitRate}%</span>
            <span>•</span>
            <span>Keys: {data.redis.keys.toLocaleString()}</span>
          </div>
        </div>

        {/* API Performance */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Zap className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">API Performance</h3>
                <p className="text-sm text-gray-600">
                  {data.api.avgResponseTime}ms avg response
                </p>
              </div>
            </div>
            <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              {data.api.errorRate.toFixed(2)}% errors
            </span>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{data.api.requestsPerMinute} req/min</span>
            <span>•</span>
            <span>Slowest: {data.api.slowestEndpoint.path}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-500">
          Last updated:{' '}
          {new Date(data.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
