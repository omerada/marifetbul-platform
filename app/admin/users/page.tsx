'use client';

import UserTable from '@/components/admin/UserTable';

export default function AdminUsersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="text-gray-600">
          Platform kullanıcılarını yönetin ve düzenleyin
        </p>
      </div>
      <UserTable />
    </div>
  );
}
