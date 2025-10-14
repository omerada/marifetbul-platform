'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Freelancer, Employer } from '@/types';
import { AppLayout } from '@/components/layout';
import { ProfileView } from '@/components/shared/features';
import { EmployerProfile } from '@/components/shared/features';
import { Loading } from '@/components/ui';
import { useProfile } from '@/hooks';

export default function ProfilePage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile: currentUser } = useProfile();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${params.id}/profile`,
          {
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError('Kullanıcı bulunamadı');
            return;
          }
          throw new Error('Profil yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setUser(data.data);
      } catch (err) {
        console.error('Profile fetch error:', err);
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
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {error || 'Kullanıcı bulunamadı'}
          </h1>
          <p className="text-gray-600">
            Aradığınız profil mevcut değil veya kaldırılmış olabilir.
          </p>
        </div>
      </AppLayout>
    );
  }

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <AppLayout>
      {user.userType === 'freelancer' ? (
        <ProfileView
          freelancer={user as Freelancer}
          isOwnProfile={isOwnProfile}
        />
      ) : (
        <EmployerProfile user={user as Employer} />
      )}
    </AppLayout>
  );
}
