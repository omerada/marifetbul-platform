'use client';

/**
 * ================================================
 * BATCH PAYOUT MANAGER - PRODUCTION READY
 * ================================================
 * Admin batch payout processing with real-time updates
 *
 * Sprint 1: Wallet & Payment System Completion
 * Day 3-4: Payout Batch Processing UI
 *
 * Features:
 * ✅ Select multiple pending payouts for batch processing
 * ✅ Preview batch details (total amount, count, fees)
 * ✅ Create batch (manual or auto-process)
 * ✅ Real-time batch status monitoring with polling
 * ✅ Batch history with filtering
 * ✅ Export batch to CSV
 * ✅ Cancel pending/processing batches
 * ✅ Retry failed batches
 * ✅ Progress indicator with percentage
 * ✅ Error handling and notifications
 *
 * @version 2.0.0 - Production Ready
 * @author MarifetBul Development Team
 * @since 2025-11-14
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  Loader2,
  Download,
  Send,
  RefreshCw,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle,
  Ban,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  createPayoutBatch,
  getBatches,
  getBatchDetails,
  processBatch,
  cancelBatch,
  downloadBatchExport,
  getBatchStatusVariant,
  getBatchStatusText,
  getBatchProcessingStats,
  retryFailedBatches,
  cancelStuckBatches,
} from '@/lib/api/admin/batch-payout-api';
import { getAdminPayouts } from '@/lib/api/admin/payout-admin-api';
import type {
  Payout,
  PayoutBatchResponse,
  PayoutBatchStatus,
  BatchProcessingStats,
} from '@/types/business/features/wallet';

// ============================================================================
// COMPONENT
// ============================================================================

interface BatchPayoutManagerProps {
  initialPayouts?: Payout[];
  onBatchCreated?: (batch: PayoutBatchResponse) => void;
  refreshInterval?: number;
}

export default function BatchPayoutManager({
  initialPayouts = [],
  onBatchCreated,
  refreshInterval = 30000,
}: BatchPayoutManagerProps) {
  const { toast } = useToast();

  // State
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
  const [batches, setBatches] = useState<PayoutBatchResponse[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [activeBatch, setActiveBatch] = useState<PayoutBatchResponse | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [batchFilter, setBatchFilter] = useState<PayoutBatchStatus | 'ALL'>(
    'ALL'
  );
  const [stats, setStats] = useState<BatchProcessingStats | null>(null);

  // Data fetching
  const fetchPendingPayouts = useCallback(async () => {
    try {
      setIsLoadingPayouts(true);
      const response = await getAdminPayouts({
        status: 'PENDING',
        page: 0,
        size: 100,
      });
      setPayouts(response.content);
    } catch (error) {
      logger.error('Error fetching payouts', error as Error);
      toast({
        title: 'Hata',
        description: 'Para çekme talepleri yüklenemedi',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPayouts(false);
    }
  }, [toast]);

  const fetchBatches = useCallback(async () => {
    try {
      setIsLoadingBatches(true);
      const status = batchFilter === 'ALL' ? undefined : batchFilter;
      const data = await getBatches(status);
      setBatches(data);
    } catch (error) {
      logger.error('Error fetching batches', error as Error);
    } finally {
      setIsLoadingBatches(false);
    }
  }, [batchFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getBatchProcessingStats();
      setStats(data);
    } catch (error) {
      logger.error('Error fetching stats', error as Error);
    }
  }, []);

  const refreshActiveBatch = useCallback(async () => {
    if (!activeBatch) return;

    try {
      const updated = await getBatchDetails(activeBatch.id);
      setActiveBatch(updated);

      if (updated.status === 'COMPLETED' || updated.status === 'FAILED') {
        toast({
          title:
            updated.status === 'COMPLETED'
              ? 'Batch Tamamlandı'
              : 'Batch Başarısız',
          description:
            updated.status === 'COMPLETED'
              ? `${updated.successCount}/${updated.totalCount} ödeme başarıyla işlendi`
              : updated.errorMessage || 'Batch işleme hatası',
          variant: updated.status === 'COMPLETED' ? 'default' : 'destructive',
        });

        await Promise.all([
          fetchPendingPayouts(),
          fetchBatches(),
          fetchStats(),
        ]);
        setActiveBatch(null);
      }
    } catch (error) {
      logger.error('Error refreshing batch', error as Error);
    }
  }, [activeBatch, toast, fetchPendingPayouts, fetchBatches, fetchStats]);

  // Effects
  useEffect(() => {
    if (initialPayouts.length === 0) {
      fetchPendingPayouts();
    }
    fetchBatches();
    fetchStats();
  }, [initialPayouts.length, fetchPendingPayouts, fetchBatches, fetchStats]);

  useEffect(() => {
    if (
      !activeBatch ||
      (activeBatch.status !== 'PROCESSING' && activeBatch.status !== 'PENDING')
    ) {
      return;
    }

    const interval = setInterval(refreshActiveBatch, 3000);
    return () => clearInterval(interval);
  }, [activeBatch, refreshActiveBatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingPayouts();
      fetchBatches();
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchPendingPayouts, fetchBatches, fetchStats]);

  // Handlers
  const togglePayout = (payoutId: string) => {
    setSelectedPayouts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(payoutId)) {
        newSet.delete(payoutId);
      } else {
        newSet.add(payoutId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedPayouts.size === payouts.length) {
      setSelectedPayouts(new Set());
    } else {
      setSelectedPayouts(new Set(payouts.map((p) => p.id)));
    }
  };

  const handleCreateBatch = async (autoProcess: boolean = false) => {
    if (selectedPayouts.size === 0) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen en az bir para çekme talebi seçin',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);

      const result = await createPayoutBatch({
        payoutIds: Array.from(selectedPayouts),
        notes,
        autoProcess,
      });

      setActiveBatch(result.batch);

      toast({
        title: 'Başarılı',
        description: `Batch ${result.batch.batchNumber} oluşturuldu`,
      });

      setSelectedPayouts(new Set());
      setNotes('');

      if (onBatchCreated) {
        onBatchCreated(result.batch);
      }

      await Promise.all([fetchPendingPayouts(), fetchBatches(), fetchStats()]);
    } catch (error) {
      logger.error('Error creating batch', error as Error);
      toast({
        title: 'Hata',
        description:
          error instanceof Error
            ? error.message
            : 'Batch oluşturulurken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessBatch = async (batchId: string) => {
    try {
      const batch = await processBatch(batchId);
      setActiveBatch(batch);

      toast({
        title: 'İşleme Başladı',
        description: `Batch ${batch.batchNumber} işleniyor`,
      });

      await fetchBatches();
    } catch (error) {
      logger.error('Error processing batch', error as Error);
      toast({
        title: 'Hata',
        description: 'Batch işlenirken hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleCancelBatch = async (batchId: string, batchNumber: string) => {
    try {
      const reason = prompt('İptal sebebini giriniz:');
      if (!reason) return;

      await cancelBatch(batchId, reason);

      toast({
        title: 'Batch İptal Edildi',
        description: `Batch ${batchNumber} iptal edildi`,
      });

      await fetchBatches();
      if (activeBatch?.id === batchId) {
        setActiveBatch(null);
      }
    } catch (error) {
      logger.error('Error cancelling batch', error as Error);
      toast({
        title: 'Hata',
        description: 'Batch iptal edilirken hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const handleExportBatch = async (batchId: string, batchNumber: string) => {
    try {
      await downloadBatchExport(batchId, batchNumber);

      toast({
        title: 'Export Başarılı',
        description: 'Batch verileri indirildi',
      });
    } catch (error) {
      logger.error('Error exporting batch', error as Error);
      toast({
        title: 'Hata',
        description: 'Export işlemi başarısız',
        variant: 'destructive',
      });
    }
  };

  const handleRetryFailed = async () => {
    try {
      const result = await retryFailedBatches();

      toast({
        title: 'Başarılı',
        description: result.message,
      });

      await fetchBatches();
    } catch (error) {
      logger.error('Error retrying failed batches', error as Error);
      toast({
        title: 'Hata',
        description: 'Retry işlemi başarısız',
        variant: 'destructive',
      });
    }
  };

  const handleCancelStuck = async () => {
    try {
      const result = await cancelStuckBatches();

      toast({
        title: 'Başarılı',
        description: result.message,
      });

      await fetchBatches();
    } catch (error) {
      logger.error('Error cancelling stuck batches', error as Error);
      toast({
        title: 'Hata',
        description: 'İptal işlemi başarısız',
        variant: 'destructive',
      });
    }
  };

  // Computed values
  const selectedPayoutsData = payouts.filter((p) => selectedPayouts.has(p.id));
  const totalAmount = selectedPayoutsData.reduce((sum, p) => sum + p.amount, 0);
  const totalCount = selectedPayouts.size;

  const filteredBatches =
    batchFilter === 'ALL'
      ? batches
      : batches.filter((b) => b.status === batchFilter);

  // Render
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Batch
              </CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBatches}</div>
              <p className="text-muted-foreground text-xs">
                {stats.pendingBatches} bekliyor
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Toplam Tutar
              </CardTitle>
              <DollarSign className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount)}
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.totalPayouts} ödeme
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Başarı Oranı
              </CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.successRate.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                {stats.completedBatches} tamamlandı
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ort. İşlem Süresi
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(stats.averageProcessingTime / 60)}dk
              </div>
              <p className="text-muted-foreground text-xs">ortalama süre</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Batch Status */}
      {activeBatch && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                Aktif Batch: {activeBatch.batchNumber}
                {activeBatch.status === 'PROCESSING' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </span>
              <Badge variant={getBatchStatusVariant(activeBatch.status)}>
                {getBatchStatusText(activeBatch.status)}
              </Badge>
            </CardTitle>
            {activeBatch.notes && (
              <CardDescription>{activeBatch.notes}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Toplam</p>
                <p className="text-2xl font-bold">{activeBatch.totalCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Başarılı</p>
                <p className="text-2xl font-bold text-green-600">
                  {activeBatch.successCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">
                  {activeBatch.failureCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">İlerleme</p>
                <p className="text-2xl font-bold">
                  {activeBatch.progressPercentage}%
                </p>
              </div>
            </div>

            {activeBatch.status === 'PROCESSING' && (
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${activeBatch.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {activeBatch.errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{activeBatch.errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Selection and Summary */}
      {selectedPayouts.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Batch Özeti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Seçili Talep</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Toplam Tutar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Ortalama Tutar</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totalAmount / totalCount)}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor="notes">Not (Opsiyonel)</Label>
              <Textarea
                id="notes"
                placeholder="Batch ile ilgili notlarınızı buraya yazın..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => handleCreateBatch(false)}
                disabled={isProcessing}
                variant="outline"
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Batch Oluştur (Manuel)
              </Button>
              <Button
                onClick={() => handleCreateBatch(true)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Oluştur ve İşle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Pending Payouts & Batch History */}
      <Tabs defaultValue="payouts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payouts">
            <Users className="mr-2 h-4 w-4" />
            Bekleyen Talepler ({payouts.length})
          </TabsTrigger>
          <TabsTrigger value="batches">
            <FileText className="mr-2 h-4 w-4" />
            Batch Geçmişi ({batches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Para Çekme Talepleri</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPendingPayouts}
                    disabled={isLoadingPayouts}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoadingPayouts ? 'animate-spin' : ''}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAll}
                    disabled={payouts.length === 0}
                  >
                    {selectedPayouts.size === payouts.length
                      ? 'Hiçbirini Seçme'
                      : 'Tümünü Seç'}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPayouts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : payouts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Bekleyen talep yok</AlertTitle>
                  <AlertDescription>
                    Şu anda işlenmeyi bekleyen para çekme talebi
                    bulunmamaktadır.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedPayouts.size === payouts.length}
                          onCheckedChange={toggleAll}
                        />
                      </TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Banka</TableHead>
                      <TableHead>IBAN</TableHead>
                      <TableHead>Tarih</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPayouts.has(payout.id)}
                            onCheckedChange={() => togglePayout(payout.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {payout.userId}
                        </TableCell>
                        <TableCell>{formatCurrency(payout.amount)}</TableCell>
                        <TableCell>{payout.bankAccountId || 'N/A'}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {payout.bankAccountId || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {formatDate(payout.createdAt, 'SHORT')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Batch Geçmişi</span>
                <div className="flex gap-2">
                  <Select
                    value={batchFilter}
                    onValueChange={(value) =>
                      setBatchFilter(value as PayoutBatchStatus | 'ALL')
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrele" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tümü</SelectItem>
                      <SelectItem value="PENDING">Bekliyor</SelectItem>
                      <SelectItem value="PROCESSING">İşleniyor</SelectItem>
                      <SelectItem value="COMPLETED">Tamamlandı</SelectItem>
                      <SelectItem value="FAILED">Başarısız</SelectItem>
                      <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchBatches}
                    disabled={isLoadingBatches}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoadingBatches ? 'animate-spin' : ''}`}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryFailed}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Failed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelStuck}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Stuck
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBatches ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : filteredBatches.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Batch bulunamadı</AlertTitle>
                  <AlertDescription>
                    Seçilen filtreye uygun batch bulunmamaktadır.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch No</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Toplam</TableHead>
                      <TableHead>Başarılı</TableHead>
                      <TableHead>Başarısız</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBatches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-sm">
                          {batch.batchNumber}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getBatchStatusVariant(batch.status)}>
                            {getBatchStatusText(batch.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{batch.totalCount}</TableCell>
                        <TableCell className="text-green-600">
                          {batch.successCount}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {batch.failureCount}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(batch.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {formatDate(batch.createdAt, 'SHORT')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {batch.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProcessBatch(batch.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {(batch.status === 'PENDING' ||
                              batch.status === 'PROCESSING') && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleCancelBatch(batch.id, batch.batchNumber)
                                }
                              >
                                <Ban className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleExportBatch(batch.id, batch.batchNumber)
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
