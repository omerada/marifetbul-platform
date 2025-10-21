'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Package, Plus, Search, Filter } from 'lucide-react';

export default function FreelancerPackagesPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paketlerim</h1>
          <p className="mt-1 text-gray-600">
            Sunduğunuz hizmet paketlerini yönetin
          </p>
        </div>
        <Link href="/marketplace/packages/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Yeni Paket Ekle
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Paket ara..."
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtrele
          </Button>
        </div>
      </Card>

      {/* Packages List */}
      <Card className="p-8 text-center">
        <Package className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz paketiniz yok
        </h3>
        <p className="mt-2 text-gray-500">
          İlk hizmet paketinizi oluşturarak müşterilere ulaşın
        </p>
        <Link href="/marketplace/packages/create">
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            İlk Paketimi Oluştur
          </Button>
        </Link>
      </Card>
    </div>
  );
}
