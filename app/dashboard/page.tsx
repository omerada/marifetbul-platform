'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // User not authenticated, redirect to login
        router.replace('/login');
      } else {
        // Redirect based on user type
        const dashboardPath =
          user.role === 'freelancer'
            ? '/dashboard/freelancer'
            : '/dashboard/employer';
        router.replace(dashboardPath);
      }
    }
  }, [user, isLoading, router]);

  // Show loading while determining redirect
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2 text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}
