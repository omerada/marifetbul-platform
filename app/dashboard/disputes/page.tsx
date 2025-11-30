/**
 * ================================================
 * USER DISPUTE DASHBOARD
 * ================================================
 * Sprint 1 - Day 4.2: User-facing dispute list page
 *
 * Features:
 * - List all user's disputes (as buyer or seller)
 * - Status filtering (all, open, resolved, escalated)
 * - Quick actions (view detail, add evidence)
 * - Empty state for no disputes
 * - Real-time updates via WebSocket
 * - Responsive design
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Dispute System
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  ChevronLeft,
  FileText,
  Filter,
  Flag,
  Package,
  RefreshCcw,
  Shield,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Button, Loading } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { getMyDisputes } from '@/lib/api/disputes';
import type { DisputeResponse } from '@/types/dispute';
import {
  disputeStatusLabels,
  disputeReasonLabels,
  disputeStatusColors,
  isDisputeResolved,
} from '@/types/dispute';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { formatDate } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

type FilterStatus = 'all' | 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED';

// ================================================
// COMPONENT
// ================================================

export default function UserDisputeDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = (searchParams?.get('status') as FilterStatus) || 'all';

  const [disputes, setDisputes] = useState<DisputeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] =
    useState<FilterStatus>(statusFilter);

  // Load user's disputes
  const loadDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyDisputes();
      setDisputes(data);
    } catch (error) {
      logger.error(
        'Failed to fetch disputes:',
        error
      );
      toast.error('Veri Yüklenemedi', {
        description: 'İtirazlar yüklenirken bir hata oluştu.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  // Filter disputes by status
  const filteredDisputes = disputes.filter((dispute) => {
    if (selectedFilter === 'all') return true;
    return dispute.status === selectedFilter;
  });

  // Handle filter change
  const handleFilterChange = (filter: FilterStatus) => {
    setSelectedFilter(filter);

    // Update URL
    const url = new URL(window.location.href);
    if (filter === 'all') {
      url.searchParams.delete('status');
    } else {
      url.searchParams.set('status', filter);
    }
    window.history.pushState({}, '', url.toString());
  };

  // Calculate statistics
  const stats = {
    total: disputes.length,
    open: disputes.filter((d) => d.status === 'OPEN').length,
    underReview: disputes.filter((d) => d.status === 'UNDER_REVIEW').length,
    resolved: disputes.filter((d) => isDisputeResolved(d)).length,
    escalated: disputes.filter((d) => d.status === 'ESCALATED').length,
  };

  // Filter options
  const filterOptions: Array<{
    value: FilterStatus;
    label: string;
    count: number;
  }> = [
    { value: 'all', label: 'Tümü', count: stats.total },
    { value: 'OPEN', label: 'Açık', count: stats.open },
    { value: 'UNDER_REVIEW', label: 'İnceleniyor', count: stats.underReview },
    { value: 'ESCALATED', label: 'Yükseltildi', count: stats.escalated },
    { value: 'RESOLVED', label: 'Çözüldü', count: stats.resolved },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" text="İtirazlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <Shield className="h-6 w-6 text-purple-600" />
                İtirazlarım
              </h1>
              <p className="mt-1 text-gray-600">
                Tüm itirazlarınızı görüntüleyin ve yönetin
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={loadDisputes}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="rounded-full bg-gray-100 p-3">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Açık</p>
                <p className="mt-1 text-2xl font-bold text-blue-600">
                  {stats.open}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">İnceleniyor</p>
                <p className="mt-1 text-2xl font-bold text-yellow-600">
                  {stats.underReview}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yükseltildi</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {stats.escalated}
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3">
                <Flag className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Çözüldü</p>
                <p className="mt-1 text-2xl font-bold text-green-600">
                  {stats.resolved}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Card className="mb-6 p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="h-5 w-5 flex-shrink-0 text-gray-400" />
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedFilter === option.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                  <Badge
                    className={`${
                      selectedFilter === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {option.count}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Disputes List */}
        {filteredDisputes.length === 0 ? (
          <Card className="p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-gray-100 p-6">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {selectedFilter === 'all'
                  ? 'Henüz itiraz yok'
                  : `${filterOptions.find((f) => f.value === selectedFilter)?.label} itiraz bulunamadı`}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {selectedFilter === 'all'
                  ? 'Siparişlerinizle ilgili bir sorun yaşadığınızda itiraz oluşturabilirsiniz.'
                  : 'Bu kategoride görüntülenecek itiraz bulunmuyor.'}
              </p>
              {selectedFilter === 'all' && (
                <Link href="/dashboard/orders">
                  <Button variant="primary" className="mt-6">
                    <Package className="mr-2 h-4 w-4" />
                    Siparişlerime Git
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => (
              <Card
                key={dispute.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => router.push(`/dashboard/disputes/${dispute.id}`)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    {/* Left Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          İtiraz #{dispute.id.slice(0, 8)}
                        </h3>
                        <Badge className={disputeStatusColors[dispute.status]}>
                          {disputeStatusLabels[dispute.status]}
                        </Badge>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Sipariş #{dispute.orderId.slice(0, 8)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="h-4 w-4" />
                          {disputeReasonLabels[dispute.reason]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDistanceToNow(new Date(dispute.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm text-gray-700">
                        {dispute.description}
                      </p>

                      {/* Resolution Info (if resolved) */}
                      {isDisputeResolved(dispute) && dispute.resolution && (
                        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                          <p className="text-xs font-medium text-green-700">
                            Çözüm: {dispute.resolution}
                          </p>
                          {dispute.resolvedAt && (
                            <p className="mt-1 text-xs text-green-600">
                              {formatDate(dispute.resolvedAt)} tarihinde çözüldü
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Actions */}
                    <div className="ml-4 flex flex-col items-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/disputes/${dispute.id}`);
                        }}
                      >
                        Detaylar
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>

                      {!isDisputeResolved(dispute) && (
                        <Link
                          href={`/dashboard/orders/${dispute.orderId}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="sm">
                            Siparişe Git
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Help Section */}
        {disputes.length > 0 && (
          <Card className="mt-6 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-100 p-3">
                <AlertCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  İtiraz Süreci Hakkında
                </h3>
                <p className="mt-2 text-sm text-blue-800">
                  İtirazlarınız yönetim ekibimiz tarafından 24-48 saat içinde
                  incelenir. Süreci hızlandırmak için lütfen tüm gerekli
                  bilgileri ve kanıtları ekleyin. Sorularınız için{' '}
                  <Link
                    href="/support"
                    className="font-medium underline hover:text-blue-900"
                  >
                    destek ekibimizle
                  </Link>{' '}
                  iletişime geçebilirsiniz.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
