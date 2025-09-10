import Link from 'next/link';
import { Search, Star, Users, Shield, Zap, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
                Türkiye&apos;nin En Büyük
                <span className="block text-blue-200">
                  Freelancer Platformu
                </span>
              </h1>
              <p className="text-xl leading-relaxed text-blue-100">
                Projeleriniz için en uygun uzmanları bulun veya yeteneklerinizi
                sergileyerek gelir elde edin. Güvenli, hızlı ve kolay.
              </p>

              {/* Search Bar */}
              <div className="rounded-lg bg-white p-2 shadow-xl">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder="Hangi hizmeti arıyorsunuz?"
                      className="w-full rounded-md py-3 pr-4 pl-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <Button size="lg" className="px-8">
                    Ara
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/marketplace">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    İş İlanlarını Gör
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white bg-transparent text-white hover:bg-white hover:text-blue-600 sm:w-auto"
                  >
                    Ücretsiz Üye Ol
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image/Stats */}
            <div className="relative">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      50K+
                    </div>
                    <div className="font-medium text-blue-100">Aktif Uzman</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      25K+
                    </div>
                    <div className="font-medium text-blue-100">
                      Tamamlanan Proje
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      4.9
                    </div>
                    <div className="flex items-center justify-center font-medium text-blue-100">
                      <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                      Ortalama Puan
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white drop-shadow-sm">
                      99%
                    </div>
                    <div className="font-medium text-blue-100">
                      Müşteri Memnuniyeti
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Neden Marifeto?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Freelancer ve işverenler için optimize edilmiş platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Güvenli Ödeme
              </h3>
              <p className="text-gray-600">
                Escrow sistemi ile güvenli ödeme garantisi
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Kaliteli Uzmanlar
              </h3>
              <p className="text-gray-600">
                Doğrulanmış ve deneyimli freelancer&apos;lar
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Hızlı Eşleşme
              </h3>
              <p className="text-gray-600">
                AI destekli akıllı eşleştirme sistemi
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Kalite Garantisi
              </h3>
              <p className="text-gray-600">%100 memnuniyet garantisi</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600">
              3 basit adımda projenizi başlatın
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Projenizi Tanımlayın
              </h3>
              <p className="text-gray-600">
                İhtiyacınızı detaylandırın, bütçenizi belirleyin ve uzmanlardan
                teklif alın.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Uzmanı Seçin
              </h3>
              <p className="text-gray-600">
                Gelen teklifleri inceleyin, uzman profillerini değerlendirin ve
                seçiminizi yapın.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Projeyi Tamamlayın
              </h3>
              <p className="text-gray-600">
                Çalışma sürecini takip edin, güvenli ödeme yapın ve sonuçtan
                memnun kalın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white lg:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Hemen Başlayın
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Projenizi paylaşın veya freelancer olarak yeteneklerinizi
            sergileyin. Ücretsiz üyelik ile hemen başlayın.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register?type=employer">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                İşveren Olarak Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register?type=freelancer">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white hover:text-blue-600 sm:w-auto"
              >
                Freelancer Olarak Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
