'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Users, Search, Filter } from 'lucide-react';

export default function EmployerFreelancersPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Freelancer&apos;lar
          </h1>
          <p className="mt-1 text-gray-600">
            Çalıştığınız freelancer&apos;ları görüntüleyin
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Freelancer ara..."
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

      {/* Freelancers List */}
      <Card className="p-8 text-center">
        <Users className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz çalıştığınız freelancer yok
        </h3>
        <p className="mt-2 text-gray-500">
          Siparişler tamamlandıkça burada görünecek
        </p>
        <Link href="/marketplace">
          <Button className="mt-4">
            <Search className="mr-2 h-4 w-4" />
            Freelancer Bul
          </Button>
        </Link>
      </Card>
    </div>
  );
}
