'use client';

import { useParams } from 'next/navigation';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { AppLayout } from '@/components/layout';
import { ServiceDetail } from '@/components/features/ServiceDetail';
import { Loading } from '@/components/ui';

export default function ServiceDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  const {
    currentPackage: servicePackage,
    isLoading,
    error,
  } = usePackageDetail(packageId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Loading size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !servicePackage) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              Hizmet Bulunamadı
            </h1>
            <p className="mb-6 text-gray-600">
              Aradığınız hizmet mevcut değil veya kaldırılmış olabilir.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ServiceDetail servicePackage={servicePackage} />
    </AppLayout>
  );
}
