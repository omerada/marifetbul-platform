'use client';

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { PaymentForm } from '@/components/forms/PaymentForm'; 
import { Order, ServicePackage, Job } from '@/types';
import Image from 'next/image';
import { formatCurrency } from '@/lib';

// Helper function to get image source as string
const getPackageImageSrc = (
  image:
    | string
    | { id: string; name: string; url: string; type: string }
    | undefined
): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ServicePackage | Job;
  type: 'package' | 'job';
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  item,
  type,
}) => {
  const [currentStep, setCurrentStep] = useState<
    'review' | 'payment' | 'success'
  >('review');
  const [transactionId, setTransactionId] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Create order from item
  const createOrder = (): Order => {
    let subtotal: number;

    if (type === 'package') {
      subtotal = (item as ServicePackage).price;
    } else {
      const jobBudget = (item as Job).budget;
      subtotal = typeof jobBudget === 'number' ? jobBudget : jobBudget.amount;
    }

    const tax = subtotal * 0.18; // 18% KDV
    const discount = 0;
    const total = subtotal + tax - discount;

    return {
      id: `order-${Date.now()}`,
      packageId: type === 'package' ? item.id : '',
      buyerId: 'current-user', // Required field
      sellerId:
        type === 'package' ? (item as ServicePackage).freelancerId : 'seller', // Required field
      status: 'pending',
      totalAmount: total, // Required field
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'current-user',
      user: {
        id: 'current-user',
        firstName: 'Kullanıcı',
        lastName: 'Adı',
        email: 'user@example.com',
        userType: 'freelancer',
        accountStatus: 'active',
        verificationStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      amount: total,
      subtotal,
      tax,
      discount,
      total,
      currency: 'TRY',
      paymentStatus: 'pending',
    };
  };

  const order = createOrder();

  const handlePaymentSuccess = (txId: string) => {
    setTransactionId(txId);
    setCurrentStep('success');
    setError('');
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleClose = () => {
    setCurrentStep('review');
    setTransactionId('');
    setError('');
    onClose();
  };

  const renderReviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sipariş Özeti</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-start space-x-4">
          {type === 'package' && (
            <Image
              src={
                getPackageImageSrc((item as ServicePackage).images?.[0]) ||
                '/placeholder.jpg'
              }
              alt={(item as ServicePackage).title}
              width={64}
              height={64}
              className="h-16 w-16 rounded object-cover"
            />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {type === 'package'
                ? (item as ServicePackage).description
                : (item as Job).description}
            </p>
            <div className="mt-2">
              <span className="text-lg font-semibold text-blue-600">
                {formatCurrency(order.subtotal || 0, 'TRY')}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold">Fiyat Detayları</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Hizmet Bedeli:</span>
            <span>{formatCurrency(order.subtotal || 0, 'TRY')}</span>
          </div>
          <div className="flex justify-between">
            <span>KDV (%18):</span>
            <span>{formatCurrency(order.tax || 0, 'TRY')}</span>
          </div>
          {(order.discount || 0) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>İndirim:</span>
              <span>-{formatCurrency(order.discount || 0, 'TRY')}</span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Toplam:</span>
            <span>{formatCurrency(order.total || 0, 'TRY')}</span>
          </div>
        </div>
      </Card>

      <div className="flex space-x-3">
        <Button variant="outline" onClick={handleClose} className="flex-1">
          İptal
        </Button>
        <Button
          onClick={() => setCurrentStep('payment')}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          Ödemeye Geç
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ödeme Bilgileri</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <div className="text-red-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <PaymentForm
        order={order}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('review')}
          className="flex-1"
        >
          Geri Dön
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ödeme Başarılı</h2>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="py-8">
        <div className="mb-4 text-6xl">✅</div>
        <h3 className="mb-2 text-xl font-semibold text-green-600">
          Ödemeniz Başarıyla Tamamlandı!
        </h3>
        <p className="mb-4 text-gray-600">
          İşlem numaranız:{' '}
          <span className="font-mono text-sm">{transactionId}</span>
        </p>
        <p className="text-sm text-gray-500">
          Siparişiniz işleme alınmıştır. En kısa sürede sizinle iletişime
          geçeceğiz.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="mb-2 font-semibold">Sipariş Detayları</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Hizmet:</span>
            <span>{item.title}</span>
          </div>
          <div className="flex justify-between">
            <span>Tutar:</span>
            <span>{formatCurrency(order.total || 0, 'TRY')}</span>
          </div>
          <div className="flex justify-between">
            <span>Tarih:</span>
            <span>{new Date().toLocaleDateString('tr-TR')}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={handleClose}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Tamam
      </Button>
    </div>
  );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white">
        <div className="p-6">
          {currentStep === 'review' && renderReviewStep()}
          {currentStep === 'payment' && renderPaymentStep()}
          {currentStep === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};
