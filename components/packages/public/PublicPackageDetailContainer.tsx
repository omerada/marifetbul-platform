'use client';

/**
 * Public Package Detail Container
 * Data fetching for customer-facing package page
 *
 * Note: View tracking is handled automatically by backend
 * when packageApi.getPackageBySlug is called (no duplicate tracking needed)
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { packageApi } from '@/lib/api/packages';
import { PublicPackageDetail } from './PublicPackageDetail';
import { Button } from '@/components/ui';
import type { Package } from '@/types/business/features/package';
import { transformServicePackageToPackage } from '@/lib/transformers/package.transformer';
import logger from '@/lib/infrastructure/monitoring/logger';

export function PublicPackageDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const packageSlug = params.slug as string;

  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch package by slug
      const response = await packageApi.getPackageBySlug(packageSlug);

      // Transform ServicePackage to Package
      if (response) {
        const transformed = transformServicePackageToPackage(response);
        setPackageData(transformed);
      } else {
        setError('Paket bulunamadı.');
      }
    } catch (err) {
      setError('Paket bulunamadı.');
      logger.error(
        'Failed to fetch package:',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setLoading(false);
    }
  }, [packageSlug]);

  useEffect(() => {
    if (packageSlug) {
      fetchPackage();
    }
  }, [packageSlug, fetchPackage]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error || 'Paket bulunamadı.'}</p>
        <Button
          onClick={() => router.push('/marketplace/packages')}
          variant="outline"
          className="mt-4"
        >
          Mağazaya Dön
        </Button>
      </div>
    );
  }

  return <PublicPackageDetail package={packageData} />;
}
