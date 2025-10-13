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

        // TODO: Replace with real backend API call
        // Suggested endpoint: GET /api/v1/users/{id}/profile
        // Backend should return User with role-specific data (Freelancer/Employer)
        // Mock freelancer data - REMOVE THIS AFTER BACKEND INTEGRATION
        const mockFreelancer: Freelancer = {
          id: params.id as string,
          email: 'ahmet.yilmaz@example.com',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          avatar: '',
          userType: 'freelancer',
          accountStatus: 'active',
          verificationStatus: 'verified',
          phone: '+90 555 123 4567',
          location: 'İstanbul, Türkiye',
          bio: 'Deneyimli bir web geliştirici olarak 5+ yıldır modern web teknolojileriyle çalışıyorum. React, Node.js ve TypeScript konularında uzmanım. Müşteri memnuniyetini ön planda tutarak, kaliteli ve zamanında teslim edilen projeler üretmeyi hedefliyorum.',
          website: 'https://ahmetyilmaz.dev',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/ahmetyilmaz',
            github: 'https://github.com/ahmetyilmaz',
          },
          createdAt: '2023-01-15T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
          title: 'Full Stack Web Developer',
          skills: [
            'React',
            'Node.js',
            'TypeScript',
            'Next.js',
            'MongoDB',
            'PostgreSQL',
            'AWS',
            'Docker',
          ],
          hourlyRate: 250,
          experience: 'expert',
          rating: 4.8,
          totalReviews: 127,
          reviewCount: 127,
          totalEarnings: 125000,
          completedJobs: 89,
          completedProjects: 89,
          responseTime: '2 saat',
          availability: true,
          portfolio: [
            {
              id: '1',
              title: 'E-ticaret Platformu',
              description:
                'Modern ve kullanıcı dostu e-ticaret sitesi. React ve Node.js kullanılarak geliştirildi.',
              imageUrl: '/images/portfolio-1.jpg',
              images: ['/images/portfolio-1.jpg'],
              url: 'https://example-ecommerce.com',
              tags: ['Web Geliştirme', 'E-ticaret'],
              skills: ['React', 'Node.js', 'MongoDB', 'Stripe'],
              completedAt: '2024-01-10T00:00:00Z',
            },
            {
              id: '2',
              title: 'Kurumsal Web Sitesi',
              description:
                'Şirket için responsive kurumsal web sitesi tasarımı ve geliştirilmesi.',
              imageUrl: '/images/portfolio-2.jpg',
              images: ['/images/portfolio-2.jpg'],
              url: 'https://example-corporate.com',
              tags: ['Web Tasarım', 'Kurumsal'],
              skills: ['Next.js', 'TypeScript', 'Tailwind CSS'],
              completedAt: '2023-12-15T00:00:00Z',
            },
          ],
          languages: ['Türkçe', 'İngilizce'],
          isOnline: true,
        };

        setUser(mockFreelancer);
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

  const handleEditProfile = () => {
    window.location.href = '/profile/edit';
  };

  const handleSendMessage = () => {
    window.location.href = `/messages?user=${params.id}`;
  };

  const handleHire = () => {
    window.location.href = `/jobs/create?freelancer=${params.id}`;
  };

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

  const isOwnProfile = currentUser?.id === params.id;

  return (
    <AppLayout>
      {user.userType === 'freelancer' ? (
        <ProfileView
          freelancer={user as Freelancer}
          isOwnProfile={isOwnProfile}
          onEditProfile={handleEditProfile}
          onSendMessage={handleSendMessage}
          onHire={handleHire}
        />
      ) : (
        <EmployerProfile user={user as Employer} />
      )}
    </AppLayout>
  );
}
