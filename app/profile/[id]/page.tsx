'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Freelancer, Employer } from '@/types';
import { AppLayout } from '@/components/layout';
import { FreelancerProfile } from '@/components/features';
import { EmployerProfile } from '@/components/features';
import { Loading } from '@/components/ui';

export default function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${params.id}`);
        if (!response.ok) {
          throw new Error('Kullanıcı bulunamadı');
        }
        const userData = await response.json();
        setUser(userData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <Loading size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Profil Bulunamadı
            </h1>
            <p className="mb-6 text-gray-600">
              {error || 'Aradığınız kullanıcı profili bulunamadı.'}
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {user.userType === 'freelancer' ? (
          <FreelancerProfile user={user as Freelancer} />
        ) : (
          <EmployerProfile user={user as Employer} />
        )}
      </div>
    </AppLayout>
  );
}
