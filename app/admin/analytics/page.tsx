'use client';

import { lazy } from 'react';
import { LazyAdminWrapper } from '@/components/admin/LazyAdminWrapper';

// Lazy load the heavy AdminAnalytics component
const AdminAnalytics = lazy(() => import('@/components/admin/AdminAnalytics'));

export default function AdminAnalyticsPage() {
  return (
    <LazyAdminWrapper title="Platform Analitikleri">
      <AdminAnalytics />
    </LazyAdminWrapper>
  );
}
