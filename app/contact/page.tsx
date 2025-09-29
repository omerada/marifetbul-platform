import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'İletişim - MarifetBul',
  description:
    'MarifetBul ekibi ile iletişime geçin. Sorularınız için 7/24 müşteri desteği.',
};

export default function ContactPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              İletişim
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Sorularınız mı var? Size yardımcı olmaktan mutluluk duyarız. 7/24
              müşteri desteği ile yanınızdayız.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* İletişim Formu */}
            <div>
              <Card className="p-8">
                <h2 className="mb-6 text-2xl font-bold text-gray-900">
                  Mesaj Gönderin
                </h2>

                <form className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Ad Soyad
                      </label>
                      <Input placeholder="Ad Soyad" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        E-posta
                      </label>
                      <Input type="email" placeholder="ornek@email.com" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Konu
                    </label>
                    <Input placeholder="Mesaj konusu" />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mesajınız
                    </label>
                    <textarea
                      className="min-h-32 w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                      placeholder="Mesajınızı buraya yazın..."
                      rows={6}
                    />
                  </div>

                  <Button size="lg" fullWidth>
                    <Send className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
                </form>
              </Card>
            </div>

            {/* İletişim Bilgileri */}
            <div className="space-y-8">
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      E-posta Desteği
                    </h3>
                    <p className="mb-1 text-gray-600">Genel sorular için:</p>
                    <p className="mb-1 font-medium text-gray-900">
                      destek@marifetbul.com
                    </p>
                    <p className="mb-1 text-gray-600">İş ortaklığı için:</p>
                    <p className="font-medium text-gray-900">
                      ortaklik@marifetbul.com
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Telefon Desteği
                    </h3>
                    <p className="mb-1 text-gray-600">Acil durumlar için:</p>
                    <p className="mb-3 text-xl font-bold text-gray-900">
                      0850 123 45 67
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="mr-1 h-4 w-4" />
                      Hafta içi 09:00 - 18:00
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <MapPin className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      Ofis Adresi
                    </h3>
                    <p className="text-gray-600">
                      Maslak Mah. Büyükdere Cad.
                      <br />
                      No: 123 Kat: 15
                      <br />
                      34485 Sarıyer / İstanbul
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* SSS Bölümü */}
          <div className="mt-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Sık Sorulan Sorular
              </h2>
              <p className="text-lg text-gray-600">
                En çok merak edilen konulara hızlı cevaplar
              </p>
            </div>

            <div className="mx-auto max-w-3xl space-y-4">
              <Card className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  MarifetBul&apos;ya nasıl üye olabilirim?
                </h3>
                <p className="text-gray-600">
                  Ana sayfadaki &quot;Üye Ol&quot; butonuna tıklayarak ücretsiz
                  hesap oluşturabilirsiniz. E-posta adresinizi doğruladıktan
                  sonra hemen platformu kullanmaya başlayabilirsiniz.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Ödeme güvenliği nasıl sağlanıyor?
                </h3>
                <p className="text-gray-600">
                  Tüm ödemeler SSL şifreleme ile korunur ve güvenli ödeme
                  sağlayıcıları aracılığıyla işlenir. Paranız proje tamamlanana
                  kadar güvencede tutulur.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Komisyon oranları nedir?
                </h3>
                <p className="text-gray-600">
                  Platform kullanım ücreti freelancerlar için %5, işverenler
                  için ücretsizdir. Detaylı bilgi için fiyatlandırma sayfamızı
                  ziyaret edebilirsiniz.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
