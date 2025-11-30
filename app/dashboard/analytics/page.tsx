'use client';

/**
 * ================================================
 * UNIFIED DASHBOARD ANALYTICS PAGE
 * ================================================
 * Role-agnostic analytics dashboard
 *
 * Route: /dashboard/analytics
 * Access: Authenticated users (Freelancer & Employer)
 *
 * Features:
 * - Automatic role detection (Freelancer/Employer)
 * - Freelancer: Proposal analytics, success metrics, performance score
 * - Employer: Job posting analytics, proposal statistics, conversion rates
 * - Export to CSV/PDF
 * - Interactive charts and visualizations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Task 1.2
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  Users,
  Clock,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useProposals } from '@/hooks/business/proposals';
import { useJobs } from '@/hooks/business/jobs/useJobs';
import {
  exportJobAnalyticsToCSV,
  exportJobAnalyticsToPDF,
  prepareJobAnalyticsExportData,
} from '@/lib/utils/export-job-analytics';
import {
  EmptyAnalyticsState,
  AnalyticsLoadingState,
  AnalyticsErrorState,
} from '@/components/domains/jobs/analytics/EmptyAnalyticsState';

/**
 * Freelancer Analytics Data
 */
interface FreelancerAnalytics {
  totalProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  pendingProposals: number;
  withdrawnProposals: number;
  acceptanceRate: number;
  rejectionRate: number;
  avgProposedBudget: number;
  totalProposedAmount: number;
  topCategory: string;
  statusDistribution: {
    PENDING: number;
    ACCEPTED: number;
    REJECTED: number;
    WITHDRAWN: number;
    SHORTLISTED: number;
  };
}

/**
 * Employer Analytics Data
 */
interface EmployerAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalProposals: number;
  totalViews: number;
  avgProposalsPerJob: number;
  avgViewsPerJob: number;
  topCategory: string;
  statusDistribution: {
    DRAFT: number;
    OPEN: number;
    IN_PROGRESS: number;
    COMPLETED: number;
    CLOSED: number;
  };
}

