'use client';

import { useParams } from 'next/navigation';
import { JobDetail } from '@/components/features/JobDetail';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  return <JobDetail jobId={jobId} />;
}
