'use client';

/**
 * ================================================
 * PROPOSAL ANALYTICS DASHBOARD
 * ================================================
 * Freelancer's proposal performance analytics
 *
 * Features:
 * - Total proposals by status
 * - Acceptance/rejection rates
 * - Category distribution
 * - Average proposed budget
 * - Response time analytics
 * - Success metrics
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-20
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { useProposals } from '@/hooks/business/proposals';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProposalAnalyticsPage() {
  const router = useRouter();
  const { proposals, isLoading } = useProposals({});

  const [analytics, setAnalytics] = useState({
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

  useEffect(() => {
    if (proposals && proposals.length > 0) {
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
          acc[proposal.status as keyof typeof analytics.statusDistribution] =
            (acc[
              proposal.status as keyof typeof analytics.statusDistribution
            ] || 0) + 1;
          return acc;
        },
        { PENDING: 0, ACCEPTED: 0, REJECTED: 0, WITHDRAWN: 0, SHORTLISTED: 0 }
      );

      // Find most common category from job data
      const categoryCount = proposals.reduce(
        (acc, proposal) => {
          const cat = proposal.jobCategory || 'Diğer';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topCat =
        Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        'N/A';

      setAnalytics({
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
  }, [proposals]);

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
            onClick={() => router.push('/dashboard/my-proposals')}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Tekliflerime Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Teklif Analitiği</h1>
          <p className="text-gray-600">Teklif performansınızı görüntüleyin</p>
        </div>
        <BarChart3 className="h-12 w-12 text-blue-600" />
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Proposals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Teklif</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProposals}</div>
            <p className="text-muted-foreground text-xs">
              {analytics.pendingProposals} beklemede
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
              {analytics.acceptanceRate}%
            </div>
            <p className="text-muted-foreground text-xs">
              {analytics.acceptedProposals} kabul edildi
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
              {analytics.rejectionRate}%
            </div>
            <p className="text-muted-foreground text-xs">
              {analytics.rejectedProposals} reddedildi
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
              ₺{analytics.avgProposedBudget.toLocaleString('tr-TR')}
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
              ₺{analytics.totalProposedAmount.toLocaleString('tr-TR')}
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
            <div className="text-2xl font-bold">{analytics.topCategory}</div>
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
            {Object.entries(analytics.statusDistribution).map(
              ([status, count]) => {
                const percentage =
                  analytics.totalProposals > 0
                    ? (count / analytics.totalProposals) * 100
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
                {analytics.acceptanceRate}
              </div>
              <div className="text-sm text-green-700">/ 100</div>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex justify-between">
                <span>Kabul Oranı:</span>
                <span className="font-semibold">
                  {analytics.acceptanceRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Toplam Kazanılan:</span>
                <span className="font-semibold">
                  {analytics.acceptedProposals}
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
              {analytics.acceptanceRate < 20 && (
                <li>• Teklif fiyatlarınızı gözden geçirin</li>
              )}
              {analytics.acceptanceRate >= 20 &&
                analytics.acceptanceRate < 40 && (
                  <li>• Kapak mektubunuzu güçlendirin</li>
                )}
              {analytics.acceptanceRate >= 40 && (
                <li>• Harika performans! Devam edin</li>
              )}
              <li>• Portfolio'nuzu güncel tutun</li>
              <li>• İlanları dikkatlice okuyun</li>
              <li>• Gerçekçi teslimat süreleri belirtin</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
