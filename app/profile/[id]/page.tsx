/**
 * ================================================
 * PROFILE PAGE
 * ================================================
 * User profile display page with role-based views
 *
 * Features:
 * - Profile data fetching with hooks
 * - Role-based display (Freelancer/Employer)
 * - Loading and error states
 * - Own profile detection
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 3: Profile System Refactor
 */

'use client';

import { useParams } from 'next/navigation';
import { Freelancer, Employer } from '@/types';
import { AppLayout } from '@/components/layout';
import { ProfileView } from '@/components/shared/features';
import { EmployerProfile } from '@/components/shared/features';
import { Loading } from '@/components/ui';
import { useProfile, useProfilePermissions } from '@/hooks/business/profile';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  // Fetch profile data using hook
  const { data: user, isLoading, error } = useProfile(userId);

  // Get profile permissions
  const { isOwnProfile } = useProfilePermissions(userId);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !user) {
    const errorMessage =
      error instanceof Error ? error.message : error || 'Kullanıcı bulunamadı';

    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-md p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              {errorMessage}
            </h1>
            <p className="text-gray-600">
              Aradığınız profil mevcut değil veya kaldırılmış olabilir.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
