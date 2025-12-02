'use client';

/**
 * ================================================
 * FLAG STATISTICS WIDGET
 * ================================================
 * Analytics dashboard widget for flag statistics
 * Admin/Moderator overview of content moderation metrics
 *
 * Sprint 1: Comment Moderation UI Completion
 * Backend API: GET /api/v1/blog/admin/flags/stats
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since December 2, 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Flag,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui';
import {
  getFlagStatistics,
  FlagCategory,
  type FlagStatistics,
} from '@/lib/api/comment-flagging';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface FlagStatisticsWidgetProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
  compact?: boolean;
}

// ================================================
// CATEGORY LABELS
// ================================================

const CATEGORY_LABELS: Record<FlagCategory, string> = {
  [FlagCategory.SPAM]: 'Spam',
  [FlagCategory.OFFENSIVE]: 'Saldırgan',
  [FlagCategory.INAPPROPRIATE]: 'Uygunsuz',
  [FlagCategory.MISINFORMATION]: 'Yanlış Bilgi',
  [FlagCategory.HARASSMENT]: 'Taciz',
  [FlagCategory.OFF_TOPIC]: 'Konu Dışı',
  [FlagCategory.COPYRIGHT]: 'Telif Hakkı',
  [FlagCategory.OTHER]: 'Diğer',
};

// ================================================
// COMPONENT
// ================================================

export function FlagStatisticsWidget({
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute
  compact = false,
}: FlagStatisticsWidgetProps) {
  // ================================================
  // STATE
  // ================================================

  const [stats, setStats] = useState<FlagStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // EFFECTS
  // ================================================

  // Load statistics
  useEffect(() => {
    void loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void loadStatistics(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval]);

  // ================================================
  // HANDLERS
  // ================================================

  const loadStatistics = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const data = await getFlagStatistics();
      setStats(data);

      logger.info('Loaded flag statistics', {
        total: data.totalFlags,
        pending: data.pendingFlags,
      });
    } catch (err) {
      setError('İstatistikler yüklenemedi');
      logger.error(
        'Failed to load flag statistics',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // ================================================
  // COMPUTED VALUES
  // ================================================

  const resolutionRate = stats
    ? stats.totalFlags > 0
      ? Math.round((stats.resolvedFlags / stats.totalFlags) * 100)
      : 0
    : 0;

  const avgResolutionHours = stats
    ? Math.round(stats.averageResolutionTimeMinutes / 60)
    : 0;

  // Top 3 categories
  const topCategories = stats
    ? Object.entries(stats.flagsByCategory)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  // ================================================
  // RENDER
  // ================================================

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">
            {error || 'İstatistikler yüklenemedi'}
          </span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">
              Flag İstatistikleri
            </h3>
            <div className="mt-2 flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingFlags}
                </p>
                <p className="text-xs text-gray-500">Beklemede</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">
                  {stats.totalFlags}
                </p>
                <p className="text-xs text-gray-500">Toplam</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <Badge
              variant={
                resolutionRate >= 80
                  ? 'success'
                  : resolutionRate >= 50
                    ? 'warning'
                    : 'destructive'
              }
            >
              {resolutionRate >= 80 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {resolutionRate}% Çözüm
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Flag İstatistikleri
          </h3>
          <p className="text-sm text-gray-500">İçerik moderasyon metrikleri</p>
        </div>

        <button
          onClick={() => loadStatistics()}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-orange-50 p-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Toplam</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-orange-900">
            {stats.totalFlags}
          </p>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">
              Beklemede
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-900">
            {stats.pendingFlags}
          </p>
        </div>

        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Çözüldü</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-900">
            {stats.resolvedFlags}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Reddedildi
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {stats.dismissedFlags}
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-700">Çözüm Oranı</h4>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {resolutionRate}%
            </span>
            {resolutionRate >= 80 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${
                resolutionRate >= 80
                  ? 'bg-green-600'
                  : resolutionRate >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
              }`}
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h4 className="text-sm font-medium text-gray-700">
            Ortalama Çözüm Süresi
          </h4>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {avgResolutionHours}
            </span>
            <span className="text-sm text-gray-600">saat</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {stats.averageResolutionTimeMinutes} dakika
          </p>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            En Çok Rapor Edilen Kategoriler
          </h4>
          <div className="space-y-2">
            {topCategories.map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="text-sm font-medium text-gray-900">
                  {CATEGORY_LABELS[category as FlagCategory]}
                </span>
                <Badge variant="default">{count}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Flags Preview */}
      {stats.recentFlags && stats.recentFlags.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700">
            Son Flag&apos;ler
          </h4>
          <div className="space-y-2">
            {stats.recentFlags.slice(0, 3).map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {CATEGORY_LABELS[flag.category]}
                  </p>
                  <p className="text-xs text-gray-600">{flag.reporterName}</p>
                </div>
                <Badge
                  variant={
                    flag.status === 'PENDING'
                      ? 'warning'
                      : flag.status === 'RESOLVED'
                        ? 'success'
                        : 'default'
                  }
                >
                  {flag.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FlagStatisticsWidget;
