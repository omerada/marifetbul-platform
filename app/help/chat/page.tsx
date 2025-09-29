'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { MessageCircle, FileText, ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => router.push('/help')}
              variant="outline"
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Yardım Merkezine Dön
            </Button>
          </div>

          {/* Bilgilendirme */}
          <Card className="p-8 text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                <MessageCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              Canlı Destek Geçici Olarak Devre Dışı
            </h1>

            <p className="mb-6 text-lg text-gray-600">
              Canlı destek hizmeti şu anda bakım nedeniyle kullanılamıyor. Size
              daha iyi hizmet verebilmek için çalışmalarımız devam ediyor.
            </p>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-800">
                <span className="font-medium">
                  Alternatif destek seçeneklerini kullanabilirsiniz
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Button
                onClick={() => router.push('/contact')}
                className="h-auto flex-col gap-2 p-4"
              >
                <MessageCircle className="h-6 w-6" />
                <div className="text-base font-medium">E-posta Desteği</div>
                <div className="text-sm opacity-90">
                  Sorularınızı e-posta ile gönderin
                </div>
              </Button>

              <Button
                onClick={() => router.push('/faq')}
                variant="outline"
                className="h-auto flex-col gap-2 p-4"
              >
                <FileText className="h-6 w-6" />
                <div className="text-base font-medium">Sık Sorulan Sorular</div>
                <div className="text-sm text-gray-600">
                  Hızlı çözümler için SSS&apos;ye göz atın
                </div>
              </Button>
            </div>
          </Card>

          {/* İletişim Bilgileri */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İletişim Bilgileri
            </h3>

            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>E-posta Desteği:</strong>
                <p>
                  E-posta ile gönderdiğiniz sorular genellikle 24 saat içinde
                  yanıtlanır.
                </p>
              </div>

              <div>
                <strong>Çalışma Saatleri:</strong>
                <div className="mt-1 space-y-1">
                  <div className="flex justify-between">
                    <span>Pazartesi - Cuma</span>
                    <span>09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cumartesi</span>
                    <span>10:00 - 16:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pazar</span>
                    <span>Kapalı</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