export default function UnifiedAnalyticsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { proposals, isLoading: proposalsLoading } = useProposals({});
  const { jobs, isLoading: jobsLoading, error: jobsError } = useJobs();

  const [isExporting, setIsExporting] = useState(false);
  const [freelancerAnalytics, setFreelancerAnalytics] =
    useState<FreelancerAnalytics>({
      totalProposals: 0,
      acceptedProposals: 0,
      rejectedProposals: 0,
      pendingProposals: 0,
      withdrawnProposals: 0,
      acceptanceRate: 0,
      rejectionRate: 0,
      avgProposedBudget: 0,
      totalProposedAmount: 0,
      topCategory: '',
      statusDistribution: {
        PENDING: 0,
        ACCEPTED: 0,
        REJECTED: 0,
        WITHDRAWN: 0,
        SHORTLISTED: 0,
      },
    });

  const [employerAnalytics, setEmployerAnalytics] = useState<EmployerAnalytics>(
    {
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
    }
  );

  // Determine user role
  const userRole = user?.role;
  const isFreelancer = userRole === 'FREELANCER';
  const isEmployer = userRole === 'EMPLOYER';

  // Jobs are fetched automatically by useJobs hook

  // Calculate Freelancer Analytics
  useEffect(() => {
    if (isFreelancer && proposals && proposals.length > 0) {
      const total = proposals.length;
      const accepted = proposals.filter((p) => p.status === 'ACCEPTED').length;
      const rejected = proposals.filter((p) => p.status === 'REJECTED').length;
      const pending = proposals.filter((p) => p.status === 'PENDING').length;
      const withdrawn = proposals.filter(
        (p) => p.status === 'WITHDRAWN'
      ).length;

      const totalAmount = proposals.reduce(
        (sum, p) => sum + (p.proposedBudget || 0),
        0
      );

      const statusDist = proposals.reduce(
        (acc, proposal) => {
          acc[
            proposal.status as keyof FreelancerAnalytics['statusDistribution']
          ] =
            (acc[
              proposal.status as keyof FreelancerAnalytics['statusDistribution']
            ] || 0) + 1;
          return acc;
        },
        { PENDING: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0, SHORTLISTED: 0 }
      );

      // Find most common category
      const categoryCount = proposals.reduce(
        (acc, proposal) => {
          const cat = proposal.jobTitle.split(' - ')[0] || 'Diğer'; // Extract category from job title
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topCat =
        Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'N/A';

      setFreelancerAnalytics({
        totalProposals: total,
        acceptedProposals: accepted,
        rejectedProposals: rejected,
        pendingProposals: pending,
        withdrawnProposals: withdrawn,
        acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
        rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
        avgProposedBudget: total > 0 ? Math.round(totalAmount / total) : 0,
        totalProposedAmount: totalAmount,
        topCategory: topCat,
        statusDistribution: statusDist,
      });
    }
  }, [isFreelancer, proposals]);

  // Calculate Employer Analytics
  useEffect(() => {
    if (isEmployer && jobs && jobs.length > 0) {
      const total = jobs.length;
      const active = jobs.filter((j) => j.status === 'OPEN').length;
      const proposalsCount = jobs.reduce(
        (sum, j) => sum + (j.proposalCount || 0),
        0
      );
      const views = jobs.reduce((sum, j) => sum + (j.viewCount || 0), 0);

      const statusDist = jobs.reduce(
        (acc, job) => {
          acc[job.status as keyof EmployerAnalytics['statusDistribution']] =
            (acc[job.status as keyof EmployerAnalytics['statusDistribution']] ||
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

      setEmployerAnalytics({
        totalJobs: total,
        activeJobs: active,
        totalProposals: proposalsCount,
        totalViews: views,
        avgProposalsPerJob: total > 0 ? Math.round(proposalsCount / total) : 0,
        avgViewsPerJob: total > 0 ? Math.round(views / total) : 0,
        topCategory: topCat,
        statusDistribution: statusDist,
      });
    }
  }, [isEmployer, jobs]);

  // Export handlers for employers
  const handleExportCSV = () => {
    if (!isEmployer || !jobs || jobs.length === 0) return;

    setIsExporting(true);
    try {
      const exportData = prepareJobAnalyticsExportData(
        jobs,
        employerAnalytics,
        user?.email || 'İşveren'
      );
      exportJobAnalyticsToCSV(exportData, {
        filename: `is-ilani-analitigi-${new Date().toISOString().split('T')[0]}.csv`,
        includeDetails: true,
        locale: 'tr',
      });
    } catch (_error) {
      // CSV export failed - silent fail
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!isEmployer || !jobs || jobs.length === 0) return;

    setIsExporting(true);
    try {
      const exportData = prepareJobAnalyticsExportData(
        jobs,
        employerAnalytics,
        user?.email || 'İşveren'
      );
      await exportJobAnalyticsToPDF(exportData, {
        filename: `is-ilani-analitigi-${new Date().toISOString().split('T')[0]}.pdf`,
        includeDetails: true,
        locale: 'tr',
      });
    } catch (_error) {
      // PDF export failed - silent fail
    } finally {
      setIsExporting(false);
    }
  };

  // Loading states
  if (authLoading || proposalsLoading || jobsLoading) {
    return <AnalyticsLoadingState />;
  }

  // Error state (Employer only)
  if (isEmployer && jobsError) {
    return (
      <AnalyticsErrorState
        error={jobsError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Empty state - no data yet
  if (
    (isFreelancer && (!proposals || proposals.length === 0)) ||
    (isEmployer && (!jobs || jobs.length === 0))
  ) {
    return <EmptyAnalyticsState />;
  }

  // FREELANCER VIEW
  if (isFreelancer) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard&apos;a Dön
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Teklif Analitiği
            </h1>
            <p className="text-gray-600">Teklif performansınızı görüntüleyin</p>
          </div>
          <BarChart3 className="h-12 w-12 text-blue-600" />
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Teklif
              </CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {freelancerAnalytics.totalProposals}
              </div>
              <p className="text-muted-foreground text-xs">
                {freelancerAnalytics.pendingProposals} beklemede
              </p>
            </CardContent>
          </Card>

          {/* Acceptance Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kabul Oranı</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {freelancerAnalytics.acceptanceRate}%
              </div>
              <p className="text-muted-foreground text-xs">
                {freelancerAnalytics.acceptedProposals} kabul edildi
              </p>
            </CardContent>
          </Card>

          {/* Rejection Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Red Oranı</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {freelancerAnalytics.rejectionRate}%
              </div>
              <p className="text-muted-foreground text-xs">
                {freelancerAnalytics.rejectedProposals} reddedildi
              </p>
            </CardContent>
          </Card>

          {/* Average Budget */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ortalama Teklif
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺{freelancerAnalytics.avgProposedBudget.toLocaleString('tr-TR')}
              </div>
              <p className="text-muted-foreground text-xs">Teklif başına</p>
            </CardContent>
          </Card>

          {/* Total Proposed Amount */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Teklif Tutarı
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₺
                {freelancerAnalytics.totalProposedAmount.toLocaleString(
                  'tr-TR'
                )}
              </div>
              <p className="text-muted-foreground text-xs">Tüm teklifler</p>
            </CardContent>
          </Card>

          {/* Top Category */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Çok Teklif Verilen
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {freelancerAnalytics.topCategory}
              </div>
              <p className="text-muted-foreground text-xs">Kategori</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Teklif Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(freelancerAnalytics.statusDistribution).map(
                ([status, count]) => {
                  const percentage =
                    freelancerAnalytics.totalProposals > 0
                      ? (count / freelancerAnalytics.totalProposals) * 100
                      : 0;
                  const labels: Record<string, string> = {
                    PENDING: 'Beklemede',
                    SHORTLISTED: 'Ön Seçildi',
                    ACCEPTED: 'Kabul Edildi',
                    REJECTED: 'Reddedildi',
                    WITHDRAWN: 'Geri Çekildi',
                  };
                  const colors: Record<string, string> = {
                    PENDING: 'bg-yellow-500',
                    SHORTLISTED: 'bg-blue-500',
                    ACCEPTED: 'bg-green-500',
                    REJECTED: 'bg-red-500',
                    WITHDRAWN: 'bg-gray-500',
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

        {/* Success Metrics */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Score */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Performans Skoru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <div className="text-5xl font-bold text-green-600">
                  {freelancerAnalytics.acceptanceRate}
                </div>
                <div className="text-sm text-green-700">/ 100</div>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Kabul Oranı:</span>
                  <span className="font-semibold">
                    {freelancerAnalytics.acceptanceRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Toplam Kazanılan:</span>
                  <span className="font-semibold">
                    {freelancerAnalytics.acceptedProposals}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">
                💡 İyileştirme Önerileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-blue-800">
                {freelancerAnalytics.acceptanceRate < 20 && (
                  <li>• Teklif fiyatlarınızı gözden geçirin</li>
                )}
                {freelancerAnalytics.acceptanceRate >= 20 &&
                  freelancerAnalytics.acceptanceRate < 40 && (
                    <li>• Kapak mektubunuzu güçlendirin</li>
                  )}
                {freelancerAnalytics.acceptanceRate >= 40 && (
                  <li>• Harika performans! Devam edin</li>
                )}
                <li>• Portfolio&apos;nuzu güncel tutun</li>
                <li>• İlanları dikkatlice okuyun</li>
                <li>• Gerçekçi teslimat süreleri belirtin</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // EMPLOYER VIEW
  if (isEmployer) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard&apos;a Dön
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              İş İlanı Analitiği
            </h1>
            <p className="text-gray-600">
              İş ilanlarınızın performansını görüntüleyin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV İndir
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              PDF İndir
            </Button>
            <BarChart3 className="h-12 w-12 text-blue-600" />
          </div>
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
              <div className="text-2xl font-bold">
                {employerAnalytics.totalJobs}
              </div>
              <p className="text-muted-foreground text-xs">
                {employerAnalytics.activeJobs} aktif ilan
              </p>
            </CardContent>
          </Card>

          {/* Total Proposals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Teklif
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employerAnalytics.totalProposals}
              </div>
              <p className="text-muted-foreground text-xs">
                Ortalama {employerAnalytics.avgProposalsPerJob} teklif/ilan
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
              <div className="text-2xl font-bold">
                {employerAnalytics.totalViews}
              </div>
              <p className="text-muted-foreground text-xs">
                Ortalama {employerAnalytics.avgViewsPerJob} görüntülenme/ilan
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
              <div className="text-2xl font-bold">
                {employerAnalytics.topCategory}
              </div>
              <p className="text-muted-foreground text-xs">
                İlanlarınızın çoğu bu kategoride
              </p>
            </CardContent>
          </Card>

          {/* Conversion Rate */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Dönüşüm Oranı
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employerAnalytics.totalViews > 0
                  ? Math.round(
                      (employerAnalytics.totalProposals /
                        employerAnalytics.totalViews) *
                        100
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
                {employerAnalytics.totalJobs > 0
                  ? Math.round(
                      (employerAnalytics.statusDistribution.COMPLETED /
                        employerAnalytics.totalJobs) *
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>İlan Durum Dağılımı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(employerAnalytics.statusDistribution).map(
                ([status, count]) => {
                  const percentage =
                    employerAnalytics.totalJobs > 0
                      ? (count / employerAnalytics.totalJobs) * 100
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
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <h3 className="mb-2 font-semibold text-blue-900">💡 İpuçları</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Detaylı iş tanımları daha fazla görüntülenme sağlar</li>
              <li>• Uygun bütçe aralığı belirleme teklif sayısını artırır</li>
              <li>
                • Kategori seçimi doğru yapıldığında daha kaliteli teklifler
                gelir
              </li>
              <li>• İlanları düzenli güncellemek görünürlüğü artırır</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback (should not happen)
  return null;
}
