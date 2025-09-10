/**
 * Location Demo Page
 * Lokasyon özelliklerini test etmek için demo sayfası
 */

'use client';

import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout/AppLayout';

// LocationDemo componentini ayrı dosya olarak oluşturacağız
const LocationDemoContent = dynamic(() => import('./LocationDemoContent'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <p className="text-gray-600">Lokasyon demo yükleniyor...</p>
      </div>
    </div>
  ),
});

export default function LocationDemoPage() {
  return (
    <AppLayout>
      <LocationDemoContent />
    </AppLayout>
  );
}
