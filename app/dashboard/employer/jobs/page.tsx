'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Loading } from '@/components/ui';
import { Briefcase, Plus } from 'lucide-react';
import { JobCard } from '@/components/domains/marketplace/marketplace/JobCard';
import { JobListFilters } from '@/components/domains/marketplace/JobListFilters';
import type { JobListFilters as JobListFiltersType } from '@/components/domains/marketplace/JobListFilters';
import { useJobs, useJobProposals } from '@/hooks';

export default function EmployerJobsPage() {
  // Filters state
  const [filters, setFilters] = useState<JobListFiltersType>({
    proposalFilter: 'all',
  });

  // Fetch jobs (employer's own jobs)
  const { jobs, isLoading: jobsLoading } = useJobs(1, 100, {
    search: filters.search,
    category: filters.category,
    // Add employer-specific filter here if API supports it
  });

  // Extract job IDs for proposal summary
  const jobIds = useMemo(() => {
    return jobs?.map((job) => job.id) || [];
  }, [jobs]);

  // Fetch proposal summaries
  const {
    proposalsByJob,
    getTotalUnreadCount,
    loading: proposalsLoading,
  } = useJobProposals({
    jobIds,
    autoFetch: jobIds.length > 0,
    enablePolling: true,
    pollingInterval: 60000, // 1 minute
  });

  // Calculate proposal counts for filters
  const proposalCounts = useMemo(() => {
    const summaries = Object.values(proposalsByJob);
    return {
      total: summaries.filter((s) => s.totalCount > 0).length,
      new: summaries.filter((s) => s.unreadCount > 0).length,
      pending: summaries.filter((s) => s.pendingCount > 0).length,
      accepted: summaries.filter((s) => s.acceptedCount > 0).length,
    };
  }, [proposalsByJob]);

  // Filter jobs based on proposal filter
  const filteredJobs = useMemo(() => {
    if (!jobs) return [];

    let filtered = jobs;

    // Apply proposal filter
    if (filters.proposalFilter && filters.proposalFilter !== 'all') {
      filtered = filtered.filter((job) => {
        const summary = proposalsByJob[job.id];
        if (!summary) return false;

        switch (filters.proposalFilter) {
          case 'with-proposals':
            return summary.totalCount > 0;
          case 'new-proposals':
            return summary.unreadCount > 0;
          case 'pending':
            return summary.pendingCount > 0;
          case 'accepted':
            return summary.acceptedCount > 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [jobs, proposalsByJob, filters.proposalFilter]);

  const loading = jobsLoading || proposalsLoading;

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İş İlanlarım</h1>
          <p className="mt-1 text-gray-600">
            Yayınladığınız iş ilanlarını yönetin ve teklifleri inceleyin
          </p>
        </div>
        <Link href="/marketplace/jobs/create">
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Yeni İlan Oluştur
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <JobListFilters
          filters={filters}
          onFiltersChange={setFilters}
          showProposalFilters={true}
          proposalCounts={proposalCounts}
          totalJobs={jobs?.length}
          loading={loading}
        />
      </Card>

      {/* Jobs List */}
      {loading ? (
        <Card className="p-12">
          <Loading size="lg" text="İş ilanları yükleniyor..." />
        </Card>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {/* Results summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredJobs.length} ilan bulundu
              {getTotalUnreadCount() > 0 && (
                <span className="ml-2 font-medium text-blue-600">
                  ({getTotalUnreadCount()} yeni teklif)
                </span>
              )}
            </span>
          </div>

          {/* Job cards */}
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              layout="list"
              showEmployerFeatures={true}
            />
          ))}
        </div>
      ) : jobs && jobs.length > 0 ? (
        <Card className="p-8 text-center">
          <Briefcase className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Filtreye uygun ilan bulunamadı
          </h3>
          <p className="mt-2 text-gray-500">
            Farklı filtreler deneyerek arama yapabilirsiniz
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              setFilters({
                proposalFilter: 'all',
              })
            }
          >
            Filtreleri Temizle
          </Button>
        </Card>
      ) : (
        <Card className="p-8 text-center">
          <Briefcase className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Henüz iş ilanınız yok
          </h3>
          <p className="mt-2 text-gray-500">
            İlk iş ilanınızı oluşturarak freelancer&apos;lara ulaşın
          </p>
          <Link href="/marketplace/jobs/create">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              İlk İlanımı Oluştur
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
