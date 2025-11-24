/**
 * ================================================
 * ADMIN MANUAL PAYMENT TRACKING PAGE
 * ================================================
 * Admin dashboard for tracking and managing manual payment proofs
 *
 * Route: /admin/payments/manual
 * Access: Admin only
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.3
 */

'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card } from '@/components/ui';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  ManualPaymentList,
  PaymentActionModal,
} from '@/components/domains/admin/payments';
import {
  adminPaymentsApi,
  type ManualPaymentProofResponse,
} from '@/lib/api/admin-payments';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useToast } from '@/hooks';

type TabValue = 'pending' | 'disputed' | 'fraud' | 'all';

/**
 * Admin Manual Payment Tracking Page
 */
export default function AdminManualPaymentTrackingPage() {
  const { success: showSuccess, error: showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('pending');

  // Payment data
  const [pendingPayments, setPendingPayments] = useState<
    ManualPaymentProofResponse[]
  >([]);
  const [disputedPayments, setDisputedPayments] = useState<
    ManualPaymentProofResponse[]
  >([]);
  const [fraudPayments, setFraudPayments] = useState<
    ManualPaymentProofResponse[]
  >([]);

  // Modal state
  const [selectedPayment, setSelectedPayment] =
    useState<ManualPaymentProofResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Fetch all payment data
   */
  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const [pendingResponse, disputedResponse, fraudResponse] =
        await Promise.all([
          adminPaymentsApi.getPendingPaymentProofs(),
          adminPaymentsApi.getDisputedPaymentProofs(),
          adminPaymentsApi.getFraudSuspectedPaymentProofs(),
        ]);

      if (pendingResponse.success && pendingResponse.data) {
        setPendingPayments(pendingResponse.data);
      }
      if (disputedResponse.success && disputedResponse.data) {
        setDisputedPayments(disputedResponse.data);
      }
      if (fraudResponse.success && fraudResponse.data) {
        setFraudPayments(fraudResponse.data);
      }

      logger.info('Manual payment proofs loaded successfully', {
        component: 'AdminManualPaymentTrackingPage',
        pending: pendingResponse.data?.length || 0,
        disputed: disputedResponse.data?.length || 0,
        fraud: fraudResponse.data?.length || 0,
      });
    } catch (err) {
      logger.error(
        'Failed to fetch manual payment proofs',
        err instanceof Error ? err : new Error(String(err)),
        {
          component: 'AdminManualPaymentTrackingPage',
        }
      );
      showError('Hata', 'Ödeme kanıtları yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handle view proof
   */
  const handleViewProof = (payment: ManualPaymentProofResponse) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  /**
   * Handle approve payment
   */
  const handleApprove = async (proofId: string, notes: string) => {
    try {
      const response = await adminPaymentsApi.verifyPaymentProof(
        proofId,
        true,
        notes
      );

      if (response.success) {
        showSuccess('Başarılı', 'Ödeme kanıtı onaylandı');
        setIsModalOpen(false);
        fetchPayments(); // Refresh data
      } else {
        throw new Error(response.message || 'Onaylama başarısız');
      }
    } catch (err) {
      logger.error(
        'Failed to approve payment proof',
        err instanceof Error ? err : new Error(String(err)),
        { component: 'AdminManualPaymentTrackingPage', proofId }
      );
      showError('Hata', 'Ödeme kanıtı onaylanamadı');
    }
  };

  /**
   * Handle reject payment
   */
  const handleReject = async (proofId: string, notes: string) => {
    try {
      const response = await adminPaymentsApi.verifyPaymentProof(
        proofId,
        false,
        notes
      );

      if (response.success) {
        showSuccess('Başarılı', 'Ödeme kanıtı reddedildi');
        setIsModalOpen(false);
        fetchPayments(); // Refresh data
      } else {
        throw new Error(response.message || 'Reddetme başarısız');
      }
    } catch (err) {
      logger.error(
        'Failed to reject payment proof',
        err instanceof Error ? err : new Error(String(err)),
        { component: 'AdminManualPaymentTrackingPage', proofId }
      );
      showError('Hata', 'Ödeme kanıtı reddedilemedi');
    }
  };

  /**
   * Handle mark as fraud
   */
  const handleMarkFraud = async (proofId: string, reasons: string) => {
    try {
      const response = await adminPaymentsApi.markAsFraud(proofId, reasons);

      if (response.success) {
        showSuccess('Başarılı', 'Dolandırıcılık olarak işaretlendi');
        setIsModalOpen(false);
        fetchPayments(); // Refresh data
      } else {
        throw new Error(response.message || 'İşaretleme başarısız');
      }
    } catch (err) {
      logger.error(
        'Failed to mark as fraud',
        err instanceof Error ? err : new Error(String(err)),
        { component: 'AdminManualPaymentTrackingPage', proofId }
      );
      showError('Hata', 'Dolandırıcılık işaretlenemedi');
    }
  };

  /**
   * Get all payments for "All" tab
   */
  const getAllPayments = () => {
    return [...pendingPayments, ...disputedPayments, ...fraudPayments];
  };

  /**
   * Loading State
   */
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2" />
            <p className="text-muted-foreground">
              Manuel ödeme kanıtları yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manuel Ödeme Takibi</h1>
        <p className="text-muted-foreground mt-1">
          Manuel IBAN ödemelerinin kanıtlarını inceleyin ve onaylayın
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 text-warning rounded-lg p-3">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Bekleyen</p>
              <p className="text-2xl font-bold">{pendingPayments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 text-destructive rounded-lg p-3">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">İtirazlı</p>
              <p className="text-2xl font-bold">{disputedPayments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 text-destructive rounded-lg p-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Dolandırıcılık</p>
              <p className="text-2xl font-bold">{fraudPayments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 text-success rounded-lg p-3">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Toplam</p>
              <p className="text-2xl font-bold">{getAllPayments().length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
      >
        <TabsList>
          <TabsTrigger value="pending">
            <Clock className="mr-2 h-4 w-4" />
            Bekleyen ({pendingPayments.length})
          </TabsTrigger>
          <TabsTrigger value="disputed">
            <AlertCircle className="mr-2 h-4 w-4" />
            İtirazlı ({disputedPayments.length})
          </TabsTrigger>
          <TabsTrigger value="fraud">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Dolandırıcılık ({fraudPayments.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Tümü ({getAllPayments().length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <ManualPaymentList
            payments={pendingPayments}
            onViewProof={handleViewProof}
          />
        </TabsContent>

        <TabsContent value="disputed" className="mt-6">
          <ManualPaymentList
            payments={disputedPayments}
            onViewProof={handleViewProof}
          />
        </TabsContent>

        <TabsContent value="fraud" className="mt-6">
          <ManualPaymentList
            payments={fraudPayments}
            onViewProof={handleViewProof}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <ManualPaymentList
            payments={getAllPayments()}
            onViewProof={handleViewProof}
          />
        </TabsContent>
      </Tabs>

      {/* Action Modal */}
      <PaymentActionModal
        payment={selectedPayment}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onMarkFraud={handleMarkFraud}
      />
    </div>
  );
}
