/**
 * ================================================
 * PAYOUT REQUEST PAGE
 * ================================================
 * Page for requesting new payouts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 5, 2025
 * @sprint Sprint 1 - Week 1 - Day 3-4: Payout Request Flow
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PayoutRequestForm } from '@/components/domains/wallet';
import { BankVerificationStatus } from '@/components/domains/wallet';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Alert } from '@/components/ui/Alert';
import {
  Wallet,
  ArrowLeft,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getBalance } from '@/lib/api/wallet';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// PAGE COMPONENT
// ================================================

export default function PayoutRequestPage() {
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // ==================== EFFECTS ====================

  useEffect(() => {
    loadBalance();
  }, []);

  // ==================== DATA LOADING ====================

  const loadBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const balanceData = await getBalance();
      setAvailableBalance(balanceData.availableBalance);
    } catch (error) {
      logger.error('Failed to load balance', error as Error);
      toast.error('Hata', {
        description: 'Bakiye bilgileri yüklenirken bir hata oluştu',
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // ==================== HANDLERS ====================

  const handleSuccess = (payoutId: string) => {
    logger.info('Payout request created successfully', { payoutId });

    // Redirect to payouts list with success message
    router.push('/dashboard/wallet/payouts?success=true');
  };

  const handleCancel = () => {
    router.back();
  };

  // ==================== RENDER ====================

  // Loading state
  if (isLoadingBalance) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-gray-600">Bakiye bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>

        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 p-4 shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Para Çekme İşlemi
            </h1>
            <p className="text-gray-600">
              Kazançlarınızı banka hesabınıza güvenle aktarın
            </p>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-green-600 p-2">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Hızlı İşlem</p>
              <p className="mt-1 text-xs text-green-700">
                1-5 iş günü içinde hesabınızda
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-600 p-2">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">
                Güvenli Transfer
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Şifreli ve güvenli banka transferi
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-purple-200 bg-purple-50 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-600 p-2">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">
                Otomatik Onay
              </p>
              <p className="mt-1 text-xs text-purple-700">
                Admin onayından sonra işleme alınır
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Bank Verification Status */}
      <div className="mb-6">
        <BankVerificationStatus showFullDetails={false} />
      </div>

      {/* Important Notice */}
      <Alert variant="default" className="mb-6 border-yellow-200 bg-yellow-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div className="text-sm text-yellow-900">
            <p className="font-medium">Önemli Bilgiler</p>
            <ul className="mt-2 space-y-1 text-yellow-700">
              <li>
                • Minimum para çekme tutarı <strong>100 TL</strong>&apos;dir
              </li>
              <li>
                • Platform ücreti <strong>%2</strong> + <strong>5 TL</strong>{' '}
                işlem ücreti uygulanır
              </li>
              <li>• Banka hesabınızın doğrulanmış olması gerekmektedir</li>
              <li>• İşlem süresi ortalama 1-5 iş günüdür</li>
              <li>
                • Minimum <strong>10 TL</strong> bakiye rezervi tutulur
              </li>
            </ul>
          </div>
        </div>
      </Alert>

      {/* Payout Request Form */}
      <PayoutRequestForm
        availableBalance={availableBalance}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Help Section */}
      <Card className="mt-6 border-gray-200 bg-gray-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">
          Sık Sorulan Sorular
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <p className="font-medium">
              Para çekme talebim ne kadar sürede işleme alınır?
            </p>
            <p className="mt-1 text-gray-600">
              Talebiniz admin onayından sonra 1-5 iş günü içinde banka
              hesabınıza aktarılır.
            </p>
          </div>
          <div>
            <p className="font-medium">Ücretsiz para çekebilir miyim?</p>
            <p className="mt-1 text-gray-600">
              Platform ücreti %2 ve 5 TL sabit işlem ücreti uygulanmaktadır.
            </p>
          </div>
          <div>
            <p className="font-medium">Banka hesabımı nasıl doğrularım?</p>
            <p className="mt-1 text-gray-600">
              Banka hesabınızı ekledikten sonra admin ekibimiz tarafından
              doğrulanacaktır. Bu işlem genellikle 24 saat içinde tamamlanır.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
