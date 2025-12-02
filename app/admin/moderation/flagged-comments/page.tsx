/**
 * ================================================
 * FLAGGED COMMENTS MANAGEMENT PAGE
 * ================================================
 * Admin page for managing flagged/reported comments
 * Part of Sprint 1 Comment Moderation UI completion
 *
 * Route: /admin/moderation/flagged-comments
 * Access: Admin only
 *
 * Features:
 * - View all flagged comments with pagination
 * - Filter by status and category
 * - Resolve or dismiss flags
 * - Flag statistics overview
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Dashboard Integration
 * @created December 2, 2025
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { Flag, Shield } from 'lucide-react';
import {
  FlaggedCommentsQueue,
  FlagStatisticsWidget,
} from '@/components/domains/moderation/shared';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';

export const dynamic = 'force-dynamic';

/**
 * Flagged Comments Management Page
 *
 * Clean, production-ready page that uses Sprint 1 components
 * No code duplication, fully integrated with backend
 */
export default function FlaggedCommentsPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Flagged Yorumlar
                </h1>
                <p className="mt-1 text-gray-600">
                  Kullanıcılar tarafından raporlanan yorumları inceleyin ve
                  yönetin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6">
            {/* Statistics Widget */}
            <FlagStatisticsWidget autoRefresh={true} />

            {/* Flagged Comments Queue */}
            <FlaggedCommentsQueue
              role="admin"
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
