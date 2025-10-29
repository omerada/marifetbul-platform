/**
 * ================================================
 * ADMIN MODERATION DASHBOARD PAGE
 * ================================================
 * Dedicated page for comment moderation overview
 * Shows stats, pending comments, and recent activity
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { Shield } from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { CommentModerationSummary } from '@/components/admin/dashboard/CommentModerationSummary';

export default function AdminModerationDashboardPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Moderasyon Paneli
                </h1>
                <p className="mt-1 text-gray-600">
                  Yorum moderasyonu genel bakış ve istatistikler
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <CommentModerationSummary />
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
