/**
 * ================================================
 * ADMIN FAILED PAYMENTS DASHBOARD
 * ================================================
 * Admin page for managing failed payment retries
 *
 * Sprint: Payment & Refund System Hardening
 * Story: Admin Failed Payments Dashboard (8 SP)
 *
 * Features:
 * - Statistics (success rate, failure breakdown)
 * - Exhausted retries table
 * - Manual intervention actions
 * - Filters (status, date range, failure reason)
 * - CSV export
 * - Bulk retry actions
 *
 * @version 1.0.0
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { paymentRetryApi } from '@/lib/api/payment-retry';
import type { PaymentRetry } from '@/types/business/features/payment-retry';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import { Logger } from '@/lib/infrastructure/monitoring/logger';

const logger = new Logger({});

// ================================================
// TYPES
// ================================================

// Extended type for admin dashboard with payment details
interface AdminPaymentRetry extends PaymentRetry {
  orderId?: string;
  amount: number;
  lastError?: string;
  errorCode?: string;
}

interface FailedPaymentStats {
  totalFailed: number;
  exhaustedRetries: number;
  successRate: number;
  averageRetries: number;
  failureReasons: Record<string, number>;
  totalAmount: number;
}

interface FilterState {
  status: 'ALL' | 'EXHAUSTED' | 'IN_PROGRESS' | 'CANCELLED';
  dateRange: 'TODAY' | '7D' | '30D' | 'ALL';
  searchQuery: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export default function AdminFailedPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRetry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(
    new Set()
  );
  const [filters, setFilters] = useState<FilterState>({
    status: 'ALL',
    dateRange: '30D',
    searchQuery: '',
  });

  // ================================================
  // DATA FETCHING
  // ================================================

  const fetchFailedPayments = async () => {
    try {
      setLoading(true);
      // TODO: Backend endpoint for admin failed payments list
      // const data = await paymentRetryApi.getAdminFailedPayments(filters);
      // setPayments(data);
      setPayments([]); // Placeholder
    } catch (error) {
      logger.error('Failed to fetch failed payments', error as Error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFailedPayments();
  }, [filters]);

  // ================================================
  // STATISTICS CALCULATION
  // ================================================

  const stats: FailedPaymentStats = useMemo(() => {
    const totalFailed = payments.length;
    const exhaustedRetries = payments.filter(
      (p) => p.status === 'EXHAUSTED'
    ).length;
    const successfulRetries = payments.filter(
      (p) => p.status === 'SUCCESS'
    ).length;
    const totalAttempts = payments.reduce((sum, p) => sum + p.retryCount, 0);

    const failureReasons: Record<string, number> = {};
    payments.forEach((payment) => {
      if (payment.failureReason) {
        const reason = payment.errorCode || payment.failureReason;
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      }
    });

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalFailed,
      exhaustedRetries,
      successRate:
        totalFailed > 0 ? (successfulRetries / totalFailed) * 100 : 0,
      averageRetries: totalFailed > 0 ? totalAttempts / totalFailed : 0,
      failureReasons,
      totalAmount,
    };
  }, [payments]);

  // ================================================
  // FILTERED DATA
  // ================================================

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Status filter
      if (filters.status !== 'ALL' && payment.status !== filters.status) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          payment.paymentId.toLowerCase().includes(query) ||
          payment.orderId?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [payments, filters]);

  // ================================================
  // ACTIONS
  // ================================================

  const handleManualRetry = async (paymentId: string) => {
    try {
      await paymentRetryApi.manualRetryPayment(paymentId);
      logger.info('Manual retry initiated', { paymentId });
      await fetchFailedPayments();
    } catch (error) {
      logger.error('Manual retry failed', error as Error);
    }
  };

  const handleBulkRetry = async () => {
    try {
      const retryPromises = Array.from(selectedPayments).map((paymentId) =>
        paymentRetryApi.manualRetryPayment(paymentId)
      );
      await Promise.all(retryPromises);
      logger.info('Bulk retry completed', {
        count: selectedPayments.size,
      });
      setSelectedPayments(new Set());
      await fetchFailedPayments();
    } catch (error) {
      logger.error('Bulk retry failed', error as Error);
    }
  };

  const handleCancelRetry = async (paymentId: string) => {
    try {
      await paymentRetryApi.cancelPaymentRetry(paymentId);
      logger.info('Retry cancelled', { paymentId });
      await fetchFailedPayments();
    } catch (error) {
      logger.error('Cancel retry failed', error as Error);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      [
        'Payment ID',
        'Order ID',
        'Amount',
        'Status',
        'Retry Count',
        'Last Error',
        'Created At',
      ],
      ...filteredPayments.map((p) => [
        p.paymentId,
        p.orderId || 'N/A',
        p.amount.toString(),
        p.status,
        p.retryCount.toString(),
        p.lastError || p.failureReason || 'N/A',
        new Date(p.createdAt).toISOString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-payments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const togglePaymentSelection = (paymentId: string) => {
    const newSelection = new Set(selectedPayments);
    if (newSelection.has(paymentId)) {
      newSelection.delete(paymentId);
    } else {
      newSelection.add(paymentId);
    }
    setSelectedPayments(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPayments.size === filteredPayments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(filteredPayments.map((p) => p.paymentId)));
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Failed Payments Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage failed payment retries and manual interventions
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredPayments.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={fetchFailedPayments} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Failed Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFailed}</div>
            <p className="text-muted-foreground text-xs">
              {formatCurrency(stats.totalAmount)} total amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Exhausted Retries
            </CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.exhaustedRetries}</div>
            <p className="text-muted-foreground text-xs">
              Requires manual intervention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {stats.successRate >= 50 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.successRate.toFixed(1)}%
            </div>
            <p className="text-muted-foreground text-xs">Retry success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Retries
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRetries.toFixed(1)}
            </div>
            <p className="text-muted-foreground text-xs">Per failed payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Failure Reasons Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Failure Reasons Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-3">
            {Object.entries(stats.failureReasons)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([reason, count]) => (
                <div
                  key={reason}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="text-sm font-medium">{reason}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Payment ID or Order ID..."
                value={filters.searchQuery}
                onChange={(e) =>
                  setFilters({ ...filters, searchQuery: e.target.value })
                }
                className="max-w-md"
              />
            </div>
            <select
              className="rounded-md border px-3 py-2"
              value={filters.status}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  status: e.target.value as FilterState['status'],
                })
              }
            >
              <option value="ALL">All Statuses</option>
              <option value="EXHAUSTED">Exhausted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select
              className="rounded-md border px-3 py-2"
              value={filters.dateRange}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  dateRange: e.target.value as FilterState['dateRange'],
                })
              }
            >
              <option value="TODAY">Today</option>
              <option value="7D">Last 7 Days</option>
              <option value="30D">Last 30 Days</option>
              <option value="ALL">All Time</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPayments.size > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardContent className="flex items-center justify-between pt-6">
            <span className="font-medium">
              {selectedPayments.size} payment
              {selectedPayments.size > 1 ? 's' : ''} selected
            </span>
            <Button onClick={handleBulkRetry} variant="primary">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Selected
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Payments ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <CheckCircle2 className="mb-4 h-12 w-12" />
              <p>No failed payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedPayments.size === filteredPayments.length
                      }
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Last Error</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  return (
                    <TableRow key={payment.paymentId}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedPayments.has(payment.paymentId)}
                          onChange={() =>
                            togglePaymentSelection(payment.paymentId)
                          }
                          className="cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.paymentId.slice(0, 8)}...
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {payment.orderId?.slice(0, 8) || 'N/A'}...
                      </TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'EXHAUSTED'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.retryCount} / {payment.maxRetries}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {payment.lastError || payment.failureReason || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(new Date(payment.createdAt))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualRetry(payment.paymentId)}
                            disabled={payment.status === 'SUCCESS'}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelRetry(payment.paymentId)}
                            disabled={payment.status === 'CANCELLED'}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
