'use client';

import { lazy, Suspense } from 'react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { LoadingPageSkeleton } from '@/components/ui/UnifiedLoadingSystem';

// Lazy load the heavy AdminModeration component
const AdminModeration = lazy(() =>
  import('@/components/admin').then((module) => ({
    default: module.AdminModeration,
  }))
);

export default function AdminModerationPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">İçerik Denetimi</h1>
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
          <AdminModeration />
        </Suspense>
      </div>
    </UnifiedErrorBoundary>
  );
}
