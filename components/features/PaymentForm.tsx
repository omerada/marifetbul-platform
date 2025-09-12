import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { usePayment } from '@/hooks/usePayment';
import { Order } from '@/types';
import {
  CreditCard,
  Building2,
  Wallet,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PaymentFormProps {
  order: Order;
  onSuccess?: (paymentId: string) => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  order,
  onSuccess,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<
    'credit_card' | 'bank_transfer' | 'wallet'
  >('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    holderName: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const { createPayment, loading, error, formatPaymentAmount } = usePayment();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async () => {
    try {
      setIsProcessing(true);

      const paymentRequest = {
        orderId: order.id,
        amount: order.total,
        currency: 'TRY' as const,
        method: selectedMethod,
        card:
          selectedMethod === 'credit_card'
            ? {
                number: formData.cardNumber,
                expiryMonth: formData.expiryMonth,
                expiryYear: formData.expiryYear,
                cvv: formData.cvv,
                holderName: formData.holderName,
              }
            : undefined,
        billingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: 'user@example.com', // This would come from user data
          addressLine1: formData.address,
          address: formData.address,
          city: formData.city,
          state: '',
          postalCode: formData.postalCode,
          country: 'TR',
        },
      };

      const success = await createPayment(paymentRequest);
      if (success) {
        onSuccess?.(order.id);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Building2 className="h-4 w-4" />;
      case 'wallet':
        return <Wallet className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const renderCreditCardForm = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="cardNumber"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Kart Numarası
        </label>
        <Input
          id="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={formData.cardNumber}
          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="expiryMonth"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Ay
          </label>
          <select
            id="expiryMonth"
            value={formData.expiryMonth}
            onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Ay</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="expiryYear"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Yıl
          </label>
          <select
            id="expiryYear"
            value={formData.expiryYear}
            onChange={(e) => handleInputChange('expiryYear', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Yıl</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label
            htmlFor="cvv"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            CVV
          </label>
          <Input
            id="cvv"
            placeholder="123"
            maxLength={4}
            value={formData.cvv}
            onChange={(e) => handleInputChange('cvv', e.target.value)}
            className="font-mono"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="holderName"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Kart Sahibi Adı
        </label>
        <Input
          id="holderName"
          placeholder="JOHN DOE"
          value={formData.holderName}
          onChange={(e) =>
            handleInputChange('holderName', e.target.value.toUpperCase())
          }
        />
      </div>
    </div>
  );

  const renderBankTransferForm = () => (
    <div className="space-y-4">
      <div className="rounded-lg bg-blue-50 p-4">
        <div className="flex items-start space-x-3">
          <Building2 className="mt-0.5 h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium text-blue-900">
              Banka Havalesi Bilgileri
            </h4>
            <p className="mt-1 text-sm text-blue-700">
              Ödeme onayından sonra banka havalesi bilgileri e-posta ile
              gönderilecektir.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Hesap Adı:</span>
          <span className="font-medium">Marifet Teknoloji A.Ş.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">IBAN:</span>
          <span className="font-mono">TR98 0001 2345 6789 0123 4567 89</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Açıklama:</span>
          <span className="font-medium">Sipariş #{order.id}</span>
        </div>
      </div>
    </div>
  );

  const renderWalletForm = () => (
    <div className="space-y-4">
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-start space-x-3">
          <Wallet className="mt-0.5 h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-900">Cüzdan Bakiyesi</h4>
            <p className="mt-1 text-sm text-green-700">
              Mevcut bakiye:{' '}
              <span className="font-medium">{formatPaymentAmount(2500)}</span>
            </p>
          </div>
        </div>
      </div>

      {order.total > 2500 && (
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-900">Yetersiz Bakiye</h4>
              <p className="mt-1 text-sm text-yellow-700">
                Eksik tutar:{' '}
                <span className="font-medium">
                  {formatPaymentAmount(order.total - 2500)}
                </span>
              </p>
              <p className="text-sm text-yellow-700">
                Lütfen cüzdanınıza bakiye ekleyin veya başka bir ödeme yöntemi
                seçin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBillingAddressForm = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Fatura Adresi</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Ad
          </label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Soyad
          </label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="address"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Adres
        </label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Şehir
          </label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="postalCode"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Posta Kodu
          </label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span>Güvenli Ödeme</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sipariş #{order.id} için ödeme bilgilerinizi girin
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-medium">Sipariş Özeti</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Hizmet Tutarı:</span>
              <span>{formatPaymentAmount(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Komisyonu:</span>
              <span>{formatPaymentAmount(order.total * 0.1)}</span>
            </div>
            <div className="mt-2 border-t pt-2">
              <div className="flex justify-between font-medium">
                <span>Toplam:</span>
                <span>{formatPaymentAmount(order.total * 1.1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <h3 className="mb-4 text-lg font-medium">Ödeme Yöntemi</h3>

          <Tabs defaultValue={selectedMethod}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="credit_card"
                className="flex items-center space-x-2"
              >
                {getMethodIcon('credit_card')}
                <span>Kredi Kartı</span>
              </TabsTrigger>
              <TabsTrigger
                value="bank_transfer"
                className="flex items-center space-x-2"
              >
                {getMethodIcon('bank_transfer')}
                <span>Havale</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex items-center space-x-2"
              >
                {getMethodIcon('wallet')}
                <span>Cüzdan</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4">
              <TabsContent value="credit_card">
                {renderCreditCardForm()}
              </TabsContent>

              <TabsContent value="bank_transfer">
                {renderBankTransferForm()}
              </TabsContent>

              <TabsContent value="wallet">{renderWalletForm()}</TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Billing Address */}
        {(selectedMethod === 'credit_card' ||
          selectedMethod === 'bank_transfer') && (
          <div>
            <div className="mb-6 border-t pt-6" />
            {renderBillingAddressForm()}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <h4 className="font-medium text-red-900">Ödeme Hatası</h4>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start space-x-3">
            <Shield className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-900">Güvenli Ödeme</h4>
              <p className="mt-1 text-sm text-blue-700">
                Tüm ödeme bilgileriniz SSL ile şifrelenmektedir. Kredi kartı
                bilgileriniz saklanmaz.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading || isProcessing}
            className="flex-1"
          >
            İptal
          </Button>

          <Button
            onClick={onSubmit}
            disabled={
              loading ||
              isProcessing ||
              (selectedMethod === 'wallet' && order.total > 2500)
            }
            className="flex-1"
          >
            {loading || isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>İşleniyor...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>{formatPaymentAmount(order.total * 1.1)} Öde</span>
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
