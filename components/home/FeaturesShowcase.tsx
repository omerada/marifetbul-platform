'use client';

import { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Shield,
  MessageSquare,
  BarChart3,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';

const features = [
  {
    id: 'ai-matching',
    icon: Zap,
    title: 'AI Destekli Eşleştirme',
    description: 'Yapay zeka algoritmamız size en uygun freelancerları bulur',
    details: [
      'Proje gereksinimlerinizi analiz ederiz',
      'Freelancer yeteneklerini skorlar',
      'En uygun eşleşmeleri önerir',
      '%95 eşleşme başarı oranı',
    ],
    demo: 'Nasıl çalışır?',
    image: '/features/ai-matching.png',
    color: 'purple',
  },
  {
    id: 'secure-payment',
    icon: Shield,
    title: 'Güvenli Ödeme Sistemi',
    description: 'Escrow sistemi ile güvenli para transferi',
    details: [
      'Paranız güvende tutulur',
      'İş teslim edildikten sonra ödeme',
      'Anlaşmazlık çözüm merkezi',
      'SSL şifreli güvenlik',
    ],
    demo: 'Ödeme süreci',
    image: '/features/secure-payment.png',
    color: 'green',
  },
  {
    id: 'realtime-chat',
    icon: MessageSquare,
    title: 'Gerçek Zamanlı İletişim',
    description: 'Entegre mesajlaşma ve video görüşme sistemi',
    details: [
      'Anlık mesajlaşma',
      'Dosya paylaşımı',
      'Video konferans',
      'Proje geçmişi takibi',
    ],
    demo: 'Mesajlaşmayı dene',
    image: '/features/chat.png',
    color: 'blue',
  },
  {
    id: 'analytics',
    icon: BarChart3,
    title: 'Detaylı Analitik',
    description: 'İş performansınızı takip edin ve optimize edin',
    details: [
      'Proje başarı oranları',
      'Kazanç raporları',
      'Müşteri memnuniyeti',
      'Pazar trend analizi',
    ],
    demo: "Dashboard'u görüntüle",
    image: '/features/analytics.png',
    color: 'orange',
  },
  {
    id: 'mobile-app',
    icon: Smartphone,
    title: 'Mobil Uygulama',
    description: "iOS ve Android'de tam özellikli deneyim",
    details: [
      'Her yerden erişim',
      'Push bildirimleri',
      'Offline çalışma',
      'Senkronize veriler',
    ],
    demo: 'Uygulamayı indir',
    image: '/features/mobile.png',
    color: 'indigo',
  },
  {
    id: 'support',
    icon: Monitor,
    title: '24/7 Müşteri Desteği',
    description: 'Uzman destek ekibi her zaman yanınızda',
    details: [
      'Canlı destek hattı',
      'Email destek',
      'Video yardım rehberleri',
      'Topluluk forumu',
    ],
    demo: 'Desteği ara',
    image: '/features/support.png',
    color: 'red',
  },
];

const colorVariants = {
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
  red: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

export function FeaturesShowcase() {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);
  const [showDemo, setShowDemo] = useState(false);

  const colors =
    colorVariants[selectedFeature.color as keyof typeof colorVariants];

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Güçlü Özellikler
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            MarifetBul&apos;u özel kılan teknolojiler ve özellikler
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Feature List */}
          <div className="space-y-4">
            {features.map((feature) => {
              const isSelected = selectedFeature.id === feature.id;
              const featureColors =
                colorVariants[feature.color as keyof typeof colorVariants];

              return (
                <div
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature)}
                  className={`group cursor-pointer rounded-xl p-6 transition-all duration-300 ${
                    isSelected
                      ? `${featureColors.bg} ${featureColors.border} border-2 shadow-lg`
                      : 'border-2 border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isSelected ? featureColors.bg : 'bg-white'
                      } ${isSelected ? featureColors.text : 'text-gray-600'} transition-colors duration-300`}
                    >
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`mb-2 text-lg font-semibold ${
                          isSelected ? featureColors.text : 'text-gray-900'
                        } transition-colors duration-300`}
                      >
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {feature.description}
                      </p>
                      {isSelected && (
                        <div className="animate-fade-in-up mt-4 space-y-2">
                          {feature.details.map((detail, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                              <span>{detail}</span>
                            </div>
                          ))}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDemo(true);
                            }}
                            className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${featureColors.text} hover:underline`}
                          >
                            <Play className="h-4 w-4" />
                            {feature.demo}
                          </button>
                        </div>
                      )}
                    </div>
                    <ArrowRight
                      className={`h-5 w-5 transition-all duration-300 ${
                        isSelected
                          ? `${featureColors.text} rotate-90`
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feature Demo Area */}
          <div className="relative">
            <div
              className={`rounded-2xl ${colors.bg} ${colors.border} flex min-h-[400px] items-center justify-center border-2 p-8 transition-all duration-500`}
            >
              <div className="text-center">
                <div
                  className={`inline-flex h-20 w-20 items-center justify-center rounded-2xl ${colors.bg} ${colors.text} mb-6`}
                >
                  <selectedFeature.icon className="h-10 w-10" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  {selectedFeature.title}
                </h3>
                <p className="mb-6 leading-relaxed text-gray-600">
                  {selectedFeature.description}
                </p>
                <Button
                  onClick={() => setShowDemo(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Demo İzle
                </Button>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="absolute -top-4 -right-4 h-8 w-8 animate-pulse rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
            <div className="absolute -bottom-4 -left-4 h-6 w-6 animate-pulse rounded-full bg-gradient-to-br from-green-400 to-blue-500 delay-1000"></div>
          </div>
        </div>

        {/* Demo Modal */}
        {showDemo && (
          <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <div className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white">
              <div className="flex items-center justify-between border-b p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedFeature.title} Demo
                </h3>
                <button
                  onClick={() => setShowDemo(false)}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-gray-100">
                  <div className="text-center">
                    <Play className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <p className="text-gray-600">Demo video yakında...</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedFeature.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                      <span className="text-gray-700">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
