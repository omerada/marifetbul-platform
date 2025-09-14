'use client';

import { lazy } from 'react';
import { LazyAdminWrapper } from '@/components/admin/LazyAdminWrapper';

// Lazy load the heavy AdminModeration component
const AdminModeration = lazy(() => import('@/components/admin/AdminModeration'));

export default function AdminModerationPage() {
  return (
    <LazyAdminWrapper title="İçerik Denetimi">
      <AdminModeration />
    </LazyAdminWrapper>
  );
}
