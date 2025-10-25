/**
 * ================================================
 * COMMENT MODERATION STATS COMPONENT
 * ================================================
 * Dashboard component showing comment moderation statistics
 * Provides overview of moderation activity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface CommentModerationStatsData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  spam: number;
  avgResponseTime?: string; // e.g., "2.5 hours"
  todayApproved?: number;
  todayRejected?: number;
}

export interface CommentModerationStatsProps {
  data?: CommentModerationStatsData;
  loading?: boolean;
  compact?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function CommentModerationStats({
  data,
  loading = false,
  compact = false,
}: CommentModerationStatsProps) {
  // ================================================
  // RENDER - Loading
  // ================================================

  if (loading) {
    return (
      <div
        className={`grid gap-4 ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="h-4 w-20 rounded bg-gray-200"></div>
            <div className="mt-3 h-8 w-16 rounded bg-gray-200"></div>
            <div className="mt-2 h-3 w-24 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    );
  }

  // ================================================
  // RENDER - No Data
  // ================================================

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">İstatistik verisi yok</p>
      </div>
    );
  }

  // ================================================
  // COMPUTED
  // ================================================

  const approvalRate =
    data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0;

  const rejectionRate =
    data.total > 0 ? Math.round((data.rejected / data.total) * 100) : 0;

  const pendingPercentage =
    data.total > 0 ? Math.round((data.pending / data.total) * 100) : 0;

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div
      className={`grid gap-4 ${compact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}
    >
      {/* Total Comments */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 text-gray-600">
          <MessageSquare className="h-5 w-5" />
          <p className="text-sm font-medium">Toplam Yorum</p>
        </div>
        <p className="mt-3 text-3xl font-bold text-gray-900">{data.total}</p>
        <p className="mt-1 text-xs text-gray-500">Tüm zamanlar</p>
      </div>

      {/* Pending Comments */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">Bekliyor</p>
        </div>
        <p className="mt-3 text-3xl font-bold text-yellow-600">
          {data.pending}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-yellow-200">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs text-yellow-700">{pendingPercentage}%</span>
        </div>
      </div>

      {/* Approved Comments */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Onaylı</p>
        </div>
        <p className="mt-3 text-3xl font-bold text-green-600">
          {data.approved}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-green-200">
            <div
              className="h-full bg-green-500"
              style={{ width: `${approvalRate}%` }}
            ></div>
          </div>
          <span className="text-xs text-green-700">{approvalRate}%</span>
        </div>
      </div>

      {/* Rejected Comments */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 text-red-700">
          <XCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Reddedildi</p>
        </div>
        <p className="mt-3 text-3xl font-bold text-red-600">{data.rejected}</p>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-red-200">
            <div
              className="h-full bg-red-500"
              style={{ width: `${rejectionRate}%` }}
            ></div>
          </div>
          <span className="text-xs text-red-700">{rejectionRate}%</span>
        </div>
      </div>

      {/* Additional Stats (if not compact) */}
      {!compact && (
        <>
          {/* Spam Comments */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-shadow hover:shadow-md">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-medium">Spam</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{data.spam}</p>
            <p className="mt-1 text-xs text-gray-500">Engellenen yorumlar</p>
          </div>

          {/* Today's Activity */}
          {(data.todayApproved !== undefined ||
            data.todayRejected !== undefined) && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2 text-blue-700">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm font-medium">Bugünkü Aktivite</p>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {data.todayApproved || 0}
                </span>
                <span className="text-sm text-gray-600">/</span>
                <span className="text-2xl font-bold text-red-600">
                  {data.todayRejected || 0}
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-700">Onaylı / Reddedildi</p>
            </div>
          )}

          {/* Average Response Time */}
          {data.avgResponseTime && (
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 transition-shadow hover:shadow-md">
              <div className="flex items-center gap-2 text-purple-700">
                <Clock className="h-5 w-5" />
                <p className="text-sm font-medium">Ort. Yanıt Süresi</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-purple-600">
                {data.avgResponseTime}
              </p>
              <p className="mt-1 text-xs text-purple-700">Moderasyon süresi</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CommentModerationStats;
