'use client';

/**
 * Package Detail Page Container
 * Fetches and displays package details for seller
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { packageApi } from '@/lib/api/packages';
import { PackageDetailView } from '@/components/packages/detail';
import { Button } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Package } from '@/types/business/features/package';

interface PackageAnalytics {
  viewsToday: number;
  ordersToday: number;
  revenue: number;
  conversionRate: number;
}

export function PackageDetailContainer() {
  const params = useParams();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [analytics, setAnalytics] = useState<PackageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const packageData = await packageApi.getPackageById(packageId);
      setPkg(packageData as any);

      // Analytics: Backend API endpoint required
      // Expected endpoint: GET /api/v1/packages/{packageId}/analytics
      // Response format: { viewsToday, ordersToday, totalOrders, revenue, rating, reviewCount }
      // const analyticsData = await packageApi.getPackageAnalytics(packageId);
      // setAnalytics(analyticsData);

      // Mock analytics for now (replace with actual API call)
      setAnalytics({
        viewsToday: Math.floor(Math.random() * 50),
        ordersToday: Math.floor(Math.random() * 5),
        revenue: Math.floor(Math.random() * 10000),
        conversionRate: Math.random() * 10,
      });
    } catch (err) {
      setError('Paket yüklenirken bir hata oluştu');
      logger.error(
        'Failed to fetch package:',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId, fetchPackage]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">{error || 'Paket bulunamadı'}</p>
        <Link href="/marketplace/packages">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Paketlere Dön
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Link href="/marketplace/packages">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Paketlere Dön
        </Button>
      </Link>

      {/* Package Detail */}
      <PackageDetailView package={pkg} analytics={analytics || undefined} />
    </div>
  );
}
