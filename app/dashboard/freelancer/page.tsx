import React from 'react';
import { Loading } from '@/components/ui';
import { lazy, Suspense } from 'react';

// Force dynamic due to client components
export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Lazy load the component to avoid client-server mismatch
const FreelancerDashboard = lazy(() =>
  import('@/components/domains/dashboard').then((mod) => ({
    default: mod.FreelancerDashboard,
  }))
);

export default function FreelancerDashboardPage() {
  return (
    <Suspense
      fallback={<Loading size="lg" text="Loading freelancer dashboard..." />}
    >
      <FreelancerDashboard />
    </Suspense>
  );
}
