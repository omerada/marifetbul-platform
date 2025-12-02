/**
 * ================================================
 * MODERATOR FLAGGED COMMENTS PAGE
 * ================================================
 * Moderator page for reviewing flagged comments
 * Part of Sprint 1 Comment Moderation UI completion
 *
 * Route: /moderator/flagged-comments
 * Access: Moderator role
 *
 * Features:
 * - View flagged comments assigned to moderator
 * - Limited actions compared to admin
 * - Statistics overview
 *
 * @version 1.0.0
 * @sprint Sprint 2 - Dashboard Integration
 * @created December 2, 2025
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { Flag } from 'lucide-react';
import {
  FlaggedCommentsQueue,
  FlagStatisticsWidget,
} from '@/components/domains/moderation/shared';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';

export const dynamic = 'force-dynamic';

/**
 * Moderator Flagged Comments Page
 *
 * Same components as admin, but with moderator role
 * Backend handles permission differences
 */
export default function ModeratorFlaggedCommentsPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Flagged Yorumlar
                </h1>
                <p className="mt-1 text-gray-600">
                  Raporlanan yorumları inceleyin ve değerlendirin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6">
            {/* Statistics Widget - Compact mode for moderator */}
            <FlagStatisticsWidget compact={true} autoRefresh={true} />

            {/* Flagged Comments Queue - Moderator role */}
            <FlaggedCommentsQueue
              role="moderator"
              autoRefresh={true}
              refreshInterval={30000}
            />
          </div>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
