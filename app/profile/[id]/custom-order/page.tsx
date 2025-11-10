/**
 * ================================================
 * CUSTOM ORDER CREATION PAGE
 * ================================================
 * Page for creating custom orders with a specific freelancer
 * Supports dual payment system (ESCROW_PROTECTED vs MANUAL_IBAN)
 *
 * Route: /profile/[id]/custom-order
 *
 * Features:
 * - Freelancer info display
 * - Custom order form with validation
 * - Seller IBAN status checking
 * - Payment mode selection
 * - Order creation with API integration
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { CustomOrderForm } from '@/components/domains/orders/CustomOrderForm';
import { AppLayout } from '@/components/layout';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Loading, SimpleErrorDisplay } from '@/components/ui';
import { useProfile } from '@/hooks/business/profile';
import { orderApi } from '@/lib/api/orders';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

export default function CustomOrderPage() {
  const params = useParams();
  const router = useRouter();
  const sellerId = params.id as string;

  // Fetch freelancer profile
  const { data: freelancer, isLoading, error } = useProfile(sellerId);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Redirect if not a freelancer
  useEffect(() => {
    if (!isLoading && freelancer && freelancer.userType !== 'freelancer') {
      toast.error('Özel sipariş sadece freelancerlar için oluşturulabilir');
      router.push(`/profile/${sellerId}`);
    }
  }, [freelancer, isLoading, router, sellerId]);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    requirements: string;
    amount: number;
    deadline: string;
    contactInfo: string;
    paymentMode: string;
  }) => {
    setIsSubmitting(true);

    try {
      logger.info('[CustomOrderPage] Creating custom order', {
        sellerId,
        title: formData.title,
        amount: formData.amount,
      });

      // Create custom order via API
      const response = await orderApi.createCustomOrder({
        sellerId,
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        amount: formData.amount,
        paymentMode: formData.paymentMode as any, // PaymentMode from form
        deadline: new Date(formData.deadline).toISOString(),
      });

      const order = response.data;

      logger.info('[CustomOrderPage] Custom order created successfully', {
        orderId: order.id,
        orderNumber: order.orderNumber,
      });

      toast.success('Özel sipariş oluşturuldu!', {
        description: `Sipariş No: ${order.orderNumber}`,
      });

      // Redirect to order payment page
      setTimeout(() => {
        router.push(`/orders/${order.id}/payment`);
      }, 1000);
    } catch (error) {
      logger.error(
        '[CustomOrderPage] Failed to create custom order:',
        error instanceof Error ? error : new Error(String(error))
      );

      toast.error('Sipariş oluşturulamadı', {
        description:
          error instanceof Error
            ? error.message
            : 'Bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/profile/${sellerId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loading variant="skeleton" text="Freelancer bilgileri yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  // Error state
  if (error || !freelancer) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12">
          <SimpleErrorDisplay
            message={
              error instanceof Error
                ? error.message
                : 'Freelancer bulunamadı'
            }
          />
        </div>
      </AppLayout>
    );
  }

  // Not a freelancer
  if (freelancer.userType !== 'freelancer') {
    return null; // Will redirect via useEffect
  }

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri Dön
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Özel Sipariş Oluştur
            </h1>
            <p className="mt-2 text-gray-600">
              Doğrudan freelancer ile özel bir proje siparişi oluşturun
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-6">
          <CustomOrderForm
            seller={{
              id: freelancer.id,
              name: `${freelancer.firstName} ${freelancer.lastName}`,
              avatar: freelancer.avatar,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </Card>

        {/* Info Section */}
        <Card className="mt-6 border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-3 font-semibold text-gray-900">
            Özel Sipariş Nasıl Çalışır?
          </h3>
          <ol className="list-inside list-decimal space-y-2 text-sm text-gray-700">
            <li>
              Freelancer ile anlaştığınız proje detaylarını ve tutarı girin
            </li>
            <li>Ödeme yönteminizi seçin (Escrow korumalı veya manuel IBAN)</li>
            <li>Sipariş oluşturulduktan sonra ödeme sayfasına yönlendirileceksiniz</li>
            <li>
              Ödeme tamamlandıktan sonra freelancer işe başlayabilir
            </li>
            <li>İş tamamlandığında teslimatı onaylayın</li>
            <li>Revizyon hakkınız varsa kullanabilirsiniz</li>
            <li>Memnun kaldığınızda siparişi tamamlayın</li>
          </ol>
        </Card>
      </div>
    </AppLayout>
  );
}
