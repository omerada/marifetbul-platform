'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardContent, Loading } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import { User, Briefcase, Star, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuthStore();

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Dashboard yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Hoş geldin, {user.firstName}!
                </h1>
                <p className="mt-1 text-gray-600">
                  {user.userType === 'freelancer'
                    ? "Freelancer Dashboard'ın"
                    : "İşveren Dashboard'ın"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    user.userType === 'freelancer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.userType === 'freelancer' ? 'Freelancer' : 'İşveren'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {user.userType === 'freelancer' ? (
            <FreelancerDashboard />
          ) : (
            <EmployerDashboard />
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function FreelancerDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Kazanç
                </p>
                <p className="text-2xl font-bold text-gray-900">₺0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Aktif Projeler
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Ortalama Puan
                </p>
                <p className="text-2xl font-bold text-gray-900">5.0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Profil Görüntüleme
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Hızlı İşlemler
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">
                Hizmet Paketi Oluştur
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Yeni bir hizmet paketi oluştur
              </p>
            </div>
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Profili Düzenle</h3>
              <p className="mt-1 text-sm text-gray-600">
                Profilini güncelleştir
              </p>
            </div>
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">İş İlanlarını Gör</h3>
              <p className="mt-1 text-sm text-gray-600">
                Yeni iş fırsatlarını keşfet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmployerDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Toplam Harcama
                </p>
                <p className="text-2xl font-bold text-gray-900">₺0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Aktif İş İlanları
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Alınan Teklifler
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tamamlanan Projeler
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <User className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            Hızlı İşlemler
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">İş İlanı Ver</h3>
              <p className="mt-1 text-sm text-gray-600">
                Yeni bir iş ilanı oluştur
              </p>
            </div>
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Freelancer Ara</h3>
              <p className="mt-1 text-sm text-gray-600">Uzmanları keşfet</p>
            </div>
            <div className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">Teklifleri Gör</h3>
              <p className="mt-1 text-sm text-gray-600">
                Gelen teklifleri incele
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
