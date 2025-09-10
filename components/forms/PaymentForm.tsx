'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  formatCardNumber,
  formatExpiryDate,
  processPayment,
  calculateOrderTotal,
} from '@/lib/utils/payment';
import { PaymentCard, BillingAddress, Order } from '@/types';

interface PaymentFormProps {
  order: Order;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  order,
  onSuccess,
  onError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState<PaymentCard>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: '',
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'TR',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card validation
    if (!validateCardNumber(cardData.cardNumber)) {
      newErrors.cardNumber = 'Geçersiz kart numarası';
    }

    if (!validateExpiryDate(cardData.expiryMonth, cardData.expiryYear)) {
      newErrors.expiry = 'Geçersiz son kullanma tarihi';
    }

    if (!validateCVV(cardData.cvv)) {
      newErrors.cvv = 'Geçersiz CVV';
    }

    if (!cardData.cardHolderName.trim()) {
      newErrors.cardholderName = 'Kart sahibi adı gerekli';
    }

    // Billing address validation
    if (!billingAddress.fullName.trim()) {
      newErrors.fullName = 'Ad soyad gerekli';
    }

    if (!billingAddress.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    }

    if (!billingAddress.addressLine1.trim()) {
      newErrors.address = 'Adres gerekli';
    }

    if (!billingAddress.city.trim()) {
      newErrors.city = 'Şehir gerekli';
    }

    if (!billingAddress.postalCode.trim()) {
      newErrors.postalCode = 'Posta kodu gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const total = calculateOrderTotal(
        order.subtotal,
        order.tax,
        order.discount
      );
      const result = await processPayment(total, order.currency, cardData);

      if (result.success && result.transactionId) {
        onSuccess(result.transactionId);
      } else {
        onError(result.error || 'Ödeme işlemi başarısız');
      }
    } catch {
      onError('Beklenmeyen bir hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardNumberChange = (value: string) => {
    const formatted = formatCardNumber(value);
    setCardData((prev) => ({ ...prev, cardNumber: formatted }));

    if (errors.cardNumber) {
      setErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  const handleExpiryChange = (value: string) => {
    const formatted = formatExpiryDate(value);
    const [month, year] = formatted.split('/');
    setCardData((prev) => ({
      ...prev,
      expiryMonth: month || '',
      expiryYear: year || '',
    }));

    if (errors.expiry) {
      setErrors((prev) => ({ ...prev, expiry: '' }));
    }
  };

  const orderTotal = calculateOrderTotal(
    order.subtotal,
    order.tax,
    order.discount
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <Card className="bg-gray-50 p-4">
        <h3 className="mb-3 text-lg font-semibold">Sipariş Özeti</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Ara Toplam:</span>
            <span>
              {order.subtotal.toFixed(2)} {order.currency}
            </span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between">
              <span>KDV:</span>
              <span>
                {order.tax.toFixed(2)} {order.currency}
              </span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>İndirim:</span>
              <span>
                -{order.discount.toFixed(2)} {order.currency}
              </span>
            </div>
          )}
          <hr className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Toplam:</span>
            <span>
              {orderTotal.toFixed(2)} {order.currency}
            </span>
          </div>
        </div>
      </Card>

      {/* Card Information */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Kart Bilgileri</h3>
        <div className="space-y-4">
          <div>
            <Input
              label="Kart Numarası"
              value={cardData.cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              error={errors.cardNumber}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Son Kullanma Tarihi"
                value={`${cardData.expiryMonth}${cardData.expiryYear ? '/' + cardData.expiryYear : ''}`}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="MM/YY"
                maxLength={5}
                error={errors.expiry}
              />
            </div>
            <div>
              <Input
                label="CVV"
                value={cardData.cvv}
                onChange={(e) =>
                  setCardData((prev) => ({ ...prev, cvv: e.target.value }))
                }
                placeholder="123"
                maxLength={3}
                error={errors.cvv}
              />
            </div>
          </div>

          <div>
            <Input
              label="Kart Sahibi Adı"
              value={cardData.cardHolderName}
              onChange={(e) =>
                setCardData((prev) => ({
                  ...prev,
                  cardHolderName: e.target.value,
                }))
              }
              placeholder="Ad Soyad"
              error={errors.cardholderName}
            />
          </div>
        </div>
      </Card>

      {/* Billing Address */}
      <Card className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Fatura Adresi</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Input
                label="Ad Soyad"
                value={billingAddress.fullName}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                error={errors.fullName}
              />
            </div>
            <div>
              <Input
                label="E-posta"
                type="email"
                value={billingAddress.email}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                error={errors.email}
              />
            </div>
          </div>

          <div>
            <Input
              label="Telefon"
              value={billingAddress.phone}
              onChange={(e) =>
                setBillingAddress((prev) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="+90 5XX XXX XX XX"
            />
          </div>

          <div>
            <Input
              label="Adres"
              value={billingAddress.addressLine1}
              onChange={(e) =>
                setBillingAddress((prev) => ({
                  ...prev,
                  addressLine1: e.target.value,
                }))
              }
              error={errors.address}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Input
                label="Şehir"
                value={billingAddress.city}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                error={errors.city}
              />
            </div>
            <div>
              <Input
                label="İl"
                value={billingAddress.state}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Input
                label="Posta Kodu"
                value={billingAddress.postalCode}
                onChange={(e) =>
                  setBillingAddress((prev) => ({
                    ...prev,
                    postalCode: e.target.value,
                  }))
                }
                error={errors.postalCode}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isProcessing}
          className="min-w-[200px] bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing
            ? 'İşleniyor...'
            : `${orderTotal.toFixed(2)} ${order.currency} Öde`}
        </Button>
      </div>
    </form>
  );
};
