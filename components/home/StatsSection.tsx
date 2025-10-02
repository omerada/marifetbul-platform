'use client';

import {
  TrendingUp,
  Users,
  Briefcase,
  Award,
  Clock,
  Globe,
} from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '125K+',
    label: 'Aktif Kullanıcı',
    description: 'Freelancer ve işveren',
    color: 'blue',
  },
  {
    icon: Briefcase,
    value: '89K+',
    label: 'Tamamlanan Proje',
    description: 'Başarılı işbirlikleri',
    color: 'green',
  },
  {
    icon: TrendingUp,
    value: '₺47M+',
    label: 'Toplam Kazanç',
    description: 'Freelancerlara ödenen',
    color: 'purple',
  },
  {
    icon: Award,
    value: '4.9/5',
    label: 'Ortalama Puan',
    description: 'Müşteri memnuniyeti',
    color: 'yellow',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Destek',
    description: 'Kesintisiz hizmet',
    color: 'red',
  },
  {
    icon: Globe,
    value: '50+',
    label: 'Kategori',
    description: 'Farklı uzmanlık alanı',
    color: 'indigo',
  },
];

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-700',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-700',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    text: 'text-purple-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    text: 'text-yellow-700',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    text: 'text-indigo-700',
  },
};

export function StatsSection() {
  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Sayılarla MarifetBul
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Büyüyen topluluğumuz ve başarı hikayelerimiz ile geleceği inşa
            ediyoruz
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat, index) => {
            const colors =
              colorVariants[stat.color as keyof typeof colorVariants];
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
              >
                <div className="relative z-10">
                  <div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} mb-4 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <stat.icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      {stat.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stat.description}
                    </div>
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                  <div className="absolute -bottom-4 -left-4 h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              <span>Gerçek zamanlı veriler</span>
            </div>
            <span>•</span>
            <span>Son güncelleme: Bugün</span>
          </div>
        </div>
      </div>
    </section>
  );
}
