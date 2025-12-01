'use client';

/**
 * ================================================
 * CUSTOM ORDER FORM COMPONENT
 * ================================================
 * Form for creating custom orders directly with a freelancer
 * Supports dual payment system (ESCROW_PROTECTED vs MANUAL_IBAN)
 *
 * Features:
 * - Custom order details (title, description, requirements)
 * - Amount and deadline selection
 * - Payment mode selection with seller IBAN validation
 * - Real-time fee calculation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PaymentMode } from '@/types/business/features/order';
import { getSellerPaymentStatus } from '@/lib/api/users';
import { PaymentModeSelector } from '@/components/domains/payments/PaymentModeSelector';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { FileText, Calendar, DollarSign, Send, X } from 'lucide-react';
import logger from '@/lib/infrastructure/monitoring/logger';

const customOrderSchema = z.object({
  title: z
    .string()
    .min(5, 'Ba�l�k en az 5 karakter olmal�d�r')
    .max(200, 'Ba�l�k en fazla 200 karakter olabilir'),
  description: z
    .string()
    .min(20, 'A��klama en az 20 karakter olmal�d�r')
    .max(5000, 'A��klama en fazla 5000 karakter olabilir'),
  requirements: z
    .string()
    .min(10, 'Gereksinimler en az 10 karakter olmal�d�r')
    .max(5000, 'Gereksinimler en fazla 5000 karakter olabilir'),
  amount: z
    .number()
    .min(100, 'Tutar en az 100 TRY olmal�d�r')
    .max(1000000, 'Tutar en fazla 1,000,000 TRY olabilir'),
  deadline: z.string().min(1, 'Teslim tarihi gereklidir'),
  contactInfo: z
    .string()
    .min(5, '�leti�im bilgisi gereklidir')
    .max(100, '�leti�im bilgisi �ok uzun'),
  paymentMode: z.nativeEnum(PaymentMode),
});

type CustomOrderFormData = z.infer<typeof customOrderSchema>;

interface CustomOrderFormProps {
  /** Seller/Freelancer to create order with */
  seller: {
    id: string;
    name: string;
    avatar?: string;
  };
  /** Callback when order is submitted */
  onSubmit: (data: CustomOrderFormData) => void | Promise<void>;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Default form values */
  defaultValues?: Partial<CustomOrderFormData>;
  /** Is form submitting */
  isSubmitting?: boolean;
}

/**
 * Calculate platform fee (5% of amount)
 */
const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * 0.05);
};

/**
 * Calculate seller net amount (amount - fee)
 */
const calculateSellerAmount = (amount: number): number => {
  return amount - calculatePlatformFee(amount);
};

