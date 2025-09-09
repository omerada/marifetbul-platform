'use client';

import { useParams } from 'next/navigation';
import { useJob } from '@/hooks/useJobs';
import { AppLayout } from '@/components/layout';
import { JobDetail } from '@/components/features/JobDetail';
import { Loading } from '@/components/ui';

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.id as string;

  const { job, isLoading, error } = useJob(jobId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Loading size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (error || !job) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">
              İş İlanı Bulunamadı
            </h1>
            <p className="mb-6 text-gray-600">
              Aradığınız iş ilanı mevcut değil veya kaldırılmış olabilir.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <JobDetail job={job} />
    </AppLayout>
  );
}
