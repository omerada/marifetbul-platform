/**
 * ================================================
 * CREATE JOB PAGE
 * ================================================
 * Page for creating new job postings with wizard
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Updated for Sprint 1
 * @created November 6, 2025
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JobPostingWizard } from '@/components/forms';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

export default function CreateJobPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  // Auth check
  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'employer') {
      router.push('/login?redirect=/marketplace/jobs/create');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.userType !== 'employer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Yeni İş İlanı Oluştur
          </h1>
          <p className="text-gray-600">
            Projeniz için en uygun freelancer&apos;ları bulun
          </p>
        </div>

        {/* Wizard */}
        <JobPostingWizard
          onComplete={(jobId) => {
            router.push(`/dashboard/my-jobs/${jobId}`);
          }}
          onCancel={() => {
            router.push('/dashboard/my-jobs');
          }}
        />
      </div>
    </div>
  );
}
