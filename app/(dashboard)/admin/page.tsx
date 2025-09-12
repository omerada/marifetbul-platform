import { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Marifeto',
  description: 'Main admin dashboard with platform overview and metrics',
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
