'use client';

import { useParams } from 'next/navigation';
import { ServiceDetail } from '@/components/domains/packages';

export default function ServiceDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  return <ServiceDetail packageId={packageId} />;
}
