import { Suspense } from 'react';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { lazy } from 'react';

// Force dynamic due to client components
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lazy load the component to avoid client-server mismatch
const DashboardClient = lazy(() =>
  import('@/components/dashboard/DashboardClient').then((mod) => ({
    default: mod.DashboardClient,
  }))
);

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Dashboard</h1>
          <Suspense
            fallback={<Loading size="lg" text="Loading dashboard..." />}
          >
            <DashboardClient />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
}
