import React from 'react';
import { EmployerDashboard } from '@/components/domains/dashboard';

// Force dynamic due to client components
export const dynamic = 'force-dynamic';

export default function EmployerDashboardPage() {
  return <EmployerDashboard />;
}
