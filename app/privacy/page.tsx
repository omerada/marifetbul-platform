import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası - Marifeto',
  description:
    'Marifeto gizlilik politikası ve kişisel veri koruma uygulamaları.',
};

export default function PrivacyPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Gizlilik Politikası
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Kişisel verilerinizin korunması bizim için çok önemlidir.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                1. Veri Toplama ve İşleme
              </h2>
              <p className="mb-4 text-gray-600">
                Marifeto olarak, platformumuzu kullanırken sizden topladığımız
                kişisel veriler:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Ad, soyad, e-posta adresi gibi kimlik bilgileri</li>
                <li>Telefon numarası ve adres bilgileri</li>
                <li>
                  Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)
                </li>
                <li>Platform kullanım verileri ve çerezler</li>
                <li>İş deneyimi ve portfolio bilgileri</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                2. Veri Kullanım Amaçları
              </h2>
              <p className="mb-4 text-gray-600">
                Topladığımız kişisel veriler aşağıdaki amaçlarla kullanılır:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Platform hizmetlerinin sunulması</li>
                <li>Müşteri desteği ve iletişim</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
                <li>Hukuki yükümlülüklerin yerine getirilmesi</li>
                <li>Platform iyileştirme ve analiz çalışmaları</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                3. Veri Paylaşımı
              </h2>
              <p className="mb-4 text-gray-600">
                Kişisel verileriniz aşağıdaki durumlar dışında üçüncü kişilerle
                paylaşılmaz:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Açık rızanızın bulunması durumunda</li>
                <li>Hukuki zorunluluklar gereği</li>
                <li>Güvenlik ve dolandırıcılık önleme amaçlı</li>
                <li>
                  Hizmet sağlayıcılarımızla (ödeme işlemcileri, hosting
                  sağlayıcıları)
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                4. Veri Güvenliği
              </h2>
              <p className="mb-4 text-gray-600">
                Kişisel verilerinizin güvenliği için aşağıdaki önlemleri
                alıyoruz:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>SSL şifreleme ile veri iletimi</li>
                <li>Güvenli sunucu altyapısı</li>
                <li>Düzenli güvenlik güncellemeleri</li>
                <li>Çalışan erişim kontrolü</li>
                <li>Düzenli yedekleme ve izleme</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                5. Çerezler (Cookies)
              </h2>
              <p className="mb-4 text-gray-600">
                Platformumuzda aşağıdaki türde çerezler kullanılmaktadır:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>
                  <strong>Gerekli Çerezler:</strong> Platform işlevselliği için
                  zorunlu
                </li>
                <li>
                  <strong>Analitik Çerezler:</strong> Kullanım istatistikleri
                  için
                </li>
                <li>
                  <strong>Pazarlama Çerezler:</strong> Kişiselleştirilmiş
                  reklamlar için
                </li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                6. Haklarınız
              </h2>
              <p className="mb-4 text-gray-600">
                KVKK kapsamında sahip olduğunuz haklar:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenen verileriniz hakkında bilgi talep etme</li>
                <li>
                  İşleme amacını ve bunların amacına uygun kullanılıp
                  kullanılmadığını öğrenme
                </li>
                <li>
                  Yurt içinde veya yurt dışında verilerin aktarıldığı üçüncü
                  kişileri bilme
                </li>
                <li>
                  Verilerin eksik veya yanlış işlenmiş olması hâlinde bunların
                  düzeltilmesini isteme
                </li>
                <li>Verilerin silinmesini veya yok edilmesini isteme</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                7. İletişim
              </h2>
              <p className="mb-4 text-gray-600">
                Gizlilik politikamız hakkında sorularınız için:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>E-posta:</strong> kvkk@marifeto.com
                </p>
                <p>
                  <strong>Adres:</strong> Maslak Mah. Büyükdere Cad. No: 123
                  Kat: 15 34485 Sarıyer / İstanbul
                </p>
              </div>
            </Card>

            <Card className="bg-blue-50 p-8">
              <p className="text-sm text-gray-600">
                <strong>Son Güncelleme:</strong> 12 Eylül 2025
                <br />
                Bu gizlilik politikası, mevzuattaki değişiklikler doğrultusunda
                güncellenebilir. Önemli değişiklikler hakkında e-posta yoluyla
                bilgilendirileceksiniz.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
