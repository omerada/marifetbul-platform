import { Metadata } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'Admin Panel - Marifeto',
  description: 'Admin panel for managing platform settings, users, and content',
};

interface AdminLayoutPageProps {
  children: React.ReactNode;
}

export default function AdminLayoutPage({ children }: AdminLayoutPageProps) {
  return <AdminLayout>{children}</AdminLayout>;
}
