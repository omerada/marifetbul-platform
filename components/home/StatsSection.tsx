'use client';

import { Shield, Zap, Heart, CheckCircle } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Güvenli Ödeme',
    description: 'Escrow sistemi ile koruma',
  },
  {
    icon: Zap,
    title: 'Hızlı Başlangıç',
    description: '5 dakikada işe başlayın',
  },
  {
    icon: Heart,
    title: 'Kaliteli Hizmet',
    description: 'Memnuniyet garantisi',
  },
  {
    icon: CheckCircle,
    title: 'AI Eşleştirme',
    description: 'Doğru freelancer, doğru proje',
  },
];

export function StatsSection() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Neden MarifetBul?
          </h2>
          <p className="mx-auto max-w-lg text-lg text-gray-600">
            Güvenilir, hızlı ve kullanıcı dostu freelance platformu
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
