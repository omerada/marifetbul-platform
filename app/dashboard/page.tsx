'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Loading } from '@/components/ui';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'freelancer':
          redirect('/dashboard/freelancer');
          break;
        case 'employer':
          redirect('/dashboard/employer');
          break;
        case 'admin':
        case 'moderator':
          redirect('/admin');
          break;
        default:
          redirect('/');
      }
    } else if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loading size="lg" text="Y�nlendiriliyor..." />
    </div>
  );
}
