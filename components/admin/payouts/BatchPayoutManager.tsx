'use client';

/**
 * Batch Payout Manager Component
 * Sprint 1, Story 1.1: Admin payout batch processing UI
 *
 * Features:
 * - Select multiple pending payouts for batch processing
 * - Preview batch details (total amount, count, fees)
 * - Approve/reject batch with notes
 * - View batch processing status
 * - Monitor real-time batch progress
 *
 * @version 1.0
 * @author MarifetBul Development Team
 */

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

// Types
interface Payout {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  bankAccountDetails: {
    bankName: string;
    iban: string;
    accountHolderName: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  failureReason?: string;
}

interface PayoutBatch {
  id: string;
  batchNumber: string;
  status:
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED';
  totalCount: number;
  successCount: number;
  failureCount: number;
  progressPercentage: number;
  approvedBy?: string;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  notes?: string;
  createdAt: string;
}

interface BatchPayoutManagerProps {
  initialPayouts?: Payout[];
  onBatchCreated?: (batch: PayoutBatch) => void;
}

export default function BatchPayoutManager({
  initialPayouts = [],
  onBatchCreated,
}: BatchPayoutManagerProps) {
  const { toast } = useToast();

  // State
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [selectedPayouts, setSelectedPayouts] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentBatch, setCurrentBatch] = useState<PayoutBatch | null>(null);

  // Fetch pending payouts
  useEffect(() => {
    if (initialPayouts.length === 0) {
      fetchPendingPayouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPendingPayouts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/admin/payouts?status=PENDING');

      if (!response.ok) {
        throw new Error('Failed to fetch payouts');
      }

      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast({
        title: 'Hata',
        description: 'Para çekme talepleri yüklenemedi',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle payout selection
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

  // Select all/none
  const toggleAll = () => {
    if (selectedPayouts.size === payouts.length) {
      setSelectedPayouts(new Set());
    } else {
      setSelectedPayouts(new Set(payouts.map((p) => p.id)));
    }
  };

  // Calculate batch totals
  const selectedPayoutsData = payouts.filter((p) => selectedPayouts.has(p.id));
  const totalAmount = selectedPayoutsData.reduce((sum, p) => sum + p.amount, 0);
  const totalCount = selectedPayouts.size;

  // Create and process batch
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

      const response = await fetch('/api/v1/payouts/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payoutIds: Array.from(selectedPayouts),
          notes,
          autoProcess,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Batch oluşturulamadı');
      }

      const result = await response.json();
      setCurrentBatch(result.batch);

      toast({
        title: 'Başarılı',
        description: `Batch ${result.batch.batchNumber} oluşturuldu`,
      });

      // Clear selections
      setSelectedPayouts(new Set());
      setNotes('');

      // Callback
      if (onBatchCreated) {
        onBatchCreated(result.batch);
      }

      // Refresh payouts
      await fetchPendingPayouts();

      // If auto-processing, poll for status
      if (autoProcess) {
        pollBatchStatus(result.batch.id);
      }
    } catch (error) {
      console.error('Error creating batch:', error);
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

  // Poll batch status
  const pollBatchStatus = async (batchId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/payouts/batch/${batchId}`);

        if (!response.ok) {
          clearInterval(pollInterval);
          return;
        }

        const batch = await response.json();
        setCurrentBatch(batch);

        // Stop polling if completed or failed
        if (batch.status === 'COMPLETED' || batch.status === 'FAILED') {
          clearInterval(pollInterval);

          toast({
            title: batch.status === 'COMPLETED' ? 'Başarılı' : 'Hata',
            description:
              batch.status === 'COMPLETED'
                ? `Batch işlemi tamamlandı. Başarılı: ${batch.successCount}, Başarısız: ${batch.failureCount}`
                : `Batch işlemi başarısız: ${batch.errorMessage}`,
            variant: batch.status === 'COMPLETED' ? 'default' : 'destructive',
          });
        }
      } catch (error) {
        console.error('Error polling batch status:', error);
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds

    // Clear interval after 5 minutes
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  // Render batch status badge
  const renderStatusBadge = (status: PayoutBatch['status']) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock, text: 'Bekliyor' },
      APPROVED: {
        variant: 'default' as const,
        icon: CheckCircle2,
        text: 'Onaylandı',
      },
      REJECTED: {
        variant: 'destructive' as const,
        icon: XCircle,
        text: 'Reddedildi',
      },
      PROCESSING: {
        variant: 'default' as const,
        icon: Loader2,
        text: 'İşleniyor',
      },
      COMPLETED: {
        variant: 'default' as const,
        icon: CheckCircle2,
        text: 'Tamamlandı',
      },
      FAILED: {
        variant: 'destructive' as const,
        icon: AlertCircle,
        text: 'Başarısız',
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Current Batch Status */}
      {currentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aktif Batch: {currentBatch.batchNumber}</span>
              {renderStatusBadge(currentBatch.status)}
            </CardTitle>
            <CardDescription>{currentBatch.notes}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Toplam</p>
                <p className="text-2xl font-bold">{currentBatch.totalCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Başarılı</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentBatch.successCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentBatch.failureCount}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">İlerleme</p>
                <p className="text-2xl font-bold">
                  {currentBatch.progressPercentage}%
                </p>
              </div>
            </div>

            {currentBatch.status === 'PROCESSING' && (
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${currentBatch.progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {currentBatch.errorMessage && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{currentBatch.errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Summary */}
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
                variant="default"
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

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bekleyen Para Çekme Talepleri
            </span>
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
          </CardTitle>
          <CardDescription>
            {payouts.length} tane bekleyen talep bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : payouts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Bekleyen talep yok</AlertTitle>
              <AlertDescription>
                Şu anda işlenmeyi bekleyen para çekme talebi bulunmamaktadır.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedPayouts.size === payouts.length}
                      onChange={toggleAll}
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
                        onChange={() => togglePayout(payout.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {payout.userName}
                    </TableCell>
                    <TableCell>{formatCurrency(payout.amount)}</TableCell>
                    <TableCell>{payout.bankAccountDetails.bankName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {payout.bankAccountDetails.iban}
                    </TableCell>
                    <TableCell>
                      {new Date(payout.createdAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
