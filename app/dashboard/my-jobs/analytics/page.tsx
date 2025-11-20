'use client';

/**
 * ================================================
 * JOB ANALYTICS DASHBOARD
 * ================================================
 * Employer's job posting performance analytics
 *
 * Features:
 * - Total jobs by status
 * - Proposal statistics
 * - View count analytics
 * - Category distribution
 * - Average response time
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-20
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Eye,
  Users,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { useJobs } from '@/hooks/business/jobs/useJobs';
import { Skeleton } from '@/components/ui/skeleton';

export default function JobAnalyticsPage() {
  const router = useRouter();
  const { jobs, isLoading, fetchMyJobs } = useJobs();
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalProposals: 0,
    totalViews: 0,
    avgProposalsPerJob: 0,
    avgViewsPerJob: 0,
    topCategory: '',
    statusDistribution: {
      DRAFT: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CLOSED: 0,
    },
  });

  useEffect(() => {
    fetchMyJobs({ page: 0, size: 100 });
  }, [fetchMyJobs]);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      const total = jobs.length;
      const active = jobs.filter((j) => j.status === 'OPEN').length;
      const proposals = jobs.reduce(
        (sum, j) => sum + (j.proposalCount || 0),
        0
      );
      const views = jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0);

      const statusDist = jobs.reduce(
        (acc, job) => {
          acc[job.status as keyof typeof analytics.statusDistribution] =
            (acc[job.status as keyof typeof analytics.statusDistribution] ||
              0) + 1;
          return acc;
        },
        { DRAFT: 0, OPEN: 0, IN_PROGRESS: 0, COMPLETED: 0, CLOSED: 0 }
      );

      // Find most common category
      const categoryCount = jobs.reduce(
        (acc, job) => {
          const cat = job.category?.name || 'Diğer';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topCat =
        Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'N/A';

      setAnalytics({
        totalJobs: total,
        activeJobs: active,
        totalProposals: proposals,
        totalViews: views,
        avgProposalsPerJob: total > 0 ? Math.round(proposals / total) : 0,
        avgViewsPerJob: total > 0 ? Math.round(views / total) : 0,
        topCategory: topCat,
        statusDistribution: statusDist,
      });
    }
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/my-jobs')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            İşlerime Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            İş İlanı Analitiği
          </h1>
          <p className="text-gray-600">
            İş ilanlarınızın performansını görüntüleyin
          </p>
        </div>
        <BarChart3 className="h-12 w-12 text-blue-600" />
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam İş İlanı
            </CardTitle>
            <Briefcase className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalJobs}</div>
            <p className="text-muted-foreground text-xs">
              {analytics.activeJobs} aktif ilan
            </p>
          </CardContent>
        </Card>

        {/* Total Proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProposals}</div>
            <p className="text-muted-foreground text-xs">
              Ortalama {analytics.avgProposalsPerJob} teklif/ilan
            </p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Görüntülenme
            </CardTitle>
            <Eye className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <p className="text-muted-foreground text-xs">
              Ortalama {analytics.avgViewsPerJob} görüntülenme/ilan
            </p>
          </CardContent>
        </Card>

        {/* Top Category */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En Çok Kullanılan Kategori
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topCategory}</div>
            <p className="text-muted-foreground text-xs">
              İlanlarınızın çoğu bu kategoride
            </p>
          </CardContent>
        </Card>

        {/* Conversion Rate (Proposals to Views) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
            <Clock className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalViews > 0
                ? Math.round(
                    (analytics.totalProposals / analytics.totalViews) * 100
                  )
                : 0}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              Görüntülenmeden teklif alma oranı
            </p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tamamlanma Oranı
            </CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalJobs > 0
                ? Math.round(
                    (analytics.statusDistribution.COMPLETED /
                      analytics.totalJobs) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-muted-foreground text-xs">
              İşlerin tamamlanma oranı
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>İlan Durum Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.statusDistribution).map(
              ([status, count]) => {
                const percentage =
                  analytics.totalJobs > 0
                    ? (count / analytics.totalJobs) * 100
                    : 0;
                const labels: Record<string, string> = {
                  DRAFT: 'Taslak',
                  OPEN: 'Açık',
                  IN_PROGRESS: 'Devam Ediyor',
                  COMPLETED: 'Tamamlandı',
                  CLOSED: 'Kapalı',
                };
                const colors: Record<string, string> = {
                  DRAFT: 'bg-gray-500',
                  OPEN: 'bg-green-500',
                  IN_PROGRESS: 'bg-blue-500',
                  COMPLETED: 'bg-purple-500',
                  CLOSED: 'bg-red-500',
                };

                return (
                  <div key={status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">{labels[status]}</span>
                      <span className="text-muted-foreground">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full ${colors[status]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="mt-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="mb-2 font-semibold text-blue-900">💡 İpuçları</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Detaylı iş tanımları daha fazla görüntülenme sağlar</li>
            <li>• Uygun bütçe aralığı belirleme teklif sayısını artırır</li>
            <li>
              • Kategori seçimi doğru yapıldığında daha kaliteli teklifler gelir
            </li>
            <li>• İlanları düzenli güncellemek görünürlüğü artırır</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
