'use client';

/**
 * Package Edit Container
 * Pre-populates wizard with existing package data
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { packageApi } from '@/lib/api/packages';
import { PackageCreationWizard } from '@/components/packages/create';
import { Button } from '@/components/ui';
import type { Package } from '@/types/business/features/package';
import type { CreatePackageFormData } from '@/lib/validation/package';

export function PackageEditContainer() {
  const params = useParams();
  const packageId = params.id as string;

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const packageData = await packageApi.getPackageById(packageId);
      setPkg(packageData as any);
    } catch (err) {
      setError('Paket yüklenirken bir hata oluştu');
      console.error('Failed to fetch package:', err);
    } finally {
      setLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId, fetchPackage]);

  // Transform Package to FormData
  const getInitialValues = (): Partial<CreatePackageFormData> | undefined => {
    if (!pkg) return undefined;

    return {
      title: pkg.title,
      description: pkg.description,
      categoryId: pkg.categoryId,
      keywords: pkg.keywords,
      basicTier: pkg.basicTier,
      standardTier: pkg.standardTier || undefined,
      premiumTier: pkg.premiumTier || undefined,
      highlights: pkg.highlights,
      deliverables: pkg.deliverables,
      requirements: pkg.requirements,
      images: pkg.images,
      videoUrl: pkg.videoUrl || undefined,
      metaDescription: pkg.metaDescription || undefined,
    };
  };

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
        <Link href="/dashboard/freelancer/packages">
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
      <Link href={`/dashboard/freelancer/packages/${packageId}`}>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          İptal
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paketi Düzenle</h1>
        <p className="mt-2 text-gray-600">{pkg.title} paketini güncelleyin</p>
      </div>

      {/* Edit Wizard */}
      <PackageCreationWizard
        initialData={getInitialValues()}
        isEditing={true}
        packageId={packageId}
      />
    </div>
  );
}
