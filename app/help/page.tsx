import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Yardım - Marifeto',
  description: 'Marifeto kullanım rehberi ve yardım dokümantasyonu.',
};

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Yardım Merkezi
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Marifeto platformunu kullanırken ihtiyacınız olan tüm yardım
              burada.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Başlangıç Rehberi
              </h2>
              <p className="mb-4 text-gray-600">
                Platforma yeni katıldıysanız, başlamak için bu adımları takip
                edin:
              </p>
              <ul className="list-decimal space-y-2 pl-6 text-gray-600">
                <li>Hesabınızı oluşturun ve e-posta adresinizi doğrulayın</li>
                <li>Profil bilgilerinizi tamamlayın</li>
                <li>İşveren veya freelancer rolünüzü seçin</li>
                <li>Platform kurallarını okuyun</li>
                <li>İlk projenizi başlatın</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                İşverenler İçin
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  İş İlanı Nasıl Verilir?
                </h3>
                <p className="text-gray-600">
                  İş ilanı vermek için dashboard sayfanızdan &quot;Yeni İş
                  İlanı&quot; butonuna tıklayın. Proje detaylarını, bütçenizi ve
                  sürenizi belirtin.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Freelancerlar İçin
              </h2>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Teklif Nasıl Verilir?
                </h3>
                <p className="text-gray-600">
                  İlginizi çeken projelere detaylı teklifler verin.
                  Deneyimlerinizi paylaşın ve rekabetçi fiyatlar sunun.
                </p>
              </div>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                İletişim
              </h2>
              <p className="text-gray-600">
                Daha fazla yardıma mı ihtiyacınız var? Destek ekibimizle
                iletişime geçin:
              </p>
              <div className="mt-4 space-y-2 text-gray-600">
                <p>
                  <strong>E-posta:</strong> destek@marifeto.com
                </p>
                <p>
                  <strong>Telefon:</strong> 0850 123 45 67
                </p>
                <p>
                  <strong>Canlı Destek:</strong> 7/24 aktif
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
