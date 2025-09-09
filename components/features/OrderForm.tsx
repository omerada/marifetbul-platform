'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ServicePackage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ShoppingCart, CreditCard, Calendar, FileText } from 'lucide-react';

const orderSchema = z.object({
  requirements: z
    .string()
    .min(20, 'Gereksinimler en az 20 karakter olmalıdır')
    .max(1000, 'Gereksinimler en fazla 1000 karakter olabilir'),
  deadline: z.string().optional(),
  additionalServices: z.array(z.string()).optional(),
  contactInfo: z
    .string()
    .min(5, 'İletişim bilgisi gereklidir')
    .max(100, 'İletişim bilgisi çok uzun'),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderFormProps {
  servicePackage: ServicePackage;
  onSubmit: (data: OrderFormData) => void;
  onCancel: () => void;
}

const additionalServiceOptions = [
  { id: 'express', name: 'Ekspres Teslimat (24 saat)', price: 200 },
  { id: 'extra-revision', name: 'Ekstra Revizyon (+3 kez)', price: 150 },
  { id: 'source-files', name: 'Kaynak Dosyalar', price: 100 },
  { id: 'commercial-license', name: 'Ticari Kullanım Lisansı', price: 300 },
];

export function OrderForm({
  servicePackage,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const requirements = watch('requirements');

  const calculateTotal = () => {
    const basePrice = servicePackage.price;
    const additionalPrice = selectedServices.reduce((total, serviceId) => {
      const service = additionalServiceOptions.find((s) => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
    return basePrice + additionalPrice;
  };

  const calculateFees = () => {
    const total = calculateTotal();
    const platformFee = total * 0.05; // 5% platform fee
    const serviceFee = 10; // Fixed service fee
    return {
      platformFee,
      serviceFee,
      grandTotal: total + platformFee + serviceFee,
    };
  };

  const handleFormSubmit = async (data: OrderFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Order submitted:', {
        servicePackageId: servicePackage.id,
        ...data,
        selectedServices,
        total: calculateFees().grandTotal,
      });

      onSubmit(data);
    } catch (error) {
      console.error('Error submitting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAdditionalService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const { platformFee, serviceFee, grandTotal } = calculateFees();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Requirements */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Proje Gereksinimleri *
        </label>
        <textarea
          {...register('requirements')}
          rows={5}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Projeniz hakkında detaylı bilgi verin, beklentilerinizi açıklayın..."
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.requirements && (
            <span className="text-red-600">{errors.requirements.message}</span>
          )}
          <span className="ml-auto text-gray-500">
            {requirements?.length || 0}/1000
          </span>
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Özel Teslim Tarihi
        </label>
        <div className="relative">
          <Calendar className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="date"
            {...register('deadline')}
            className="pl-10"
            min={
              new Date(
                Date.now() + servicePackage.deliveryTime * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split('T')[0]
            }
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Normal teslimat süresi: {servicePackage.deliveryTime} gün
        </p>
      </div>

      {/* Contact Info */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          İletişim Bilgisi *
        </label>
        <Input
          {...register('contactInfo')}
          placeholder="WhatsApp, Telegram veya e-posta adresiniz"
          error={errors.contactInfo?.message}
        />
        <p className="mt-1 text-xs text-gray-500">
          Freelancer&apos;ın sizinle iletişim kurması için
        </p>
      </div>

      {/* Additional Services */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Ek Hizmetler
        </label>
        <div className="space-y-3">
          {additionalServiceOptions.map((service) => (
            <div
              key={service.id}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selectedServices.includes(service.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => toggleAdditionalService(service.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => toggleAdditionalService(service.id)}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {service.name}
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  +₺{service.price.toLocaleString('tr-TR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <Card className="border-gray-200 bg-gray-50 p-4">
        <h4 className="mb-3 font-medium text-gray-900">Sipariş Özeti</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Hizmet Bedeli:</span>
            <span className="font-medium">
              ₺{servicePackage.price.toLocaleString('tr-TR')}
            </span>
          </div>

          {selectedServices.map((serviceId) => {
            const service = additionalServiceOptions.find(
              (s) => s.id === serviceId
            );
            return service ? (
              <div
                key={serviceId}
                className="flex justify-between text-blue-600"
              >
                <span>{service.name}:</span>
                <span>+₺{service.price.toLocaleString('tr-TR')}</span>
              </div>
            ) : null;
          })}

          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ara Toplam:</span>
              <span className="font-medium">
                ₺{calculateTotal().toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Komisyonu (%5):</span>
              <span className="font-medium">
                ₺{platformFee.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hizmet Bedeli:</span>
              <span className="font-medium">
                ₺{serviceFee.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold">
            <span>Toplam:</span>
            <span className="text-blue-600">
              ₺{grandTotal.toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">
          Ödeme Yöntemi
        </label>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-500 bg-blue-50 p-3">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Kredi Kartı</div>
                <div className="text-xs text-blue-700">Güvenli ödeme</div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 opacity-50">
            <div className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-500">Havale/EFT</div>
                <div className="text-xs text-gray-400">Yakında</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="text-sm text-blue-800">
          <p className="mb-2 font-medium">Önemli Bilgiler:</p>
          <ul className="space-y-1 text-xs">
            <li>
              • Ödeme, proje tamamlandıktan sonra freelancer&apos;a aktarılır
            </li>
            <li>• 7 gün para iade garantisi mevcuttur</li>
            <li>• Tüm iletişim platform üzerinden yapılmalıdır</li>
            <li>• Proje iptal edilirse ücret iade edilir</li>
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              İşleniyor...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ödemeye Geç (₺{grandTotal.toLocaleString('tr-TR')})
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
