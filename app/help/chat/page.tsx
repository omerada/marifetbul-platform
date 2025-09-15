'use client';

import { HelpCenterLayout } from '@/components/help';
import { ChatWindow } from '@/components/features/chat';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useChat } from '@/hooks';
import { useRouter } from 'next/navigation';
import {
  MessageCircle,
  Clock,
  Users,
  Shield,
  Zap,
  CheckCircle,
} from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  const { activeChatId, availability, startChat, sessionLoading } = useChat();

  const handleStartChat = async () => {
    try {
      await startChat({
        topic: 'Genel destek',
        department: 'general',
        priority: 'normal',
      });
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  // If chat is active, show chat window
  if (activeChatId) {
    return (
      <HelpCenterLayout title="Canlı Destek" showSearch={false}>
        <div className="container mx-auto px-4 py-8">
          <ChatWindow
            conversationId={activeChatId}
            isOpen={true}
            isMinimized={false}
          />
        </div>
      </HelpCenterLayout>
    );
  }

  return (
    <HelpCenterLayout title="Canlı Destek" showSearch={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header */}
          <Card className="p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Canlı Destek
            </h1>

            <p className="mb-6 text-lg text-gray-600">
              Destek ekibimizle anında iletişime geçin. Sorularınızı gerçek
              zamanlı olarak yanıtlıyoruz.
            </p>

            {availability?.isOnline ? (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-green-800">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  <span className="font-medium">Destek ekibi çevrimiçi</span>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Mesai saatleri dışında</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartChat}
              disabled={sessionLoading || !availability?.isOnline}
              size="lg"
              className="px-8"
            >
              {sessionLoading ? 'Bağlantı kuruluyor...' : 'Chat Başlat'}
            </Button>
          </Card>

          {/* Features */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Anında Yanıt
              </h3>
              <p className="text-gray-600">
                Sorularınızı gerçek zamanlı olarak yanıtlıyoruz. Bekleme süresi
                minimum.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Uzman Ekip
              </h3>
              <p className="text-gray-600">
                Deneyimli destek uzmanlarımız size en iyi çözümleri sunmak için
                burada.
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Güvenli İletişim
              </h3>
              <p className="text-gray-600">
                Tüm konuşmalarınız şifreli ve güvenli. Gizliliğiniz bizim için
                önemli.
              </p>
            </Card>
          </div>

          {/* Availability Status */}
          {availability && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Departman Durumu
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {availability.departments?.map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {dept.name === 'technical' && 'Teknik Destek'}
                        {dept.name === 'billing' && 'Faturalandırma'}
                        {dept.name === 'sales' && 'Satış'}
                        {dept.name === 'general' && 'Genel Destek'}
                      </div>
                      {dept.isAvailable ? (
                        <div className="text-sm text-gray-600">
                          Tahmini bekleme: {dept.estimatedWaitTime} dk
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {dept.message || 'Şu anda müsait değil'}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {dept.isAvailable ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Working Hours */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Çalışma Saatleri
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">Canlı Destek</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Pazartesi - Cuma</span>
                    <span>09:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumartesi</span>
                    <span>10:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pazar</span>
                    <span>12:00 - 18:00</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-gray-900">Acil Durum</h4>
                <div className="text-sm text-gray-600">
                  <p>Kritik teknik sorunlar için 7/24 destek mevcuttur.</p>
                  <p className="mt-1">
                    Acil durumları &quot;Yüksek Öncelik&quot; olarak
                    işaretleyin.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Alternative Support */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Alternatif Destek Seçenekleri
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={() => router.push('/support/create')}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <div className="text-base font-medium">Destek Talebi</div>
                <div className="text-sm text-gray-600">
                  Detaylı sorunlar için ticket oluşturun
                </div>
              </Button>

              <Button
                onClick={() => router.push('/help')}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <div className="text-base font-medium">Yardım Merkezi</div>
                <div className="text-sm text-gray-600">
                  Sık sorulan sorular ve rehberler
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </HelpCenterLayout>
  );
}
