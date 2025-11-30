'use client';

/**
 * ================================================
 * REPORT FILTERS COMPONENT - ENHANCED
 * ================================================
 * Advanced filter panel for report moderation queue
 *
 * Sprint 2 - Story 3: Enhanced with 4 new filters
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Filter, X } from 'lucide-react';
import {
  ReportStatus,
  ReportPriority,
  ReportReason,
  type ReportFilters as ReportFiltersType,
} from '@/types/business/report';

export interface ReportFiltersProps {
  onFilterChange: (filters: ReportFiltersType) => void;
}

export function ReportFilters({ onFilterChange }: ReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filter state
  const [status, setStatus] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [priority, setPriority] = useState<string>(
    searchParams.get('priority') || 'all'
  );
  const [reportType, setReportType] = useState<string>(
    searchParams.get('type') || 'all'
  );
  const [assignee, setAssignee] = useState<string>(
    searchParams.get('assignee') || 'all'
  );
  const [dateFrom, setDateFrom] = useState<Date | null>(
    searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom')!)
      : null
  );
  const [dateTo, setDateTo] = useState<Date | null>(
    searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : null
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (status && status !== 'all') params.set('status', status);
    if (priority && priority !== 'all') params.set('priority', priority);
    if (reportType && reportType !== 'all') params.set('type', reportType);
    if (assignee && assignee !== 'all') params.set('assignee', assignee);
    if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params.set('dateTo', dateTo.toISOString());

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });

    // Build filters object and notify parent
    const filters: ReportFiltersType = {};
    if (status && status !== 'all') filters.status = status as ReportStatus;
    if (priority && priority !== 'all')
      filters.priority = priority as ReportPriority;
    if (reportType && reportType !== 'all')
      filters.reason = reportType as ReportReason;
    if (dateFrom) filters.dateFrom = dateFrom.toISOString();
    if (dateTo) filters.dateTo = dateTo.toISOString();

    onFilterChange(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, priority, reportType, assignee, dateFrom, dateTo]);

  // Calculate active filter count
  const activeFilterCount = [
    status !== 'all',
    priority !== 'all',
    reportType !== 'all',
    assignee !== 'all',
    dateFrom !== null,
    dateTo !== null,
  ].filter(Boolean).length;

  // Clear all filters
  const handleClearFilters = () => {
    setStatus('all');
    setPriority('all');
    setReportType('all');
    setAssignee('all');
    setDateFrom(null);
    setDateTo(null);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="text-muted-foreground h-5 w-5" />
            <h3 className="text-sm font-medium">Filtreler</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-8"
            >
              <X className="mr-1 h-4 w-4" />
              Temizle
            </Button>
          )}
        </div>

        {/* Filters Grid - Responsive */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-gray-700"
            >
              Durum
            </label>
            <select
              id="status-filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="all">Tüm Durumlar</option>
              <option value={ReportStatus.PENDING}>Bekleyen</option>
              <option value={ReportStatus.IN_REVIEW}>İnceleniyor</option>
              <option value={ReportStatus.RESOLVED}>Çözümlendi</option>
              <option value={ReportStatus.DISMISSED}>Reddedildi</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-1">
            <label
              htmlFor="priority-filter"
              className="text-sm font-medium text-gray-700"
            >
              Öncelik
            </label>
            <select
              id="priority-filter"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value={ReportPriority.LOW}>Düşük</option>
              <option value={ReportPriority.MEDIUM}>Orta</option>
              <option value={ReportPriority.HIGH}>Yüksek</option>
              <option value={ReportPriority.URGENT}>Acil</option>
            </select>
          </div>

          {/* Report Type Filter */}
          <div className="space-y-1">
            <label
              htmlFor="type-filter"
              className="text-sm font-medium text-gray-700"
            >
              Rapor Tipi
            </label>
            <select
              id="type-filter"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="all">Tüm Tipler</option>
              <option value={ReportReason.SPAM}>Spam</option>
              <option value={ReportReason.SCAM}>Dolandırıcılık</option>
              <option value={ReportReason.ABUSIVE_BEHAVIOR}>Taciz/Küfür</option>
              <option value={ReportReason.HARASSMENT}>Rahatsız Etme</option>
              <option value={ReportReason.FAKE_PROFILE}>Sahte Profil</option>
              <option value={ReportReason.COPYRIGHT_VIOLATION}>
                Telif İhlali
              </option>
              <option value={ReportReason.INAPPROPRIATE_CONTENT}>
                Uygunsuz İçerik
              </option>
              <option value={ReportReason.OTHER}>Diğer</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-1">
            <label
              htmlFor="assignee-filter"
              className="text-sm font-medium text-gray-700"
            >
              Atanan
            </label>
            <select
              id="assignee-filter"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="all">Tümü</option>
              <option value="me">Bana Atananlar</option>
              <option value="unassigned">Atanmamış</option>
            </select>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Tarih Aralığı
          </label>
          <DateRangePicker
            startDate={dateFrom}
            endDate={dateTo}
            onChange={(start, end) => {
              setDateFrom(start);
              setDateTo(end);
            }}
            startLabel="Başlangıç"
            endLabel="Bitiş"
            startPlaceholder="Başlangıç tarihi"
            endPlaceholder="Bitiş tarihi"
            showClear={true}
          />
        </div>
      </div>
    </Card>
  );
}
