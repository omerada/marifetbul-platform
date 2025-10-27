/**
 * ================================================
 * COMMENT MODERATION SUMMARY SECTION
 * ================================================
 * Section for admin dashboard showing comment moderation overview
 * Integrates multiple moderation widgets with auto-refresh
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PendingCommentsWidget,
  CommentModerationStats,
  RecentCommentsPreview,
  type PendingCommentsSummary,
  type CommentModerationStatsData,
} from '@/components/admin/dashboard';
import { useAutoRefresh } from '@/hooks/business/useAutoRefresh';
import { useRetry } from '@/hooks/business/useRetry';
import type { BlogComment } from '@/types/blog';
import { apiClient } from '@/lib/api';

// ================================================
// COMPONENT
// ================================================

export function CommentModerationSummary() {
  // ================================================
  // STATE
  // ================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingSummary, setPendingSummary] =
    useState<PendingCommentsSummary | null>(null);
  const [statsData, setStatsData] = useState<CommentModerationStatsData | null>(
    null
  );
  const [recentComments, setRecentComments] = useState<BlogComment[]>([]);

  // ================================================
  // RETRY HOOK
  // ================================================

  const retry = useRetry({
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (attempt, err) => {
      console.log(`Retry attempt ${attempt}:`, err.message);
    },
  });

  // ================================================
  // FETCH DATA
  // ================================================

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await retry.execute(async () => {
        // Production Ready: Backend API endpoint required
        // Expected endpoint: GET /api/v1/admin/comments/moderation/stats
        // Response format: { total, pending, approved, rejected, spam, today, thisWeek, reported, trend, trendPercentage, avgResponseTime }
        const response = await apiClient.get<{
          total: number;
          pending: number;
          approved: number;
          rejected: number;
          spam: number;
          today: number;
          thisWeek: number;
          reported: number;
          trend: 'up' | 'down' | 'stable';
          trendPercentage: number;
          avgResponseTime?: string;
          todayApproved?: number;
          todayRejected?: number;
          recentComments: BlogComment[];
        }>('/blog/comments/admin/summary');

        setPendingSummary({
          pending: response.pending,
          today: response.today,
          thisWeek: response.thisWeek,
          reported: response.reported,
          trend: response.trend,
          trendPercentage: response.trendPercentage,
        });

        setStatsData({
          total: response.total,
          pending: response.pending,
          approved: response.approved,
          rejected: response.rejected,
          spam: response.spam,
          avgResponseTime: response.avgResponseTime,
          todayApproved: response.todayApproved,
          todayRejected: response.todayRejected,
        });

        setRecentComments(response.recentComments || []);
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu';
      setError(errorMessage);

      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        setPendingSummary({
          pending: 47,
          today: 12,
          thisWeek: 89,
          reported: 5,
          trend: 'up',
          trendPercentage: 15,
        });

        setStatsData({
          total: 1250,
          pending: 47,
          approved: 1108,
          rejected: 82,
          spam: 13,
          avgResponseTime: '2.5h',
          todayApproved: 8,
          todayRejected: 4,
        });

        setRecentComments([]);
      }
    } finally {
      setLoading(false);
    }
  }, [retry]);

  // ================================================
  // AUTO-REFRESH
  // ================================================

  const autoRefresh = useAutoRefresh(fetchData, {
    interval: 60000, // 1 minute
    enabled: true,
    refreshOnFocus: true,
    refreshOnReconnect: true,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Yorum Moderasyonu</h2>
        {error && (
          <button
            onClick={() => fetchData()}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Tekrar dene
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Comments Widget */}
        <div className="lg:col-span-1">
          <PendingCommentsWidget
            data={pendingSummary || undefined}
            loading={loading}
            onRefresh={() => autoRefresh.refresh()}
          />
        </div>

        {/* Recent Comments Preview */}
        <div className="lg:col-span-2">
          <RecentCommentsPreview
            comments={recentComments}
            loading={loading}
            maxItems={5}
            showStatus={true}
            onViewAll={() => {
              window.location.href = '/admin/moderation/comments';
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <CommentModerationStats data={statsData || undefined} loading={loading} />
    </div>
  );
}

export default CommentModerationSummary;
