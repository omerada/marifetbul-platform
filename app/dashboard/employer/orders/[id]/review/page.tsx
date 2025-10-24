'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button, Loading } from '@/components/ui';
import { ReviewForm } from '@/components/shared/ReviewForm';
import { ChevronLeft, Star, Package, User, AlertCircle } from 'lucide-react';
import type { Order } from '@/types/business/features/orders';
import type { Review } from '@/types/business/review';
import { ReviewType } from '@/types/business/review';
import Link from 'next/link';

export default function EmployerOrderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        setError(null);

        // Load order details
        const orderResponse = await fetch(`/api/v1/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!orderResponse.ok) {
          if (orderResponse.status === 404) {
            throw new Error('Sipariş bulunamadı');
          }
          throw new Error('Sipariş yüklenemedi');
        }

        const orderData = await orderResponse.json();
        setOrder(orderData.data);

        // Check review eligibility
        setCheckingEligibility(true);
        const eligibilityResponse = await fetch(
          `/api/v1/user/reviews/can-review/${orderId}`,
          {
            credentials: 'include',
          }
        );

        if (eligibilityResponse.ok) {
          const eligibilityData = await eligibilityResponse.json();
          setCanReview(
            eligibilityData === true || eligibilityData.data === true
          );
        } else {
          setCanReview(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      } finally {
        setIsLoading(false);
        setCheckingEligibility(false);
      }
    };

    loadData();
  }, [orderId]);

  const handleReviewSuccess = (_review: Review) => {
    router.push(`/dashboard/employer/orders/${orderId}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/employer/orders/${orderId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading || checkingEligibility) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold">Sipariş Bulunamadı</h2>
          <p className="mb-6 text-gray-600">{error || 'Bir hata oluştu'}</p>
          <Button onClick={() => router.push('/dashboard/employer/orders')}>
            Siparişlere Dön
          </Button>
        </Card>
      </div>
    );
  }

  if (!canReview) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-500" />
          <h2 className="mb-2 text-xl font-semibold">
            Değerlendirme Yapılamıyor
          </h2>
          <p className="mb-6 text-gray-600">
            Bu sipariş için değerlendirme yapamazsınız. Sipariş tamamlanmamış
            olabilir veya zaten değerlendirme yapmış olabilirsiniz.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/employer/orders')}
            >
              Siparişlere Dön
            </Button>
            <Button
              onClick={() =>
                router.push(`/dashboard/employer/orders/${orderId}`)
              }
            >
              Sipariş Detayı
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/dashboard/employer/orders/${orderId}`}
          className="text-primary-600 hover:text-primary-700 mb-4 inline-flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Sipariş Detayına Dön
        </Link>
        <div className="flex items-start gap-4">
          <div className="bg-primary-100 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
            <Star className="text-primary-600 h-6 w-6" />
          </div>
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Değerlendirme Yap
            </h1>
            <p className="text-gray-600">
              Satıcının performansını değerlendirin ve deneyiminizi paylaşın
            </p>
          </div>
        </div>
      </div>

      {/* Order Info Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50 p-6">
        <div className="flex items-start gap-4">
          <Package className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
          <div className="flex-1">
            <h2 className="mb-2 font-semibold text-blue-900">
              Sipariş Bilgileri
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-700">Sipariş:</span>
                <span className="text-blue-900">
                  {order.customOrderDetails?.title || `#${order.orderNumber}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">Satıcı:</span>
                <span className="text-blue-900">
                  {order.seller?.name || 'Satıcı'}
                </span>
              </div>
              {order.completedAt && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-700">Tamamlanma:</span>
                  <span className="text-blue-900">
                    {formatDate(order.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Review Form */}
      <Card className="p-6">
        <ReviewForm
          orderId={orderId}
          type={ReviewType.ORDER}
          onSuccess={handleReviewSuccess}
          onCancel={handleCancel}
        />
      </Card>

      {/* Guidelines */}
      <Card className="mt-6 bg-gray-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">
          Değerlendirme Yönergeleri
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              <strong>Dürüst olun:</strong> Gerçek deneyiminizi yansıtan bir
              değerlendirme yapın.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              <strong>Yapıcı olun:</strong> Eleştirilerinizi yapıcı bir dille
              ifade edin.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              <strong>Detaylı olun:</strong> Diğer kullanıcılara yardımcı olacak
              detaylar ekleyin.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              <strong>Saygılı olun:</strong> Küfür, hakaret veya kişisel saldırı
              içeren yorumlar kabul edilmez.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-600 font-bold">•</span>
            <span>
              <strong>Değiştirebilirsiniz:</strong> Değerlendirmenizi
              yayınlandıktan sonra 30 gün içinde düzenleyebilirsiniz.
            </span>
          </li>
        </ul>
      </Card>

      {/* Privacy Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Değerlendirmeniz yayınlandığında satıcı ve diğer kullanıcılar
          tarafından görülebilir.
        </p>
        <p className="mt-1">
          Değerlendirmeler{' '}
          <Link
            href="/legal/terms"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Kullanım Koşullarımıza
          </Link>{' '}
          tabidir.
        </p>
      </div>
    </div>
  );
}
