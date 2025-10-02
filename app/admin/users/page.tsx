'use client';

import { Suspense } from 'react';
import { Users } from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { LoadingPageSkeleton } from '@/components/ui/UnifiedLoadingSystem';
import { UserTable } from '@/components/domains/admin';

export default function AdminUsersPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Kullanıcı Yönetimi
                </h1>
                <p className="mt-1 text-gray-600">
                  Platform kullanıcılarını, rollerini ve izinlerini yönetin
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            <Suspense
              fallback={
                <LoadingPageSkeleton
                  hasHeader={true}
                  hasSidebar={false}
                  contentLines={8}
                />
              }
            >
              <UserTable />
            </Suspense>
          </div>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
