/**
 * ================================================
 * MODERATOR DASHBOARD PAGE
 * ================================================
 * Main dashboard for moderators to manage content moderation
 *
 * Sprint 1.2: MODERATOR Role Frontend Integration
 * Sprint 2.1: Real-time Stats & Backend Integration
 *
 * @version 2.0.0
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { useModerationDashboard } from '@/hooks/business/useModerationDashboard';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ModeratorDashboardPage() {
  const {
    stats,
    pendingItems,
    recentActivities,
    isLoading,
    isRefreshing,
    error,
    refresh,
  } = useModerationDashboard(30000); // Auto-refresh every 30 seconds

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

      {/* Moderasyon İstatistikleri */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Bekleyen Yorumlar
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse text-gray-400">--</span>
                ) : (
                  (stats?.pendingComments ?? 0)
                )}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                İşaretli Değerlendirmeler
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse text-gray-400">--</span>
                ) : (
                  (stats?.flaggedReviews ?? 0)
                )}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Kullanıcı Şikayetleri
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse text-gray-400">--</span>
                ) : (
                  (stats?.pendingReports ?? 0)
                )}
              </p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Açık Destek Talepleri
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {isLoading ? (
                  <span className="animate-pulse text-gray-400">--</span>
                ) : (
                  (stats?.pendingSupportTickets ?? 0)
                )}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bekleyen Görevler */}
      {!isLoading && pendingItems.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Bekleyen Görevler
          </h2>
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <a
                key={item.itemId}
                href={item.reviewUrl}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        item.priority === 'HIGH'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.itemType}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-gray-900">
                    {item.authorName} - {item.relatedEntity}
                  </h3>
                  <p className="mt-1 line-clamp-1 text-sm text-gray-600">
                    {item.content}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleString('tr-TR')}
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
            ))}
          </div>
        </div>
      )}

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

      {/* Son Aktiviteler */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Son Aktiviteler
        </h2>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex animate-pulse items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Henüz aktivite bulunmuyor
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.activityId}
                  className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-sm font-medium text-blue-600">
                      {activity.moderatorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {activity.moderatorName}
                      </span>{' '}
                      {activity.actionType === 'APPROVE' && 'onayladı'}
                      {activity.actionType === 'REJECT' && 'reddetti'}
                      {activity.actionType === 'BAN' && 'engelledi'}
                      {activity.actionType === 'RESOLVE' && 'çözdü'}{' '}
                      <span className="text-gray-600">
                        {activity.description}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('tr-TR')}
                    </p>
                    {activity.reason && (
                      <p className="mt-1 text-xs text-gray-600 italic">
                        Sebep: {activity.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
