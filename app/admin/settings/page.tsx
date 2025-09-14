'use client';

import { lazy } from 'react';
import { LazyAdminWrapper } from '@/components/admin/LazyAdminWrapper';

// Lazy load the heavy AdminSettings component
const AdminSettings = lazy(() => import('@/components/admin/AdminSettings'));

export default function AdminSettingsPage() {
  return (
    <LazyAdminWrapper title="Platform Ayarları">
      <AdminSettings />
    </LazyAdminWrapper>
  );
}
