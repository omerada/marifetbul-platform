'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrendingUp, Eye, DollarSign, Users, BarChart3 } from 'lucide-react';

export default function FreelancerAnalyticsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">İstatistikler</h1>
        <p className="mt-1 text-gray-600">
          Performansınızı ve kazançlarınızı analiz edin
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kazanç</p>
              <p className="mt-1 text-2xl font-bold text-green-600">₺0</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profil Görüntüleme</p>
              <p className="mt-1 text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan İş</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">0</p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Başarı Oranı</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">0%</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <Card className="p-8 text-center">
        <BarChart3 className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          İstatistikler yükleniyor
        </h3>
        <p className="mt-2 text-gray-500">
          İşlem geçmişiniz oluştukça detaylı analizler burada görünecek
        </p>
      </Card>
    </div>
  );
}
