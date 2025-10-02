'use client';

import { useState } from 'react';
import {
  Star,
  Quote,
  ArrowLeft,
  ArrowRight,
  User,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';

const testimonials = [
  {
    id: 1,
    name: 'Ahmet Kaya',
    role: 'Web Developer',
    userType: 'freelancer',
    avatar: '/avatars/freelancer1.jpg',
    rating: 5,
    content:
      'MarifetBul sayesinde 6 ayda hayallerimi gerçekleştirdim. Platform hem güvenli hem de kullanıcı dostu. Müşterilerimle sorunsuz iletişim kurabiliyorum ve ödeme garantisi sayesinde hiç endişelenmiyorum.',
    projectCount: 47,
    earnings: '₺125,000',
  },
  {
    id: 2,
    name: 'Elif Demir',
    role: 'Grafik Tasarımcı',
    userType: 'freelancer',
    avatar: '/avatars/freelancer2.jpg',
    rating: 5,
    content:
      'Özgürce çalışıp kendi işimin patronu olmak istiyordum. MarifetBul bana bu fırsatı sundu. Artık kaliteli projeler üzerinde çalışıyorum ve düzenli gelirim var.',
    projectCount: 73,
    earnings: '₺89,500',
  },
  {
    id: 3,
    name: 'Mehmet Özkan',
    role: 'E-ticaret Girişimci',
    userType: 'employer',
    avatar: '/avatars/employer1.jpg',
    rating: 5,
    content:
      'Şirketim için en iyi freelancerları bulabildiğim tek platform. AI eşleştirme sistemi gerçekten işe yaraıyor. Projelerim zamanında ve kaliteli şekilde teslim ediliyor.',
    projectsCompleted: 23,
    teamSize: '12 kişi',
  },
  {
    id: 4,
    name: 'Ayşe Kılıç',
    role: 'Startup Kurucusu',
    userType: 'employer',
    avatar: '/avatars/employer2.jpg',
    rating: 5,
    content:
      "Startup'ımın MVP'sini hızlıca hayata geçirmek için MarifetBul'u kullandım. Bütçeme uygun, yetenekli geliştiriciler buldum. Şimdi de büyüme sürecimizde yine buradayım.",
    projectsCompleted: 8,
    teamSize: '5 kişi',
  },
  {
    id: 5,
    name: 'Can Yılmaz',
    role: 'İçerik Editörü',
    userType: 'freelancer',
    avatar: '/avatars/freelancer3.jpg',
    rating: 5,
    content:
      'Pandemi döneminde işimi kaybetmiştim. MarifetBul sayesinde yazma yeteneğimi paraya çevirdim. Şimdi tam zamanlı freelancer olarak çok daha mutluyum.',
    projectCount: 156,
    earnings: '₺67,800',
  },
];

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'freelancer' | 'employer'>(
    'all'
  );

  const filteredTestimonials = testimonials.filter(
    (testimonial) => filter === 'all' || testimonial.userType === filter
  );

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) =>
        (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length
    );
  };

  const currentTestimonial = filteredTestimonials[currentIndex];

  if (!currentTestimonial) return null;

  return (
    <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
            <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
            Müşteri Deneyimleri
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Başarı Hikayelerimiz
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Binlerce kullanıcımızın hayatlarını değiştiren deneyimlerini
            dinleyin
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-12 flex justify-center">
          <div className="inline-flex items-center rounded-lg bg-white p-1 shadow-sm">
            {[
              { key: 'all', label: 'Tümü' },
              { key: 'freelancer', label: 'Freelancerlar' },
              { key: 'employer', label: 'İşverenler' },
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setFilter(option.key as 'all' | 'freelancer' | 'employer');
                  setCurrentIndex(0);
                }}
                className={`rounded-md px-6 py-2 text-sm font-medium transition-all duration-200 ${
                  filter === option.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Testimonial */}
        <div className="relative">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl lg:p-12">
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="h-16 w-16 text-blue-600" />
              </div>

              <div className="relative z-10">
                {/* User Info */}
                <div className="mb-8 flex items-start gap-6">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                    {currentTestimonial.userType === 'freelancer' && (
                      <div className="absolute -right-1 -bottom-1 rounded-full bg-blue-600 p-1">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {currentTestimonial.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {[...Array(currentTestimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-medium text-gray-600">
                      {currentTestimonial.role}
                    </p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                      {currentTestimonial.userType === 'freelancer' ? (
                        <>
                          <span>{currentTestimonial.projectCount} Proje</span>
                          <span>•</span>
                          <span>{currentTestimonial.earnings} Kazanç</span>
                        </>
                      ) : (
                        <>
                          <span>
                            {currentTestimonial.projectsCompleted} Proje
                          </span>
                          <span>•</span>
                          <span>{currentTestimonial.teamSize} Takım</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Testimonial Content */}
                <blockquote className="text-lg leading-relaxed text-gray-700">
                  &ldquo;{currentTestimonial.content}&rdquo;
                </blockquote>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonial}
              disabled={filteredTestimonials.length <= 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Önceki
            </Button>

            {/* Dots Indicator */}
            <div className="flex items-center gap-2">
              {filteredTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? 'w-6 bg-blue-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonial}
              disabled={filteredTestimonials.length <= 1}
              className="flex items-center gap-2"
            >
              Sonraki
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-blue-600">4.9/5</div>
            <div className="text-sm text-gray-600">Ortalama Müşteri Puanı</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-green-600">99%</div>
            <div className="text-sm text-gray-600">Proje Başarı Oranı</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-3xl font-bold text-purple-600">24sa</div>
            <div className="text-sm text-gray-600">Ortalama Yanıt Süresi</div>
          </div>
        </div>
      </div>
    </section>
  );
}
