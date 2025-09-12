'use client';

import { ServiceDetail } from '@/components/features';
import { useParams } from 'next/navigation';

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  return <ServiceDetail packageId={packageId} />;
}
