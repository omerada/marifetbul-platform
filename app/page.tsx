import Link from 'next/link';
import {
  ArrowRight,
  Package,
  Briefcase,
  CheckCircle,
  Target,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { HeroSection } from '@/components/home/HeroSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CategoryShowcase } from '@/components/home/CategoryShowcase';

export default function HomePage() {
  return (
    <AppLayout>
      {/* Hero Section with Smart Toggle */}
      <HeroSection />

      {/* Features Section - Value Propositions Comparison */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Sparkles className="mr-2 h-4 w-4" />
              Neden MarifetBul?
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Türkiye&apos;nin En Güvenilir Freelance Platformu
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-600">
              Binlerce başarılı proje ve memnun kullanıcı ile kanıtlanmış
              kalite. İster freelancer olun, ister işveren - size özel
              çözümlerimizle büyüyün.
            </p>

            {/* Quick Comparison */}
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4 text-center">
                  <div className="mb-1 text-sm font-medium text-red-700">
                    Diğer Platformlar
                  </div>
                  <div className="text-lg font-bold text-red-800">₺15-25</div>
                  <div className="text-xs text-red-600">Teklif Ücreti</div>
                </div>
                <div className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 text-center">
                  <div className="mb-1 text-sm font-medium text-green-700">
                    MarifetBul
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    ÜCRETSİZ
                  </div>
                  <div className="text-xs text-green-600">Teklif Ücreti</div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 p-4 text-center">
                  <div className="mb-1 text-sm font-medium text-blue-700">
                    Komisyon Farkı
                  </div>
                  <div className="text-lg font-bold text-blue-800">
                    %50 DAHA AZ
                  </div>
                  <div className="text-xs text-blue-600">
                    Platform Komisyonu
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-red-600">
                    Diğer platformlar:
                  </span>{' '}
                  Yüksek ücretler,
                  <span className="ml-1 font-semibold text-green-600">
                    MarifetBul:
                  </span>{' '}
                  Şeffaf ve adil fiyatlandırma
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Value Proposition with More Details */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Freelancer Benefits - Enhanced */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 transition-all duration-300 hover:border-blue-200">
              <div className="absolute top-4 right-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Briefcase className="h-24 w-24 text-blue-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 flex items-center">
                  <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Freelancer Olarak
                    </h3>
                    <p className="font-medium text-blue-600">
                      Yeteneklerinizi paraya çevirin
                    </p>
                  </div>
                </div>
                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                  Özgür çalışma hayatı, kendi patronunuz olmak ve global
                  müşterilerle çalışma fırsatı sizi bekliyor.
                </p>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Kendi fiyatını belirle</strong> - Hizmetlerinizin
                      değerini siz koyun
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Esnek çalışma saatleri</strong> - İstediğiniz
                      zaman, istediğiniz yerden
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Global müşteri ağı</strong> - Dünya çapında
                      projeler
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Güvenli ödeme sistemi</strong> - Escrow ile
                      garanti
                    </span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Link href="/register?type=freelancer">
                    <Button className="group h-12 w-full text-lg">
                      Freelancer Olarak Başla
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <div className="mt-6"></div>

                  <p className="text-center text-sm text-gray-500">
                    ⭐ Ortalama freelancer ayda <strong>₺8,500</strong>{' '}
                    kazanıyor
                  </p>
                </div>
              </div>
            </div>

            {/* Employer Benefits - Enhanced */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-8 transition-all duration-300 hover:border-green-200">
              <div className="absolute top-4 right-4 opacity-10 transition-opacity group-hover:opacity-20">
                <Package className="h-24 w-24 text-green-600" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 flex items-center">
                  <div className="mr-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 shadow-lg">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      İşveren Olarak
                    </h3>
                    <p className="font-medium text-green-600">
                      Projelerinizi hayata geçirin
                    </p>
                  </div>
                </div>
                <p className="mb-6 text-lg leading-relaxed text-gray-700">
                  En yetenekli freelancerları bulun, projelerinizi zamanında ve
                  bütçenize uygun şekilde tamamlayın.
                </p>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Geniş yetenek havuzu</strong> - 125K+ uzman
                      freelancer
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Hızlı teklif alma</strong> - 24 saat içinde
                      teklifler
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Kaliteli sonuçlar</strong> - %99 proje başarı
                      oranı
                    </span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                    <span>
                      <strong>Bütçe kontrolü</strong> - Sabit fiyat garantisi
                    </span>
                  </li>
                </ul>
                <div className="space-y-3">
                  <Link href="/register?type=employer">
                    <Button
                      variant="secondary"
                      className="group h-12 w-full bg-green-600 text-lg text-white hover:bg-green-700"
                    >
                      İşveren Olarak Başla
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <div className="mt-6"></div>

                  <p className="text-center text-sm text-gray-500">
                    💼 Ortalama proje <strong>7 gün</strong> içinde tamamlanıyor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <CategoryShowcase />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* How It Works - Enhanced */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <Target className="mr-2 h-4 w-4" />
              Süreç
            </div>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              3 Basit Adımda Başlayın
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              MarifetBul ile projenizi başlatmak veya freelancer olmak çok kolay
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Connection Lines */}
            <div className="absolute top-1/2 right-1/3 left-1/3 hidden h-0.5 -translate-y-1/2 transform bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 lg:block"></div>

            {[
              {
                step: 1,
                title: 'Hesap Oluşturun',
                description:
                  'Freelancer veya işveren olarak ücretsiz hesabınızı oluşturun ve profilinizi tamamlayın.',
                icon: '👤',
                details: [
                  '2 dakikada kayıt',
                  'Kimlik doğrulama',
                  'Profil optimize etme',
                ],
              },
              {
                step: 2,
                title: 'Eşleşin & Başlayın',
                description:
                  'Platform üzerinde ideal eşleşmeleri bulun, projelerinizi paylaşın veya teklifler verin.',
                icon: '🎯',
                details: [
                  'Akıllı eşleştirme',
                  'Anında bildirimler',
                  'Güvenli sohbet',
                ],
              },
              {
                step: 3,
                title: 'Başarıyla Tamamlayın',
                description:
                  'Projelerinizi teslim edin, güvenli ödeme alın ve mükemmel değerlendirmeler kazanın.',
                icon: '🎉',
                details: ['Escrow ödeme', 'Otomatik fatura', 'Başarı takibi'],
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-2xl font-medium text-white shadow-md">
                    {item.step}
                  </div>
                  <div className="mb-4 text-4xl">{item.icon}</div>
                  <h3 className="mb-4 text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mb-6 leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                  <ul className="space-y-2">
                    {item.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center justify-center text-sm text-gray-500"
                      >
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Additional CTA */}
          <div className="mt-12 text-center">
            <p className="mb-6 text-gray-600">Başlamaya hazır mısınız?</p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/register?type=freelancer">
                <Button size="lg" className="w-full sm:w-auto">
                  Freelancer Olarak Başla
                </Button>
              </Link>
              <Link href="/register?type=employer">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  İşveren Olarak Başla
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 py-16 text-white lg:py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-white/20"></div>
          <div className="absolute top-32 right-20 h-24 w-24 animate-pulse rounded-full bg-white/10 delay-1000"></div>
          <div className="absolute bottom-20 left-32 h-20 w-20 animate-pulse rounded-full bg-white/15 delay-2000"></div>
          <div className="absolute right-10 bottom-32 h-16 w-16 animate-pulse rounded-full bg-white/20 delay-500"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-8 inline-flex items-center rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-blue-100 backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Hemen Başlayın
          </div>

          <h2 className="mb-6 text-4xl font-bold lg:text-5xl">
            Freelance Kariyeriniz
            <br />
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Burada Başlıyor
            </span>
          </h2>

          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-blue-100">
            Türkiye&apos;nin yeni nesil freelance platformu ile yeteneklerinizi
            keşfedin, projelerinizi hayata geçirin. Güvenli, hızlı ve kullanıcı
            dostu deneyim sizi bekliyor.
          </p>

          {/* Feature Highlights */}
          <div className="mx-auto mb-10 grid max-w-2xl grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">🚀</div>
              <div className="text-sm text-blue-200">Hızlı Başlangıç</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">🔒</div>
              <div className="text-sm text-blue-200">Güvenli Ödeme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">🎯</div>
              <div className="text-sm text-blue-200">Doğru Eşleşme</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">💬</div>
              <div className="text-sm text-blue-200">7/24 Destek</div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register?type=employer">
              <Button
                variant="secondary"
                size="lg"
                className="group h-14 w-full bg-white px-8 text-lg text-blue-700 shadow-xl transition-all duration-300 hover:bg-blue-50 hover:shadow-2xl sm:w-auto"
              >
                <Package className="mr-3 h-5 w-5" />
                İşveren Olarak Başla
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/register?type=freelancer">
              <Button
                variant="outline"
                size="lg"
                className="group h-14 w-full border-2 border-white bg-transparent px-8 text-lg text-white shadow-xl transition-all duration-300 hover:bg-white hover:text-blue-700 hover:shadow-2xl sm:w-auto"
              >
                <Briefcase className="mr-3 h-5 w-5" />
                Freelancer Olarak Başla
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
