/**
 * ================================================
 * ADMIN USER MANAGEMENT PAGE
 * ================================================
 * Complete user management interface for admins
 *
 * Route: /admin/users
 * Access: Admin only (protected by middleware)
 *
 * Features:
 * - User statistics overview
 * - Advanced filtering & search
 * - Bulk actions
 * - User status management
 * - Role management
 * - Export functionality
 *
 * @version 1.0.0
 * @created 2025-11-17
 * @sprint Sprint 1: Admin Dashboard & User Management - Story 1.2
 * @author MarifetBul Development Team
 */

'use client';

import { Suspense } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { LoadingPageSkeleton } from '@/components/ui/UnifiedLoadingSystem';
import { UserTable } from '@/components/domains/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useUserManagement } from '@/hooks';

export const dynamic = 'force-dynamic';

/**
 * Stats Card Component - Reusable stat display
 */
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color = 'blue',
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp
              className={`h-3 w-3 ${trend.isPositive ? 'text-green-600' : 'rotate-180 text-red-600'}`}
            />
            <span
              className={trend.isPositive ? 'text-green-600' : 'text-red-600'}
            >
              {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Admin Users Page Component
 */
export default function AdminUsersPage() {
  const {
    statistics,
    isLoading: statsLoading,
    onFilterChange,
  } = useUserManagement();

  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Kullanıcı Yönetimi
                  </h1>
                  <p className="mt-1 text-gray-600">
                    Platform kullanıcılarını, rollerini ve izinlerini yönetin
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFilterChange({})}
                disabled={statsLoading}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`}
                />
                Yenile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Toplam Kullanıcı"
                value={statistics.total.toLocaleString('tr-TR')}
                icon={Users}
                subtitle="Kayıtlı üye sayısı"
                color="blue"
              />
              <StatCard
                title="Aktif Kullanıcı"
                value={statistics.active.toLocaleString('tr-TR')}
                icon={UserCheck}
                subtitle={`${Math.round((statistics.active / statistics.total) * 100)}% aktif`}
                color="green"
              />
              <StatCard
                title="Askıya Alınmış"
                value={statistics.suspended.toLocaleString('tr-TR')}
                icon={UserX}
                subtitle="Geçici olarak askıda"
                color="orange"
              />
              <StatCard
                title="Yasaklı"
                value={statistics.banned.toLocaleString('tr-TR')}
                icon={Shield}
                subtitle="Kalıcı yasak"
                color="red"
              />
              <StatCard
                title="Doğrulanmış"
                value={statistics.verified.toLocaleString('tr-TR')}
                icon={UserCheck}
                subtitle={`${Math.round((statistics.verified / statistics.total) * 100)}% doğrulandı`}
                color="purple"
              />
            </div>

            {/* Role Distribution */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Freelancer'lar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.freelancers.toLocaleString('tr-TR')}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.round(
                      (statistics.freelancers / statistics.total) * 100
                    )}
                    % toplam kullanıcı
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    İş Verenler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {statistics.employers.toLocaleString('tr-TR')}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {Math.round(
                      (statistics.employers / statistics.total) * 100
                    )}
                    % toplam kullanıcı
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Table */}
            <Suspense
              fallback={
                <LoadingPageSkeleton
                  hasHeader={false}
                  hasSidebar={false}
                  contentLines={8}
                />
              }
            >
              <UserTable />
            </Suspense>
          </div>
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
