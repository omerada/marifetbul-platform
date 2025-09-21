import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  UserCheck,
  CreditCard,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Güvenlik - MarifetBul',
  description: 'MarifetBul güvenlik önlemleri ve kullanıcı koruması.',
};

export default function SafetyPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Güvenlik
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              MarifetBul&apos;da güvenliğiniz bizim önceliğimizdir.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="grid gap-8 md:grid-cols-2">
              <Card className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    SSL Şifreleme
                  </h3>
                </div>
                <p className="text-gray-600">
                  Tüm veri iletişimi 256-bit SSL şifreleme ile korunur.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Lock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Güvenli Ödeme
                  </h3>
                </div>
                <p className="text-gray-600">
                  Ödemeler güvenli sağlayıcılar aracılığıyla işlenir.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <UserCheck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Kimlik Doğrulama
                  </h3>
                </div>
                <p className="text-gray-600">
                  Tüm kullanıcılar kimlik doğrulama sürecinden geçer.
                </p>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Para Güvencesi
                  </h3>
                </div>
                <p className="text-gray-600">
                  Paranız proje tamamlanana kadar güvencede tutulur.
                </p>
              </Card>
            </div>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Güvenlik İpuçları
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="mt-1 mr-3 h-5 w-5 text-green-500" />
                  <p className="text-gray-600">
                    Güçlü ve benzersiz şifreler kullanın
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-1 mr-3 h-5 w-5 text-green-500" />
                  <p className="text-gray-600">
                    İki faktörlü kimlik doğrulamayı etkinleştirin
                  </p>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="mt-1 mr-3 h-5 w-5 text-green-500" />
                  <p className="text-gray-600">
                    Şüpheli aktiviteleri hemen bildirin
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="mt-1 mr-3 h-5 w-5 text-orange-500" />
                  <p className="text-gray-600">
                    Platform dışında ödeme yapmayın
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
