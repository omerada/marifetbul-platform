/**
 * Dashboard Snapshot Widget
 *
 * Example component demonstrating snapshot hooks usage.
 * Displays real-time dashboard statistics in header or quick stats area.
 *
 * Features:
 * - Auto-refresh based on user role
 * - Loading states
 * - Error handling
 * - Responsive design
 *
 * @sprint Sprint 1 - Story 2: Dashboard Snapshot System
 * @version 1.0.0
 * @date November 6, 2025
 * @author MarifetBul Team
 */

'use client';

import React from 'react';
import { useAuthState } from '@/hooks/business';
import {
  usePlatformSnapshot,
  useSellerSnapshot,
  useBuyerSnapshot,
} from '@/hooks/business';
import { SystemStatus } from '@/types/backend/dashboard';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

// ==================== Platform Snapshot Widget (Admin) ====================

export function PlatformSnapshotWidget() {
  const { data, isLoading, error, refresh } = usePlatformSnapshot();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-6 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>Veriler yüklenemedi</span>
        <button onClick={refresh} className="ml-2 underline">
          Tekrar Dene
        </button>
      </div>
    );
  }

  const getStatusColor = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.HEALTHY:
        return 'text-green-600';
      case SystemStatus.DEGRADED:
        return 'text-yellow-600';
      case SystemStatus.CRITICAL:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.HEALTHY:
        return 'Sağlıklı';
      case SystemStatus.DEGRADED:
        return 'Düşük Performans';
      case SystemStatus.CRITICAL:
        return 'Kritik';
      default:
        return 'Bilinmeyen';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* System Status */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Sistem Durumu</div>
        <div
          className={`text-2xl font-bold ${getStatusColor(data.systemStatus)}`}
        >
          {getStatusLabel(data.systemStatus)}
        </div>
      </div>

      {/* Total Users */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Toplam Kullanıcı</div>
        <div className="text-2xl font-bold text-gray-900">
          {data.totalUsers.toLocaleString('tr-TR')}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Bugün: {data.activeUsersToday.toLocaleString('tr-TR')}
        </div>
      </div>

      {/* Active Orders */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Aktif Siparişler</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.activeOrders.toLocaleString('tr-TR')}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Bekleyen: {data.pendingOrders.toLocaleString('tr-TR')}
        </div>
      </div>

      {/* Total Revenue */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Toplam Gelir</div>
        <div className="text-2xl font-bold text-green-600">
          {data.totalRevenue.toLocaleString('tr-TR')} ₺
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Bugün: {data.revenueToday.toLocaleString('tr-TR')} ₺
        </div>
      </div>
    </div>
  );
}

// ==================== Seller Snapshot Widget (Freelancer) ====================

export function SellerSnapshotWidget() {
  const { data, isLoading, error, refresh } = useSellerSnapshot();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-6 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>Veriler yüklenemedi</span>
        <button onClick={refresh} className="ml-2 underline">
          Tekrar Dene
        </button>
      </div>
    );
  }

  const getTrendIcon = (rate: number) => {
    if (rate > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rate < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Total Earnings */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Toplam Kazanç</div>
        <div className="text-2xl font-bold text-gray-900">
          {data.totalEarnings.toLocaleString('tr-TR')} ₺
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {getTrendIcon(data.earningsGrowthRate)}
          <span
            className={
              data.earningsGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
            }
          >
            {Math.abs(data.earningsGrowthRate).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Available Balance */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Kullanılabilir Bakiye</div>
        <div className="text-2xl font-bold text-green-600">
          {data.availableBalance.toLocaleString('tr-TR')} ₺
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Bekleyen: {data.pendingBalance.toLocaleString('tr-TR')} ₺
        </div>
      </div>

      {/* Active Orders */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Aktif Siparişler</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.activeOrders}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Tamamlanan: {data.completedOrders}
        </div>
      </div>

      {/* Rating */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Ortalama Puan</div>
        <div className="text-2xl font-bold text-yellow-600">
          {data.averageRating.toFixed(1)} ⭐
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {data.totalReviews} değerlendirme
        </div>
      </div>
    </div>
  );
}

// ==================== Buyer Snapshot Widget (Employer) ====================

export function BuyerSnapshotWidget() {
  const { data, isLoading, error, refresh } = useBuyerSnapshot();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-6 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle className="h-4 w-4" />
        <span>Veriler yüklenemedi</span>
        <button onClick={refresh} className="ml-2 underline">
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* Total Spent */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Toplam Harcama</div>
        <div className="text-2xl font-bold text-gray-900">
          {data.totalSpent.toLocaleString('tr-TR')} ₺
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Bu ay: {data.spentThisMonth.toLocaleString('tr-TR')} ₺
        </div>
      </div>

      {/* Active Orders */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Aktif Siparişler</div>
        <div className="text-2xl font-bold text-blue-600">
          {data.activeOrders}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Tamamlanan: {data.completedOrders}
        </div>
      </div>

      {/* Favorites */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Favori Paketler</div>
        <div className="text-2xl font-bold text-purple-600">
          {data.favoritePackages}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {data.recommendedPackagesCount} öneri
        </div>
      </div>

      {/* Pending Actions */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="mb-1 text-sm text-gray-600">Bekleyen İşlem</div>
        <div className="text-2xl font-bold text-orange-600">
          {data.pendingActions.ordersToApprove +
            data.pendingActions.ordersToReview}
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Onay: {data.pendingActions.ordersToApprove}, İnceleme:{' '}
          {data.pendingActions.ordersToReview}
        </div>
      </div>
    </div>
  );
}

// ==================== Unified Snapshot Widget (Role-based) ====================

/**
 * Automatically shows the right snapshot widget based on user role
 */
export function DashboardSnapshotWidget() {
  const { user } = useAuthState();

  if (!user) {
    return null;
  }

  if (user.role === 'admin') {
    return <PlatformSnapshotWidget />;
  }

  if (user.userType === 'freelancer') {
    return <SellerSnapshotWidget />;
  }

  if (user.userType === 'employer') {
    return <BuyerSnapshotWidget />;
  }

  return null;
}

// ==================== Compact Header Widget ====================

/**
 * Compact version for page headers
 */
export function SnapshotHeaderWidget() {
  const { user } = useAuthState();
  const sellerSnapshot = useSellerSnapshot(user?.userType === 'freelancer');
  const buyerSnapshot = useBuyerSnapshot(user?.userType === 'employer');

  if (!user) return null;

  if (user.userType === 'freelancer' && sellerSnapshot.data) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-600">Bakiye:</span>{' '}
          <span className="font-semibold text-green-600">
            {sellerSnapshot.data.availableBalance.toLocaleString('tr-TR')} ₺
          </span>
        </div>
        <div>
          <span className="text-gray-600">Aktif:</span>{' '}
          <span className="font-semibold">
            {sellerSnapshot.data.activeOrders}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Puan:</span>{' '}
          <span className="font-semibold text-yellow-600">
            {sellerSnapshot.data.averageRating.toFixed(1)} ⭐
          </span>
        </div>
      </div>
    );
  }

  if (user.userType === 'employer' && buyerSnapshot.data) {
    return (
      <div className="flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-600">Aktif:</span>{' '}
          <span className="font-semibold">
            {buyerSnapshot.data.activeOrders}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Favori:</span>{' '}
          <span className="font-semibold text-purple-600">
            {buyerSnapshot.data.favoritePackages}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Bekleyen:</span>{' '}
          <span className="font-semibold text-orange-600">
            {buyerSnapshot.data.pendingActions.ordersToApprove +
              buyerSnapshot.data.pendingActions.ordersToReview}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
