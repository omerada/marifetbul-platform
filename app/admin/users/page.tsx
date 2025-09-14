'use client';

import { lazy } from 'react';
import { LazyAdminWrapper } from '@/components/admin/LazyAdminWrapper';

// Lazy load the heavy UserManagement component
const UserManagement = lazy(() => import('@/components/admin/UserManagement/UserManagement'));

export default function AdminUsersPage() {
  return (
    <LazyAdminWrapper title="Kullanıcı Yönetimi">
      <div className="p-6">
        <UserManagement />
      </div>
    </LazyAdminWrapper>
  );
}
