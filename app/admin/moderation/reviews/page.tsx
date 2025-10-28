/**
 * ================================================
 * ADMIN REVIEW MODERATION PAGE (NEW)
 * ================================================
 * Modern admin interface for review moderation
 * Uses Sprint 2 components and APIs
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2
 */

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ReviewStatus, type ReviewResponse } from '@/lib/api/admin/moderation';
import {
  PendingReviewsList,
  ReviewModerationCard,
  ModerationStats,
} from '@/components/domains/admin';
import { logger } from '@/lib/shared/utils/logger';

type TabType = 'all' | 'pending' | 'flagged';

/**
 * Admin Review Moderation Page
 *
 * Features:
 * - Stats dashboard with key metrics
 * - Tabs for pending, flagged, and all reviews
 * - Search and filter functionality
 * - Bulk operations support
 * - Individual review actions
 * - Responsive layout
 */
export default function AdminReviewModerationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial tab from URL query params
  const initialTab = (searchParams?.get('status') as TabType) || 'pending';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedReview, setSelectedReview] = useState<ReviewResponse | null>(
    null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedReview(null);

    // Update URL without page reload
    const params = new URLSearchParams(window.location.search);
    params.set('status', tab);
    router.push(`/admin/moderation/reviews?${params.toString()}`, {
      scroll: false,
    });

    logger.info('Tab changed', { tab });
  };

  // Handle review update/refresh
  const handleReviewUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedReview(null);
    logger.info('Reviews refreshed');
  };

  // Handle quick navigation from stats
  const handlePendingClick = () => {
    handleTabChange('pending');
  };

  const handleFlaggedClick = () => {
    handleTabChange('flagged');
  };

  // Get filter status based on active tab
  const getFilterStatus = (): ReviewStatus | undefined => {
    if (activeTab === 'pending') return ReviewStatus.PENDING;
    if (activeTab === 'flagged') return ReviewStatus.FLAGGED;
    return undefined; // All reviews
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            İnceleme Moderasyonu
          </h1>
          <p className="mt-2 text-gray-600">
            İncelemeleri yönetin, onaylayın veya reddedin
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="mb-8">
          <ModerationStats
            onPendingClick={handlePendingClick}
            onFlaggedClick={handleFlaggedClick}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('pending')}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Bekleyen İncelemeler
              </button>

              <button
                onClick={() => handleTabChange('flagged')}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'flagged'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Bayraklı İncelemeler
              </button>

              <button
                onClick={() => handleTabChange('all')}
                className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Tüm İncelemeler
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Reviews List (Left Side - 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <PendingReviewsList
              filterStatus={getFilterStatus()}
              key={`${activeTab}-${refreshTrigger}`}
            />
          </div>

          {/* Review Detail Card (Right Side - 1 column on large screens) */}
          <div className="lg:col-span-1">
            {selectedReview ? (
              <div className="sticky top-6">
                <ReviewModerationCard
                  review={selectedReview}
                  onReviewUpdated={handleReviewUpdated}
                  showFullDetails={true}
                />
              </div>
            ) : (
              <div className="sticky top-6 rounded-lg border border-gray-200 bg-white p-8 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  İnceleme Seçilmedi
                </h3>
                <p className="text-sm text-gray-500">
                  Detayları görüntülemek için bir inceleme seçin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