export function CustomOrderForm({
  seller,
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
}: CustomOrderFormProps) {
  const [sellerHasIban, setSellerHasIban] = useState(false);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomOrderFormData>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      paymentMode: PaymentMode.ESCROW_PROTECTED,
      ...defaultValues,
    },
  });

  const title = watch('title');
  const description = watch('description');
  const requirements = watch('requirements');
  const amount = watch('amount') || 0;

  // Fetch seller IBAN status on mount
  useEffect(() => {
    const fetchSellerPaymentStatus = async () => {
      if (!seller.id) return;

      try {
        const status = await getSellerPaymentStatus(seller.id);
        setSellerHasIban(status.hasValidIban);
        logger.debug('Seller payment status fetched for custom order', {
          component: 'CustomOrderForm',
          status,
        });
      } catch (error) {
        logger.error(
          'Failed to fetch seller payment status:',
          error instanceof Error ? error : new Error(String(error))
        );
        setSellerHasIban(false);
      } finally {
        setIsLoadingPaymentStatus(false);
      }
    };

    fetchSellerPaymentStatus();
  }, [seller.id]);

  const handleFormSubmit = async (data: CustomOrderFormData) => {
    await onSubmit(data);
  };

  const platformFee = calculatePlatformFee(amount);
  const sellerAmount = calculateSellerAmount(amount);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Seller Info Card */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <div className="flex items-center">
          {seller.avatar && (
            <img
              src={seller.avatar}
              alt={seller.name}
              className="mr-3 h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-gray-900">
              Sipari� Olu�turuyorsunuz
            </h3>
            <p className="text-sm text-gray-600">
              Freelancer: <span className="font-medium">{seller.name}</span>
            </p>
          </div>
        </div>
      </Card>

      {/* Order Title */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Sipari� Ba�l���
          <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('title')}
          type="text"
          placeholder="�rn: Modern Logo Tasar�m�"
          className="w-full"
          disabled={isSubmitting}
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.title && (
            <span className="text-red-600">{errors.title.message}</span>
          )}
          <span className="ml-auto text-gray-500">
            {title?.length || 0}/200
          </span>
        </div>
      </div>

      {/* Order Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          A��klama
          <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('description')}
          rows={5}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Projenizi detayl� olarak a��klay�n..."
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.description && (
            <span className="text-red-600">{errors.description.message}</span>
          )}
          <span className="ml-auto text-gray-500">
            {description?.length || 0}/5000
          </span>
        </div>
      </div>

      {/* Requirements */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Gereksinimler ve Beklentiler
          <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('requirements')}
          rows={4}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Teknik gereksinimler, dosya formatlar�, teslim edilecekler vb."
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.requirements && (
            <span className="text-red-600">{errors.requirements.message}</span>
          )}
          <span className="ml-auto text-gray-500">
            {requirements?.length || 0}/5000
          </span>
        </div>
      </div>

      {/* Amount and Deadline Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sipari� Tutar� (TRY)
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              {...register('amount', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="100"
              max="1000000"
              placeholder="Tutar"
              className="w-full pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        {/* Deadline */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Teslim Tarihi
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              {...register('deadline')}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10"
              disabled={isSubmitting}
            />
          </div>
          {errors.deadline && (
            <p className="mt-1 text-sm text-red-600">
              {errors.deadline.message}
            </p>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          �leti�im Bilgisi
          <span className="text-red-500">*</span>
        </label>
        <Input
          {...register('contactInfo')}
          type="text"
          placeholder="Telefon numaras� veya e-posta"
          className="w-full"
          disabled={isSubmitting}
        />
        {errors.contactInfo && (
          <p className="mt-1 text-sm text-red-600">
            {errors.contactInfo.message}
          </p>
        )}
      </div>

      {/* Payment Mode Selection */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          �deme Y�ntemi
          <span className="text-red-500">*</span>
        </label>
        <PaymentModeSelector
          value={watch('paymentMode')}
          onChange={(mode: PaymentMode) => setValue('paymentMode', mode)}
          amount={amount}
          sellerHasIban={sellerHasIban}
          disabled={isLoadingPaymentStatus || isSubmitting}
        />
        {errors.paymentMode && (
          <p className="mt-2 text-sm text-red-600">
            {errors.paymentMode.message}
          </p>
        )}
      </div>

      {/* Order Summary */}
      {amount > 0 && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-3 font-medium text-blue-900">Sipari� �zeti</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Sipari� Tutar�:</span>
              <span className="font-medium">
                ?{amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Platform Komisyonu (5%):</span>
              <span className="font-medium">
                ?
                {platformFee.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-2 font-semibold">
              <span>Freelancer Alaca��:</span>
              <span className="text-green-700">
                ?
                {sellerAmount.toLocaleString('tr-TR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          �ptal
        </Button>
        <Button type="submit" disabled={isSubmitting || isLoadingPaymentStatus}>
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Olu�turuluyor...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Sipari� Olu�tur
            </>
          )}
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border-yellow-200 bg-yellow-50 p-4">
        <h4 className="mb-2 flex items-center font-medium text-yellow-900">
          <FileText className="mr-2 h-5 w-5" />
          �nemli Bilgiler
        </h4>
        <ul className="space-y-1 text-sm text-yellow-800">
          <li>� Sipari� olu�turduktan sonra �deme yapman�z gerekecektir</li>
          <li>
            � Escrow korumal� �demede paran�z g�vende tutulur, freelancer i�i
            tamamlad�ktan sonra �deme yap�l�r
          </li>
          <li>
            � Manuel IBAN �demesinde do�rudan freelancer'�n hesab�na �deme
            yapars�n�z
          </li>
          <li>� T�m detaylar� net bir �ekilde belirtti�inizden emin olun</li>
          <li>� Platform komisyonu otomatik olarak hesaplan�r (%5)</li>
        </ul>
      </Card>
    </form>
  );
}
