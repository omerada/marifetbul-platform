import { Metadata } from 'next';
import { UserTable } from '@/components/admin/UserTable';

export const metadata: Metadata = {
  title: 'User Management - Admin Panel',
  description: 'Manage platform users, roles, and permissions',
};

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-gray-600">
          Manage platform users, roles, and permissions
        </p>
      </div>

      <UserTable />
    </div>
  );
}
