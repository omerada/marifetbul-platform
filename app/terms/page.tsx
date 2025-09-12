import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Kullanım Şartları - Marifeto',
  description: 'Marifeto platform kullanım şartları ve koşulları.',
};

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Kullanım Şartları
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Marifeto platformunu kullanırken uymanız gereken kurallar ve
              koşullar.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                1. Genel Şartlar
              </h2>
              <p className="mb-4 text-gray-600">
                Bu kullanım şartları, Marifeto platformunu kullanan tüm
                kullanıcılar için geçerlidir. Platforma üye olarak bu şartları
                kabul etmiş sayılırsınız.
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>18 yaşını doldurmuş olmak zorunludur</li>
                <li>Doğru ve güncel bilgiler vermekle yükümlüsünüz</li>
                <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
                <li>Platform kurallarına uymakla yükümlüsünüz</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                2. İşveren Yükümlülükleri
              </h2>
              <p className="mb-4 text-gray-600">
                İşveren olarak platforma projelerinizi yayınlarken:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Proje tanımlarını net ve detaylı olarak yapmalısınız</li>
                <li>Gerçekçi bütçe ve süre belirlemelisiniz</li>
                <li>
                  Freelancerlarla saygılı ve profesyonel iletişim kurmalısınız
                </li>
                <li>
                  Anlaşılan şartlara uymalı ve zamanında ödeme yapmalısınız
                </li>
                <li>Yasalara aykırı projeler yayınlayamazsınız</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                3. Freelancer Yükümlülükleri
              </h2>
              <p className="mb-4 text-gray-600">
                Freelancer olarak hizmet sunarken:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Yeteneklerinizi doğru bir şekilde tanıtmalısınız</li>
                <li>Teslim sürelerine uymalısınız</li>
                <li>Kaliteli ve özgün çalışmalar üretmelisiniz</li>
                <li>Müşteri ile düzenli iletişim kurmalısınız</li>
                <li>Telif hakları konusunda dikkatli olmalısınız</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                4. Ödeme ve Komisyon
              </h2>
              <p className="mb-4 text-gray-600">
                Platform üzerinde gerçekleşen ödemeler:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Tüm ödemeler platform üzerinden yapılmalıdır</li>
                <li>Freelancerlardan %5 komisyon alınır</li>
                <li>İşverenler için platform kullanımı ücretsizdir</li>
                <li>Ödemeler proje tamamlandıktan sonra serbest bırakılır</li>
                <li>Anlaşmazlık durumunda para güvencede tutulur</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                5. Yasak Faaliyetler
              </h2>
              <p className="mb-4 text-gray-600">
                Aşağıdaki faaliyetler kesinlikle yasaktır:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Sahte hesap oluşturma veya kimlik bilgilerini çalma</li>
                <li>Spam veya istenmeyen mesajlar gönderme</li>
                <li>
                  Telif hakkı ihlali veya başkalarının çalışmalarını çalma
                </li>
                <li>Dolandırıcılık veya hileli faaliyetler</li>
                <li>Platform dışında ödeme talep etme veya yapma</li>
                <li>Yasadışı veya etik olmayan projeler yayınlama</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                6. Hesap Askıya Alma ve Sonlandırma
              </h2>
              <p className="mb-4 text-gray-600">
                Platform yönetimi aşağıdaki durumlarda hesabınızı askıya
                alabilir veya sonlandırabilir:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Kullanım şartlarının ihlali</li>
                <li>Diğer kullanıcılardan şikayetler</li>
                <li>Yasalara aykırı faaliyetler</li>
                <li>Dolandırıcılık şüphesi</li>
                <li>Platform güvenliğini tehdit etme</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                7. Anlaşmazlık Çözümü
              </h2>
              <p className="mb-4 text-gray-600">
                Kullanıcılar arasında çıkan anlaşmazlıklar:
              </p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Öncelikle taraflar arasında çözülmeye çalışılır</li>
                <li>Çözüm bulunamazsa platform arabuluculuk yapar</li>
                <li>Gerekirse üçüncü taraf arabulucular devreye girer</li>
                <li>Son çare olarak hukuki yollara başvurulabilir</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                8. Sorumluluk Reddi
              </h2>
              <p className="mb-4 text-gray-600">Marifeto platformu:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Kullanıcılar arasındaki işlemlerde aracılık yapar</li>
                <li>Freelancerların iş kalitesini garanti etmez</li>
                <li>
                  Teknik arızalardan kaynaklanan zararlardan sorumlu değildir
                </li>
                <li>Üçüncü taraf hizmetlerin aksamasından sorumlu değildir</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                9. Değişiklikler
              </h2>
              <p className="mb-4 text-gray-600">Bu kullanım şartları:</p>
              <ul className="mb-4 list-disc space-y-2 pl-6 text-gray-600">
                <li>Platform tarafından güncellenebilir</li>
                <li>Önemli değişiklikler önceden duyurulur</li>
                <li>Güncel şartlar platform üzerinde yayınlanır</li>
                <li>Devam eden kullanım yeni şartları kabul anlamına gelir</li>
              </ul>
            </Card>

            <Card className="bg-blue-50 p-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                İletişim
              </h2>
              <p className="mb-4 text-gray-600">
                Kullanım şartları hakkında sorularınız için:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>E-posta:</strong> legal@marifeto.com
                </p>
                <p>
                  <strong>Telefon:</strong> 0850 123 45 67
                </p>
                <p>
                  <strong>Adres:</strong> Maslak Mah. Büyükdere Cad. No: 123
                  Kat: 15 34485 Sarıyer / İstanbul
                </p>
              </div>
            </Card>

            <Card className="bg-gray-50 p-8">
              <p className="text-sm text-gray-600">
                <strong>Son Güncelleme:</strong> 12 Eylül 2025
                <br />
                Bu kullanım şartları Türkiye Cumhuriyeti yasalarına tabidir ve
                İstanbul mahkemeleri yetkilidir.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
