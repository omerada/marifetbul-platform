/**
 * ================================================
 * MODERATOR DASHBOARD PAGE
 * ================================================
 * Main dashboard for moderators to manage content moderation
 *
 * Sprint 1.2: MODERATOR Role Frontend Integration
 * Sprint 2.1: Real-time Stats & Backend Integration
 * Sprint 3.0: Enhanced UI with New Components
 *
 * @version 3.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { useModerationDashboard } from '@/hooks/business/useModerationDashboard';
import { useModerationQueue } from '@/hooks/business/useModerationQueue';
import { useModerationStats } from '@/hooks/business/useModerationStats';
import { useModeratorActivity } from '@/hooks/business/useModeratorActivity';
import {
  ModeratorStatsWidget,
  ModerationQueue,
  ModerationHistory,
  BulkModerationPanel,
} from '@/components/domains/moderator';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ModeratorDashboardPage() {
  // Hooks for data fetching
  const { stats, isLoading: statsLoading } = useModerationStats();
  const {
    items,
    selectedItems,
    isLoading: queueLoading,
    selectItem,
    selectAll,
    clearSelection,
    approveItem,
    rejectItem,
    bulkApprove,
    bulkReject,
    bulkSpam,
  } = useModerationQueue();
  const { activities, isLoading: activityLoading } = useModeratorActivity();
  const { isRefreshing, error, refresh } = useModerationDashboard(30000); // Auto-refresh every 30 seconds

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Moderasyon Paneli
          </h1>
          <p className="mt-2 text-gray-600">
            İçerik moderasyonu ve kullanıcı yönetimi
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Yenile
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Enhanced Stats Widget */}
      <ModeratorStatsWidget
        stats={stats}
        isLoading={statsLoading}
        className="mb-6"
      />

      {/* Bulk Actions Panel */}
      {selectedItems.length > 0 && (
        <BulkModerationPanel
          selectedCount={selectedItems.length}
          onBulkApprove={() => bulkApprove(selectedItems)}
          onBulkReject={(reason: string) => bulkReject(selectedItems, reason)}
          onBulkSpam={() => bulkSpam(selectedItems)}
          onClearSelection={clearSelection}
          className="mb-6"
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Moderation Queue - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ModerationQueue
            items={items}
            selectedItems={selectedItems}
            onItemSelect={selectItem}
            onSelectAll={selectAll}
            onApprove={approveItem}
            onReject={rejectItem}
            isLoading={queueLoading}
          />
        </div>

        {/* Activity History - Takes 1 column */}
        <div className="lg:col-span-1">
          <ModerationHistory
            activities={activities}
            isLoading={activityLoading}
          />
        </div>
      </div>

      {/* Legacy Pending Tasks - Hidden by default, can be shown for backward compatibility */}

      {/* Hızlı İşlemler */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Hızlı İşlemler
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/moderator/comments"
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-medium text-gray-900">Yorum Moderasyonu</h3>
              <p className="text-sm text-gray-500">Blog yorumlarını incele</p>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>

          <a
            href="/moderator/reviews"
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-medium text-gray-900">
                Değerlendirme Moderasyonu
              </h3>
              <p className="text-sm text-gray-500">
                İşaretli değerlendirmeleri kontrol et
              </p>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>

          <a
            href="/moderator/reports"
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-medium text-gray-900">Kullanıcı Raporları</h3>
              <p className="text-sm text-gray-500">Şikayetleri incele</p>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>

          <a
            href="/moderator/tickets"
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <h3 className="font-medium text-gray-900">Destek Talepleri</h3>
              <p className="text-sm text-gray-500">
                Kullanıcı taleplerini yönet
              </p>
            </div>
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* Legacy Activity Section - Hidden, replaced by ModerationHistory component above */}
    </div>
  );
}
