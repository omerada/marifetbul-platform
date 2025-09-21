'use client';

import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Book,
  Shield,
} from 'lucide-react';
import { useState } from 'react';

const faqData = [
  {
    category: 'Genel',
    icon: HelpCircle,
    questions: [
      {
        question: 'MarifetBul nedir?',
        answer:
          "MarifetBul, freelancerlar ve işverenleri buluşturan Türkiye'nin en büyük online platformudur. İşverenler projelerini yayınlayabilir, freelancerlar ise hizmetlerini sunabilir.",
      },
      {
        question: 'Platform ücretsiz mi?',
        answer:
          'Platforma üye olmak ve temel özellikleri kullanmak ücretsizdir. Sadece başarılı işlemlerden küçük bir komisyon alınır.',
      },
      {
        question: 'Hangi hizmet kategorileri mevcut?',
        answer:
          'Web tasarım, mobil uygulama geliştirme, grafik tasarım, metin yazımı, dijital pazarlama, veri girişi ve daha birçok kategori mevcuttur.',
      },
    ],
  },
  {
    category: 'İşverenler',
    icon: MessageCircle,
    questions: [
      {
        question: 'İş ilanı nasıl verebilirim?',
        answer:
          'Üye olduktan sonra "İş İlanı Ver" butonuna tıklayarak projenizi detaylı olarak tanımlayabilir, bütçenizi belirleyebilir ve yayınlayabilirsiniz.',
      },
      {
        question: 'Freelancer nasıl seçerim?',
        answer:
          'Gelen teklifleri inceleyebilir, freelancerların profillerini ve değerlendirmelerini görüntüleyebilir, mesajlaşarak detayları konuşabilirsiniz.',
      },
      {
        question: 'Ödeme nasıl yapılır?',
        answer:
          'Ödemeler güvenli bir şekilde platformumuz üzerinden yapılır. Para proje tamamlanana kadar güvencede tutulur.',
      },
      {
        question: 'Proje teslim alınmazsa ne olur?',
        answer:
          'Eğer proje belirlenen sürede teslim edilmezse veya kalite standartlarını karşılamazsa, paranızı geri almanız için destek ekibimiz size yardımcı olur.',
      },
    ],
  },
  {
    category: 'Freelancerlar',
    icon: Book,
    questions: [
      {
        question: 'Nasıl teklif verebilirim?',
        answer:
          'İlginizi çeken projelere detaylı teklifler verebilir, deneyimlerinizi paylaşabilir ve rekabetçi fiyatlar sunabilirsiniz.',
      },
      {
        question: 'Hizmet paketi nasıl oluştururum?',
        answer:
          'Profil sayfanızdan "Hizmet Ekle" seçeneği ile farklı paket seçenekleri oluşturabilir, fiyatlandırma yapabilir ve portföyünüzü sergileyebilirsiniz.',
      },
      {
        question: 'Ödeme ne zaman alırım?',
        answer:
          'Proje tamamlandıktan ve müşteri onayladıktan sonra 1-3 iş günü içinde ödemeniz hesabınıza aktarılır.',
      },
      {
        question: 'Profil puanım nasıl yükselir?',
        answer:
          'Zamanında teslimat, kaliteli iş, iyi iletişim ve müşteri memnuniyeti puanınızı yükseltir. Her başarılı proje sonrası değerlendirme alırsınız.',
      },
    ],
  },
  {
    category: 'Güvenlik',
    icon: Shield,
    questions: [
      {
        question: 'Kişisel bilgilerim güvende mi?',
        answer:
          'Evet, tüm kişisel bilgileriniz SSL şifreleme ile korunur ve sadece gerekli durumlarda kullanılır. Gizlilik politikamızda detayları bulabilirsiniz.',
      },
      {
        question: 'Dolandırıcılık durumunda ne yapmalıyım?',
        answer:
          'Şüpheli bir durum fark ettiğinizde hemen destek ekibimize bildirin. 7/24 güvenlik ekibimiz tüm şikayetleri değerlendirir.',
      },
      {
        question: 'İade politikası nasıl işler?',
        answer:
          'Proje kalite standartlarını karşılamadığında veya sözleşme şartları ihlal edildiğinde iade talebinde bulunabilirsiniz.',
      },
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="p-6">
      <button
        className="flex w-full items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isOpen && (
        <div className="mt-4 text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </Card>
  );
}

export default function FAQPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Sık Sorulan Sorular
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              MarifetBul platformu hakkında merak ettiklerinizin cevaplarını
              bulun. Aradığınız soruyu bulamadınız mı? İletişim sayfamızdan bize
              ulaşın.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {faqData.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <div key={categoryIndex} className="mb-12">
                  <div className="mb-6 flex items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.category}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {category.questions.map((faq, faqIndex) => (
                      <FAQItem
                        key={faqIndex}
                        question={faq.question}
                        answer={faq.answer}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* İletişim CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Sorunuz cevaplandırılmadı mı?
            </h2>
            <p className="mb-8 text-xl opacity-90">
              7/24 destek ekibimiz size yardımcı olmaya hazır
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <button className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100">
                Canlı Destek
              </button>
              <button className="rounded-lg border-2 border-white px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-gray-900">
                İletişim Formu
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
