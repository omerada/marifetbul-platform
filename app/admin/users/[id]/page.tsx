/**
 * ================================================
 * ADMIN USER DETAIL PAGE
 * ================================================
 * Comprehensive user detail view with profile, stats, and actions
 * Part of Story 4: User Management Completion - Task 4.1
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2 Story 2.1 - Real API Integration
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity } from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';
import { adminUsersApi, type UserStatsDTO } from '@/lib/api/admin-users';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { AdminUserResponse } from '@/lib/api/admin-users';
import {
  UserProfileCard,
  UserStatsGrid,
  UserQuickActions,
  UserActivityTimeline,
} from '@/components/domains/admin/users';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Admin User Detail Page
 */
export default function AdminUserDetailPage({ params }: Props) {
  const router = useRouter();
  const { error: showError } = useToast();
  const [userId, setUserId] = useState<string>('');
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [stats, setStats] = useState<UserStatsDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showActivityTimeline, setShowActivityTimeline] = useState(false);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setUserId(p.id));
  }, [params]);

  // Fetch user data
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch user details and stats in parallel
        const [userResponse, statsResponse] = await Promise.all([
          adminUsersApi.getUserById(userId),
          adminUsersApi.getUserStats(userId),
        ]);

        if (!userResponse.success || !userResponse.data) {
          throw new Error(userResponse.message || 'Failed to fetch user');
        }

        if (!statsResponse.success || !statsResponse.data) {
          throw new Error(statsResponse.message || 'Failed to fetch stats');
        }

        setUser(userResponse.data);
        setStats(statsResponse.data);

        logger.info('User detail and stats loaded successfully', {
          component: 'AdminUserDetailPage',
          userId,
          stats: statsResponse.data,
        });
      } catch (err) {
        logger.error(
          'Failed to fetch user details',
          err instanceof Error ? err : new Error(String(err)),
          {
            component: 'AdminUserDetailPage',
            action: 'fetchUserData',
            userId,
          }
        );
        setError('Kullanıcı bilgileri yüklenemedi');
        showError('Hata', 'Kullanıcı bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, showError]);

  /**
   * Handle user update from quick actions
   */
  const handleUserUpdate = (updatedUser: AdminUserResponse) => {
    setUser(updatedUser);
  };

  /**
   * Navigate back to user list
   */
  const handleBack = () => {
    router.push('/admin/users');
  };

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">
              Kullanıcı bilgileri yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error State
   */
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">
              {error || 'Kullanıcı bulunamadı'}
            </p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kullanıcı Listesine Dön
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Success State - Render User Details
   */
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kullanıcı Detayları</h1>
            <p className="text-muted-foreground">
              {user.username} kullanıcısının detaylı bilgileri
            </p>
          </div>
        </div>

        {/* Activity Timeline Button */}
        <Button onClick={() => setShowActivityTimeline(true)} variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          Aktivite Geçmişi
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Profile & Quick Actions */}
        <div className="space-y-6 lg:col-span-1">
          {/* User Profile Card */}
          <UserProfileCard user={user} />

          {/* Quick Actions */}
          <UserQuickActions user={user} onUserUpdate={handleUserUpdate} />
        </div>

        {/* Right Column - Stats */}
        <div className="lg:col-span-2">
          {/* Stats Grid */}
          {stats && <UserStatsGrid stats={stats} />}
        </div>
      </div>

      {/* Activity Timeline Modal */}
      {showActivityTimeline && (
        <UserActivityTimeline
          userId={user.id}
          userName={user.username}
          open={showActivityTimeline}
          onClose={() => setShowActivityTimeline(false)}
        />
      )}
    </div>
  );
}
