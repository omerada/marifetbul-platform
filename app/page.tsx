import Link from 'next/link';
import {
  Shield,
  Users,
  Zap,
  ArrowRight,
  Star,
  Package,
  Briefcase,
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { HeroSection } from '@/components/home/HeroSection';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section with Smart Toggle */}
      <HeroSection />

      {/* Features Section - Value Propositions Comparison */}
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

          {/* Side-by-Side Value Proposition */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Freelancer Benefits */}
            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-8">
              <div className="mb-6 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Freelancer Olarak
                </h3>
              </div>
              <p className="mb-6 text-gray-700">
                Yeteneklerini sergileyip kazanmaya başla
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                  Kendi fiyatını belirle
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                  Esnek çalışma saatleri
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                  Global müşteri ağı
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                  Güvenli ödeme sistemi
                </li>
              </ul>
              <Link href="/register?type=freelancer">
                <Button className="w-full">
                  Freelancer Ol
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Employer Benefits */}
            <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-8">
              <div className="mb-6 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  İşveren Olarak
                </h3>
              </div>
              <p className="mb-6 text-gray-700">
                Doğru yetenekleri bul, projeni tamamla
              </p>
              <ul className="mb-6 space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                  Geniş yetenek havuzu
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                  Hızlı teklif alma
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                  Kaliteli sonuçlar
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                  Bütçe kontrolü
                </li>
              </ul>
              <Link href="/register?type=employer">
                <Button variant="secondary" className="w-full">
                  İş Ver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
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
