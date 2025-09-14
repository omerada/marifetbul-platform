'use client';

import { SupportLayout } from '@/components/features/support';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useRouter } from 'next/navigation';
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MessageCircle,
} from 'lucide-react';

export default function SupportPage() {
  const router = useRouter();

  const handleCreateTicket = () => {
    router.push('/support/create');
  };

  const handleViewTickets = () => {
    router.push('/support/tickets');
  };

  const handleStartChat = () => {
    router.push('/help/chat');
  };

  return (
    <SupportLayout onCreateTicket={handleCreateTicket} showCreateButton={true}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <Card className="p-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Destek Sistemine Hoş Geldiniz
          </h2>
          <p className="mb-6 text-lg text-gray-600">
            Teknik sorunlarınız için destek talebi oluşturun, geçmiş
            taleplerinizi takip edin veya canlı destek ile anında yardım alın.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={handleCreateTicket}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Yeni Destek Talebi
            </Button>

            <Button
              onClick={handleStartChat}
              variant="outline"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Canlı Destek
            </Button>
          </div>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Yeni Talep Oluştur
            </h3>
            <p className="mb-4 text-gray-600">
              Teknik sorun, hesap problemi veya genel sorularınız için detaylı
              destek talebi oluşturun.
            </p>
            <Button onClick={handleCreateTicket} className="w-full">
              Talep Oluştur
            </Button>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Taleplerim
            </h3>
            <p className="mb-4 text-gray-600">
              Geçmiş destek taleplerinizi görüntüleyin, durum takibi yapın ve
              yanıtları kontrol edin.
            </p>
            <Button
              onClick={handleViewTickets}
              variant="outline"
              className="w-full"
            >
              Taleplerime Git
            </Button>
          </Card>

          <Card className="p-6 transition-all hover:shadow-lg">
            <div className="mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Canlı Destek
            </h3>
            <p className="mb-4 text-gray-600">
              Acil durumlar ve hızlı çözüm gerektiren sorunlar için canlı destek
              hattımızla görüşün.
            </p>
            <Button
              onClick={handleStartChat}
              variant="outline"
              className="w-full"
            >
              Chat Başlat
            </Button>
          </Card>
        </div>

        {/* Support Categories */}
        <Card className="p-8">
          <h3 className="mb-6 text-2xl font-bold text-gray-900">
            Destek Kategorileri
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Teknik Sorunlar</h4>
              </div>
              <p className="text-sm text-gray-600">
                Platform kullanımı, dosya yükleme, profil ayarları ve diğer
                teknik konular
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">
                  <FileText className="h-4 w-4 text-yellow-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Hesap İşlemleri</h4>
              </div>
              <p className="text-sm text-gray-600">
                Hesap doğrulama, profil güncelleme, şifre sıfırlama ve hesap
                güvenliği
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">
                  Ödeme & Faturalandırma
                </h4>
              </div>
              <p className="text-sm text-gray-600">
                Ödeme sorunları, fatura talebi, para çekme ve hesap bakiyesi
                konuları
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Genel Sorular</h4>
              </div>
              <p className="text-sm text-gray-600">
                Platform kullanımı, özellikler, politikalar ve diğer genel
                konular
              </p>
            </div>
          </div>
        </Card>

        {/* Support Hours & Contact Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Destek Saatleri
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pazartesi - Cuma</span>
                <span className="font-medium text-gray-900">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cumartesi</span>
                <span className="font-medium text-gray-900">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pazar</span>
                <span className="font-medium text-gray-900">Kapalı</span>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <Clock className="mr-2 inline h-4 w-4" />
                Acil durumlar için 7/24 canlı destek mevcuttur
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Yanıt Süreleri
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Canlı Destek</span>
                <span className="font-medium text-green-600">Anında</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yüksek Öncelik</span>
                <span className="font-medium text-yellow-600">2-4 saat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Normal</span>
                <span className="font-medium text-blue-600">12-24 saat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Düşük Öncelik</span>
                <span className="font-medium text-gray-600">24-48 saat</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SupportLayout>
  );
}
