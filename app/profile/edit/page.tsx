'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { AppLayout } from '@/components/layout';
import { ProfileEditForm } from '@/components/shared/features';
import { Loading } from '@/components/ui';

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loading size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Oturum Açmanız Gerekiyor
            </h1>
            <button
              onClick={() => router.push('/login')}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors"
            >
              Giriş Yap
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <ProfileEditForm user={user} />
      </div>
    </AppLayout>
  );
}
