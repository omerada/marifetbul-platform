'use client';

/**
 * ================================================
 * FLAG STATISTICS PANEL
 * ================================================
 * Dashboard widget showing flagging statistics and trends
 *
 * Sprint: Sprint 3 - Day 3 (Moderator Dashboard Enhancement)
 * Features: Flag counts, category breakdown, trending flags, resolution metrics
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import {
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  RefreshCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  type FlagStatistics,
  FlagCategory,
  getCategoryLabel,
  getFlagStatistics,
} from '@/lib/api/comment-flagging';

// ================================================
// COMPONENT PROPS
// ================================================

export interface FlagStatisticsPanelProps {
  onRefresh?: () => void;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function FlagStatisticsPanel({ onRefresh }: FlagStatisticsPanelProps) {
  // ================================================
  // STATE
  // ================================================

  const [stats, setStats] = useState<FlagStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ================================================
  // EFFECTS
  // ================================================

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================================
  // DATA LOADING
  // ================================================

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getFlagStatistics();
      setStats(data);
      onRefresh?.();
    } catch (_err) {
      const message = 'İstatistikler yüklenemedi';
      setError(message);
      toast.error('Hata', { description: message });
    } finally {
      setLoading(false);
    }
  };

  // ================================================
  // HANDLERS
  // ================================================

  const handleRefresh = () => {
    loadStats();
  };

  // ================================================
  // RENDER HELPERS
  // ================================================

  const getCategoryColor = (category: FlagCategory): string => {
    const colors: Record<FlagCategory, string> = {
      [FlagCategory.SPAM]: 'bg-orange-100 text-orange-700',
      [FlagCategory.OFFENSIVE]: 'bg-red-100 text-red-700',
      [FlagCategory.INAPPROPRIATE]: 'bg-pink-100 text-pink-700',
      [FlagCategory.MISINFORMATION]: 'bg-yellow-100 text-yellow-700',
      [FlagCategory.HARASSMENT]: 'bg-purple-100 text-purple-700',
      [FlagCategory.OFF_TOPIC]: 'bg-gray-100 text-gray-700',
      [FlagCategory.COPYRIGHT]: 'bg-blue-100 text-blue-700',
      [FlagCategory.OTHER]: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  // ================================================
  // RENDER
  // ================================================

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-center gap-2 py-12 text-red-800">
          <AlertCircle className="h-5 w-5" />
          {error || 'İstatistikler yüklenemedi'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bayrak İstatistikleri</h2>
          <p className="text-gray-600">
            Kullanıcı bildirimleri ve bayrak analitiği
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Flag className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">
              Toplam Bayrak
            </span>
          </div>
          <div className="text-2xl font-bold">{stats.totalFlags}</div>
          <div className="mt-1 text-xs text-gray-500">Tüm zamanlar</div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-gray-600">Bekleyen</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pendingFlags}
          </div>
          <div className="mt-1 text-xs text-gray-500">İnceleme gerekiyor</div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Çözüldü</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {stats.resolvedFlags}
          </div>
          <div className="mt-1 text-xs text-gray-500">İşlem tamamlandı</div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">
              Reddedildi
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {stats.dismissedFlags}
          </div>
          <div className="mt-1 text-xs text-gray-500">Geçersiz bildirimler</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Kategori Dağılımı</h3>
        <div className="space-y-3">
          {Object.entries(stats.flagsByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => {
              const percentage = (count / stats.totalFlags) * 100;
              return (
                <div key={category}>
                  <div className="mb-1 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(
                        category as FlagCategory
                      )}`}
                    >
                      {getCategoryLabel(category as FlagCategory)}
                    </span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Severity Breakdown */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Önem Derecesi</h3>
          <div className="space-y-3">
            {Object.entries(stats.flagsBySeverity).map(([severity, count]) => (
              <div key={severity} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {severity === 'low' && 'Düşük'}
                  {severity === 'medium' && 'Orta'}
                  {severity === 'high' && 'Yüksek'}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold">Performans</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Ortalama Çözüm Süresi
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                {Math.round(stats.averageResolutionTimeMinutes)} dk
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Bekleyen Bayraklar
              </span>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                {stats.pendingFlags}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Çözüm Oranı
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {((stats.resolvedFlags / stats.totalFlags) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Flagged Comments */}
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">En Çok Bayraklanan Yorumlar</h3>
          <TrendingUp className="h-5 w-5 text-orange-600" />
        </div>
        <div className="space-y-3">
          {stats.topFlaggedComments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Henüz bayraklanmış yorum bulunmuyor
            </div>
          ) : (
            stats.topFlaggedComments.map((item) => (
              <div
                key={item.commentId}
                className="rounded-lg border bg-gray-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      {item.flagCount} Bayrak
                    </span>
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(
                          cat
                        )}`}
                      >
                        {getCategoryLabel(cat)}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-gray-600">
                  {item.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Flags */}
      <div className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Son Bayraklar</h3>
        <div className="space-y-3">
          {stats.recentFlags.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              Henüz bayrak bulunmuyor
            </div>
          ) : (
            stats.recentFlags.slice(0, 5).map((flag) => (
              <div
                key={flag.id}
                className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
              >
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(
                        flag.category
                      )}`}
                    >
                      {getCategoryLabel(flag.category)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {flag.reporterName} tarafından
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {flag.reason}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(flag.createdAt).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
