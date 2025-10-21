'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Package, Clock, DollarSign } from 'lucide-react';

export default function FreelancerOrdersPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="mt-1 text-gray-600">
            Aktif ve geçmiş siparişlerinizi görüntüleyin
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif Siparişler</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">0</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Orders List */}
      <Card className="p-8 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz siparişiniz yok
        </h3>
        <p className="mt-2 text-gray-500">
          İş ilanlarına teklif vererek ilk siparişinizi alın
        </p>
        <Link href="/marketplace/jobs">
          <Button className="mt-4">İş İlanlarını Görüntüle</Button>
        </Link>
      </Card>
    </div>
  );
}
