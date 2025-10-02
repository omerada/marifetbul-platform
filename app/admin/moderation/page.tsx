'use client';

import { lazy, Suspense } from 'react';
import { Shield } from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { LoadingPageSkeleton } from '@/components/ui/UnifiedLoadingSystem';

// Lazy load the heavy AdminModeration component
const AdminModeration = lazy(() =>
  import('@/components/domains/admin').then((module) => ({
    default: module.AdminModeration,
  }))
);

export default function AdminModerationPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  İçerik Denetimi
                </h1>
                <p className="mt-1 text-gray-600">
                  Platform içeriğini ve kullanıcı raporlarını inceleyin ve
                  denetleyin
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
          <AdminModeration />
        </Suspense>
      </div>
    </UnifiedErrorBoundary>
  );
}
