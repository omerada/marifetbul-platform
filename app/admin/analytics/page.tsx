'use client';

import { lazy, Suspense } from 'react';
import { BarChart3 } from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { LoadingPageSkeleton } from '@/components/ui/UnifiedLoadingSystem';

// Lazy load the heavy AdminAnalytics component
const AdminAnalytics = lazy(() =>
  import('@/components/domains/admin').then((module) => ({
    default: module.AdminAnalytics,
  }))
);

export default function AdminAnalyticsPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="border-b border-gray-200/50 bg-white px-6 py-6 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Platform Analitikleri
                </h1>
                <p className="mt-1 text-gray-600">
                  Kapsamlı görüşler ve performans metrikleri
                </p>
              </div>
            </div>
          </div>
        </div>
        <Suspense
          fallback={
            <LoadingPageSkeleton
              hasHeader={true}
              hasSidebar={false}
              contentLines={8}
            />
          }
        >
          <AdminAnalytics />
        </Suspense>
      </div>
    </UnifiedErrorBoundary>
  );
}
