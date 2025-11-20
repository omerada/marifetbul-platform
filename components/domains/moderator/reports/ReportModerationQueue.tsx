'use client';

/**
 * ================================================
 * REPORT MODERATION QUEUE COMPONENT
 * ================================================
 * Main component for report moderation interface
 *
 * Sprint 1 - Story 3, Task 3.1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Pagination } from '@/components/ui/Pagination';
import { AlertCircle, CheckCircle, Flag, XCircle } from 'lucide-react';
import { useReportModeration } from '@/hooks/business/moderation/useReportModeration';
import type { ReportAction } from '@/hooks/business/moderation/useReportModeration';
import { ReportCard } from './ReportCard';
import { ReportFilters } from './ReportFilters';
import { ReportDetailModal } from './ReportDetailModal';

export function ReportModerationQueue() {
  const [page, setPage] = useState(0);
  const [filters] = useState<'all' | 'pending' | 'assigned'>('all');
  const [detailReportId, setDetailReportId] = useState<string | null>(null);

  const {
    reports,
    stats,
    pagination,
    isLoading,
    assignToMe,
    resolve,
    dismiss,
    escalate,
    refresh,
  } = useReportModeration({
    autoFetch: true,
    filters: {
      status:
        filters === 'all'
          ? undefined
          : filters === 'pending'
            ? 'PENDING'
            : 'INVESTIGATING',
    },
    pageSize: 20,
  });

  // Handle assign to self
  const handleAssignToSelf = useCallback(
    async (reportId: string) => {
      const success = await assignToMe(reportId);
      if (success) {
        refresh();
      }
    },
    [assignToMe, refresh]
  );

  // Handle resolve
  const handleResolve = useCallback(
    async (reportId: string, action: string, notes?: string) => {
      const success = await resolve(
        reportId,
        action as ReportAction,
        notes || ''
      );
      if (success) {
        setDetailReportId(null);
        refresh();
      }
    },
    [resolve, refresh]
  );

  // Handle dismiss
  const handleDismiss = useCallback(
    async (reportId: string, reason: string) => {
      const success = await dismiss(reportId, reason);
      if (success) {
        setDetailReportId(null);
        refresh();
      }
    },
    [dismiss, refresh]
  );

  // Handle escalate
  const handleEscalate = useCallback(
    async (reportId: string, reason: string) => {
      const success = await escalate(reportId, reason);
      if (success) {
        setDetailReportId(null);
        refresh();
      }
    },
    [escalate, refresh]
  );

  const detailReport = reports.find((r) => r.id === detailReportId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Rapor Moderasyonu</h1>
          <p className="text-muted-foreground">
            Kullanıcı raporlarını inceleyin ve çözüm uygulayın
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3">
                <Flag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Toplam</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Bekleyen</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Çözümlendi</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Reddedildi</p>
                <p className="text-2xl font-bold">{stats.dismissed}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <ReportFilters onFilterChange={() => setPage(0)} />

      {/* Reports List */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Yükleniyor...</p>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Rapor bulunamadı</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewDetails={() => setDetailReportId(report.id)}
              onAssignToSelf={() => handleAssignToSelf(report.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page + 1}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage - 1)}
          />
        </div>
      )}

      {/* Detail Modal */}
      {detailReport && (
        <ReportDetailModal
          report={detailReport}
          isOpen={!!detailReportId}
          onClose={() => setDetailReportId(null)}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
          onEscalate={handleEscalate}
        />
      )}
    </div>
  );
}
