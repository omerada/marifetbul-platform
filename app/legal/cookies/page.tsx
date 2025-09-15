import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Çerez Politikası - Marifeto',
  description: 'Marifeto çerez kullanım politikası ve ayarları.',
};

export default function CookiesPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Çerez Politikası
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Web sitemizde kullandığımız çerezler hakkında bilgiler.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Çerez Nedir?
              </h2>
              <p className="text-gray-600">
                Çerezler, web sitemizi ziyaret ettiğinizde cihazınızda saklanan
                küçük metin dosyalarıdır. Bu dosyalar, size daha iyi bir
                kullanıcı deneyimi sunmamıza yardımcı olur.
              </p>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Çerez Türleri
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Gerekli Çerezler
                  </h3>
                  <p className="text-gray-600">
                    Web sitesinin temel işlevlerini yerine getirmesi için
                    zorunlu çerezlerdir.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Performans Çerezleri
                  </h3>
                  <p className="text-gray-600">
                    Web sitesi performansını analiz etmemize ve iyileştirmemize
                    yardımcı olur.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    İşlevsellik Çerezleri
                  </h3>
                  <p className="text-gray-600">
                    Tercihlerinizi hatırlayarak kişiselleştirilmiş deneyim
                    sunar.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Hedefleme Çerezleri
                  </h3>
                  <p className="text-gray-600">
                    İlginizi çekebilecek reklamları göstermek için kullanılır.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Çerez Yönetimi
              </h2>
              <p className="mb-4 text-gray-600">
                Çerez tercihlerinizi aşağıdaki yöntemlerle yönetebilirsiniz:
              </p>
              <ul className="list-disc space-y-2 pl-6 text-gray-600">
                <li>
                  Tarayıcı ayarlarından çerezleri devre dışı bırakabilirsiniz
                </li>
                <li>Mevcut çerezleri silebilirsiniz</li>
                <li>
                  Çerez tercih merkezimizden ayarlarınızı değiştirebilirsiniz
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
