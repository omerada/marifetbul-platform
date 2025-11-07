/**
 * ================================================
 * JOB PROPOSALS PAGE
 * ================================================
 * Display all proposals for a specific job (Employer view)
 *
 * Features:
 * - Job details header
 * - Proposal list with actions
 * - Status-based filtering
 * - Integration with useJobs hook
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1: Refactored with ProposalList component
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Loader2, AlertCircle } from 'lucide-react';
import { ProposalList } from '@/components/domains/proposals/ProposalList';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { useJobs } from '@/hooks/business/useJobs';

export default function JobProposalsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  // Hooks
  const { currentJob, isLoading, error, fetchJobById } = useJobs();

  // Load job details
  useEffect(() => {
    if (jobId) {
      fetchJobById(jobId);
    }
  }, [jobId, fetchJobById]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/my-jobs')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            İşlerime Dön
          </Button>

          {/* Loading State */}
          {isLoading && (
            <Card className="p-8">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
                <p className="text-sm text-gray-600">Yükleniyor...</p>
              </div>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Bir hata oluştu</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Job Details */}
          {currentJob && !isLoading && (
            <div className="mb-4 rounded-lg border bg-white p-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {currentJob.title}
              </h1>
              <p className="line-clamp-2 text-gray-600">
                {currentJob.description}
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Teklifler</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proposals List */}
        {!isLoading && currentJob && (
          <ProposalList jobId={jobId} canManage={true} />
        )}
      </div>
    </div>
  );
}
