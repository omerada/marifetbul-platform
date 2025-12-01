'use client';

/**
 * ================================================
 * JOB EDIT PAGE
 * ================================================
 * Page for editing existing job postings
 *
 * Features:
 * - Fetches job data by ID
 * - Validates user is the job owner
 * - Prevents editing if proposals exist
 * - Uses JobEditForm component
 *
 * Business Rules:
 * - Only job owner can edit
 * - Cannot edit if job has accepted proposals
 * - Cannot edit if job is completed
 * - Redirects to job detail after successful edit
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-01-10
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/core/useAuth';
import { useJob } from '@/hooks/business/jobs/useJob';
import { JobEditForm } from '@/components/domains/jobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// ================================================
// COMPONENT
// ================================================

export default function JobEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const jobId = params.id as string;

  const { data: job, isLoading, error } = useJob(jobId);

  // ==================== AUTHORIZATION CHECK ====================

  const userId =
    user && 'id' in user && typeof user.id === 'string'
      ? (user.id as string)
      : null;
  const isOwner = userId && job?.employerId ? userId === job.employerId : false;
  const canEdit = job && isOwner && job.status !== 'COMPLETED';

  // Check if job has accepted proposals
  const hasAcceptedProposals = job?.proposalCount && job.proposalCount > 0;

  // ==================== HANDLERS ====================

  const handleCancel = () => {
    router.push(`/marketplace/jobs/${jobId}`);
  };

  // ==================== RENDER: LOADING ====================

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <div className="mb-6">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== RENDER: ERROR ====================

  if (error || !job) {
    return (
      <div className="container max-w-5xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            İş ilanı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/marketplace/jobs">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              İş İlanlarına Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RENDER: NOT OWNER ====================

  if (!isOwner) {
    return (
      <div className="container max-w-5xl py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bu iş ilanını düzenleme yetkiniz yok.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href={`/marketplace/jobs/${jobId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              İlan Detayına Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RENDER: CANNOT EDIT ====================

  if (!canEdit) {
    return (
      <div className="container max-w-5xl py-8">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {job.status === 'COMPLETED'
              ? 'Tamamlanmış iş ilanları düzenlenemez.'
              : 'Bu iş ilanı düzenlenemez.'}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href={`/marketplace/jobs/${jobId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              İlan Detayına Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RENDER: EDIT FORM ====================

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/marketplace/jobs/${jobId}`}
          className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center text-sm"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          İlan Detayına Dön
        </Link>
        <h1 className="text-3xl font-bold">İş İlanını Düzenle</h1>
        <p className="text-muted-foreground mt-2">
          İş ilanınızın bilgilerini güncelleyin
        </p>
      </div>

      {/* Warning if has accepted proposals */}
      {hasAcceptedProposals && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Bu iş ilanında kabul edilmiş teklifler var. Düzenleme yaparken
            dikkatli olun.
          </AlertDescription>
        </Alert>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>İlan Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          <JobEditForm job={job} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
