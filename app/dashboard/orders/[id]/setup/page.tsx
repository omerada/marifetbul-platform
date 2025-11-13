'use client';

/**
 * ================================================
 * ORDER SETUP PAGE
 * ================================================
 * Post-proposal-acceptance order setup wizard
 * Allows employer to configure payment structure (single vs milestones)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 1.3
 * @created 2025-11-11
 *
 * Flow:
 * 1. Employer accepts proposal
 * 2. Backend creates order (status: PENDING)
 * 3. Redirected here: /dashboard/orders/{orderId}/setup
 * 4. Choose payment structure:
 *    a) Single Payment → Order starts immediately
 *    b) Milestones → Create milestone plan
 * 5. After setup → Redirect to order detail page
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  DollarSign,
  List,
  AlertCircle,
} from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import { MilestoneCreationWizard } from '@/components/domains/orders';
import { orderApi } from '@/lib/api/orders';
import type { OrderResponse } from '@/types/backend-aligned';
import { formatCurrency } from '@/lib/shared/formatters';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

type SetupType = 'single' | 'milestones' | null;

export default function OrderSetupPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [setupType, setSetupType] = useState<SetupType>(null);
  const [showMilestoneWizard, setShowMilestoneWizard] = useState(false);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load order on mount
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await orderApi.getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Sipariş yüklenemedi');
        setError(error);
        logger.error('Failed to fetch order', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Validate order status
  useEffect(() => {
    if (order) {
      // If order already has milestones or is not PENDING, redirect to detail page
      if (order.status !== 'PENDING' && order.status !== 'ACCEPTED') {
        logger.warn(
          'Order not in PENDING/ACCEPTED status, redirecting to detail',
          {
            orderId: order.id,
            status: order.status,
          }
        );
        toast.info('Sipariş zaten kurulmuş', {
          description: 'Sipariş detay sayfasına yönlendiriliyorsunuz',
        });
        router.push(`/dashboard/orders/${orderId}`);
      }
    }
  }, [order, orderId, router]);

  const handleSinglePayment = async () => {
    if (!order) return;

    try {
      logger.info('Starting order with single payment', { orderId: order.id });

      // Note: Order will be automatically started by backend when payment is confirmed
      // Frontend just needs to redirect to detail page for tracking
      toast.success('Sipariş başlatıldı', {
        description: 'Freelancer çalışmaya başlayabilir',
      });

      router.push(`/dashboard/orders/${orderId}`);
    } catch (error) {
      logger.error('Failed to start order with single payment', error as Error);
      toast.error('Hata', {
        description: 'Sipariş başlatılamadı. Lütfen tekrar deneyin.',
      });
    }
  };

  const handleMilestonesSetup = () => {
    setShowMilestoneWizard(true);
  };

  const handleMilestonesCreated = async () => {
    if (!order) return;

    try {
      logger.info('Milestones created successfully', { orderId: order.id });

      toast.success("Milestone'lar oluşturuldu", {
        description: 'Sipariş detaylarını görüntüleyebilirsiniz',
      });

      // Redirect to order detail page
      router.push(`/dashboard/orders/${orderId}`);
    } catch (error) {
      logger.error('Failed to handle milestone creation', error as Error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Sipariş yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Sipariş bulunamadı
          </h2>
          <p className="mb-6 text-gray-600">
            {error?.message ||
              'Aradığınız sipariş bulunamadı veya erişim yetkiniz yok.'}
          </p>
          <Button onClick={() => router.push('/dashboard/orders')}>
            Siparişlerime Dön
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/orders')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Sipariş Kurulumu
            </h1>
            <p className="text-gray-600">
              Sipariş için ödeme yapısını seçin ve işi başlatın
            </p>
          </div>
          <Badge variant="secondary">{order.orderNumber}</Badge>
        </div>
      </div>

      {/* Order Summary */}
      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Sipariş Özeti
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-600">İş</p>
            <p className="font-medium text-gray-900">
              {order.jobTitle || 'Özel Sipariş'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Freelancer</p>
            <p className="font-medium text-gray-900">{order.sellerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Toplam Tutar</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(order.totalAmount, order.currency)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teslim Tarihi</p>
            <p className="font-medium text-gray-900">
              {new Date(order.deadline).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </Card>

      {/* Setup Type Selection */}
      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Ödeme Yapısı Seçin
        </h2>
        <p className="mb-6 text-sm text-gray-600">
          İşi tek ödemede mi tamamlatmak istersiniz yoksa aşamalara mı bölmek
          istersiniz?
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Single Payment Option */}
          <button
            type="button"
            onClick={() => setSetupType('single')}
            className={`group relative rounded-lg border-2 p-6 text-left transition-all hover:border-blue-500 hover:shadow-md ${
              setupType === 'single'
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                : 'border-gray-200'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white">
              <DollarSign className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Tek Ödeme
            </h3>
            <p className="text-sm text-gray-600">
              Proje tamamlandığında toplam tutarı ödeyin. Basit ve hızlı.
            </p>
            {setupType === 'single' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </button>

          {/* Milestones Option */}
          <button
            type="button"
            onClick={() => setSetupType('milestones')}
            className={`group relative rounded-lg border-2 p-6 text-left transition-all hover:border-blue-500 hover:shadow-md ${
              setupType === 'milestones'
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                : 'border-gray-200'
            }`}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white">
              <List className="h-6 w-6" />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Aşamalı Ödeme
              </h3>
              <Badge variant="success" className="text-xs">
                Önerilen
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              Projeyi aşamalara bölün ve her aşama için ödeme yapın. Daha
              güvenli.
            </p>
            {setupType === 'milestones' && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        {setupType && (
          <div className="mt-6 border-t pt-6">
            {setupType === 'single' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-900">
                    ✓ Freelancer işi tamamladığında toplam{' '}
                    <strong>
                      {formatCurrency(order.totalAmount, order.currency)}
                    </strong>{' '}
                    ödenecektir.
                  </p>
                </div>
                <Button
                  onClick={handleSinglePayment}
                  className="w-full"
                  size="lg"
                >
                  İşi Başlat
                </Button>
              </div>
            )}

            {setupType === 'milestones' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-sm text-green-900">
                    ✓ Her aşama tamamlandığında ilgili tutar ödenecektir. Daha
                    kontrollü ve güvenli.
                  </p>
                </div>
                <Button
                  onClick={handleMilestonesSetup}
                  variant="default"
                  className="w-full"
                  size="lg"
                >
                  Milestone'ları Belirle
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Milestone Creation Wizard (Modal) */}
      {showMilestoneWizard && order && (
        <MilestoneCreationWizard
          orderId={order.id}
          orderTotal={order.totalAmount}
          currency={order.currency}
          isOpen={showMilestoneWizard}
          onClose={() => setShowMilestoneWizard(false)}
          onSuccess={handleMilestonesCreated}
        />
      )}
    </div>
  );
}
