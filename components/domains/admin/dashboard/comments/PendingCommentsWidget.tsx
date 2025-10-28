/**
 * ================================================
 * PENDING COMMENTS WIDGET COMPONENT
 * ================================================
 * Dashboard widget showing pending comments summary
 * Provides quick access to moderation queue
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface PendingCommentsSummary {
  pending: number;
  today: number;
  thisWeek: number;
  reported: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export interface PendingCommentsWidgetProps {
  data?: PendingCommentsSummary;
  loading?: boolean;
  onRefresh?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function PendingCommentsWidget({
  data,
  loading = false,
  onRefresh,
}: PendingCommentsWidgetProps) {
  // ================================================
  // RENDER - Loading
  // ================================================

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-gray-200"></div>
          <div className="h-20 rounded bg-gray-200"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 rounded bg-gray-200"></div>
            <div className="h-16 rounded bg-gray-200"></div>
            <div className="h-16 rounded bg-gray-200"></div>
          </div>
          <div className="h-10 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - No Data
  // ================================================

  if (!data) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Moderasyon verileri yüklenemedi
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Tekrar Dene
            </button>
          )}
        </div>
      </div>
    );
  }

  // ================================================
  // RENDER - Main
  // ================================================

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
            <MessageSquare className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Bekleyen Yorumlar
            </h3>
            <p className="text-sm text-gray-500">Moderasyon gerektiriyor</p>
          </div>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm font-medium text-gray-600 hover:text-gray-700"
          >
            Yenile
          </button>
        )}
      </div>

      {/* Main Counter */}
      <div className="mb-6 rounded-lg bg-yellow-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Toplam Bekleyen
            </p>
            <p className="mt-2 text-4xl font-bold text-yellow-600">
              {data.pending}
            </p>
          </div>

          {/* Trend Indicator */}
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              data.trend === 'up'
                ? 'bg-red-100 text-red-700'
                : data.trend === 'down'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {data.trend === 'up' && <TrendingUp className="h-4 w-4" />}
            {data.trend === 'down' && <TrendingDown className="h-4 w-4" />}
            {data.trend !== 'stable' && <span>{data.trendPercentage}%</span>}
            {data.trend === 'stable' && <span>Stabil</span>}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* Today */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <p className="text-xs font-medium">Bugün</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{data.today}</p>
        </div>

        {/* This Week */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <p className="text-xs font-medium">Bu Hafta</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {data.thisWeek}
          </p>
        </div>

        {/* Reported */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-xs font-medium">Raporlu</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {data.reported}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href="/admin/moderation/comments"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-yellow-700"
        >
          <span>Moderasyon Kuyruğu</span>
          <ArrowRight className="h-4 w-4" />
        </Link>

        {data.reported > 0 && (
          <Link
            href="/admin/moderation/comments?filter=reported"
            className="flex items-center justify-center gap-2 rounded-lg border border-red-600 bg-red-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Raporlular</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export default PendingCommentsWidget;
