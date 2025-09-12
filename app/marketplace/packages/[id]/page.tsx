'use client';

import { useParams } from 'next/navigation';
import { ServiceDetail } from '@/components/features/ServiceDetail';

export default function ServiceDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  return <ServiceDetail packageId={packageId} />;
}
