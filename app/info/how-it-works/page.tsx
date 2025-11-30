import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  UserPlus,
  Search,
  MessageSquare,
  CreditCard,
  Star,
  Shield,
  Clock,
  Award,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nasıl Çalışır? - MarifetBul',
  description:
    'MarifetBul platformunu nasıl kullanacağınızı öğrenin. İşveren veya freelancer olarak adım adım rehber.',
};

export default function HowItWorksPage() {
  const employerSteps = [
    {
      icon: UserPlus,
      title: 'Üye Olun',
      description: 'Ücretsiz hesap oluşturun ve profilinizi tamamlayın.',
    },
    {
      icon: Search,
      title: 'İlan Verin',
      description:
        'Projenizi detaylı olarak tanımlayın ve bütçenizi belirleyin.',
    },
    {
      icon: MessageSquare,
      title: 'Teklifleri Değerlendirin',
      description: "Gelen teklifleri inceleyin ve uygun freelancer'ı seçin.",
    },
    {
      icon: CreditCard,
      title: 'Güvenli Ödeme',
      description: 'Projesi tamamlandıktan sonra güvenli şekilde ödeme yapın.',
    },
  ];

  const freelancerSteps = [
    {
      icon: UserPlus,
      title: 'Profil Oluşturun',
      description:
        'Yeteneklerinizi sergileyen profesyonel bir profil oluşturun.',
    },
    {
      icon: Search,
      title: 'İş Arayın',
      description: 'Size uygun projeleri bulun ve teklif verin.',
    },
    {
      icon: MessageSquare,
      title: 'İletişim Kurun',
      description: 'Müşteri ile detayları konuşun ve anlaşmaya varın.',
    },
    {
      icon: Award,
      title: 'Kazanın',
      description: 'Projeyi tamamlayın ve ödemenizi alın.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Güvenli Ödeme',
      description: 'Tüm ödemeler güvence altında tutulur.',
    },
    {
      icon: Clock,
      title: '7/24 Destek',
      description: 'Her zaman yanınızdayız.',
    },
    {
      icon: Star,
      title: 'Kaliteli Hizmet',
      description: 'Sadece doğrulanmış profesyoneller.',
    },
  ];

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Nasıl Çalışır?
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              MarifetBul ile projelerinizi hayata geçirin veya yeteneklerinizle
              para kazanın. İşte başlamanız için adım adım rehber.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* İşverenler İçin */}
          <div className="mb-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                İşverenler İçin
              </h2>
              <p className="text-lg text-gray-600">
                Projeniz için en uygun freelancer&apos;ı bulmak çok kolay
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {employerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Icon className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    <div className="mb-2 text-sm font-medium text-blue-600">
                      Adım {index + 1}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Freelancerlar İçin */}
          <div className="mb-20">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Freelancerlar İçin
              </h2>
              <p className="text-lg text-gray-600">
                Yeteneklerinizi paraya dönüştürün
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {freelancerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card key={index} className="p-6 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Icon className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    <div className="mb-2 text-sm font-medium text-green-600">
                      Adım {index + 1}
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Özellikler */}
          <div className="mb-16">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Neden MarifetBul?
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="p-8 text-center">
                    <div className="mb-4 flex justify-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                        <Icon className="h-10 w-10 text-purple-600" />
                      </div>
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">Hazır mısınız?</h2>
            <p className="mb-8 text-xl opacity-90">
              Hemen başlayın ve hayallerinizdeki projeyi gerçekleştirin
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary">
                İşveren Olarak Başla
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Freelancer Olarak Başla
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
