/**
 * ================================================
 * ADMIN REVIEW MODERATION PAGE
 * ================================================
 * Modern admin interface for review moderation
 * Uses UnifiedReviewQueue for zero duplication
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @author MarifetBul Development Team
 * @version 3.0.0 - Unified Components
 * @updated November 6, 2025
 */

'use client';

import { UnifiedReviewQueue } from '@/components/domains/moderation/shared';

/**
 * Admin Review Moderation Page
 *
 * Features:
 * - Unified component shared with moderator
 * - Role-based admin actions (delete, resolve flags)
 * - Stats dashboard with key metrics
 * - Tabs for pending, flagged, and all reviews
 * - Search and filter functionality
 * - Bulk operations support
 * - Individual review actions
 * - Responsive layout
 */
export default function AdminReviewModerationPage() {
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

        {/* Unified Review Queue - Role: Admin */}
        <UnifiedReviewQueue
          role="admin"
          initialStatus="pending"
          showStats={true}
          enableBulkActions={true}
          viewMode="card"
        />
      </div>
    </div>
  );
}
