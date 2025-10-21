'use client';

import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Search,
  Briefcase,
  Package,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Target,
} from 'lucide-react';

interface EmptyStateProps {
  mode: 'jobs' | 'packages';
  title: string;
  description: string;
  action?: React.ReactNode;
  onClearFilters?: () => void;
  onShowAll?: () => void;
}

export function EmptyState({
  mode,
  title,
  description,
  action,
  onClearFilters: _onClearFilters,
  onShowAll,
}: EmptyStateProps) {
  const Icon = mode === 'jobs' ? Briefcase : Package;

  // Mode-specific suggestions
  const suggestions =
    mode === 'jobs'
      ? [
          {
            icon: Target,
            text: 'Farklı kategorilerde arama yapın',
            color: 'text-blue-600',
          },
          {
            icon: Search,
            text: 'Filtre kriterlerinizi genişletin',
            color: 'text-green-600',
          },
          {
            icon: TrendingUp,
            text: 'Popüler iş ilanlarına göz atın',
            color: 'text-purple-600',
          },
        ]
      : [
          {
            icon: Sparkles,
            text: 'Farklı hizmet kategorilerini inceleyin',
            color: 'text-blue-600',
          },
          {
            icon: Search,
            text: 'Arama filtrelerinizi değiştirin',
            color: 'text-green-600',
          },
          {
            icon: TrendingUp,
            text: 'En çok tercih edilen paketleri görüntüleyin',
            color: 'text-purple-600',
          },
        ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid-pattern"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 32V0h32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30" />

      <div
        className="relative flex min-h-[500px] flex-col items-center justify-center px-6 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        {/* Animated Icon Container */}
        <div className="relative mb-10" aria-hidden="true">
          {/* Glow Effect */}
          <div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-2xl" />

          {/* Icon Background with gradient border */}
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500 opacity-20 blur-md" />
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-50 to-purple-50 p-10 shadow-xl ring-1 ring-gray-200/50">
              <Icon className="h-16 w-16 text-blue-600" strokeWidth={1.5} />
            </div>
          </div>

          {/* Decorative Elements */}
          <div
            className="absolute -top-2 -right-2 h-4 w-4 animate-bounce rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="absolute top-8 -left-2 h-3 w-3 animate-bounce rounded-full bg-gradient-to-br from-green-400 to-emerald-400 shadow-lg"
            style={{ animationDelay: '0.4s' }}
          />
          <div
            className="absolute right-6 -bottom-1 h-3 w-3 animate-bounce rounded-full bg-gradient-to-br from-purple-400 to-pink-400 shadow-lg"
            style={{ animationDelay: '0.6s' }}
          />
        </div>

        {/* Content */}
        <div className="mb-10 max-w-2xl space-y-4">
          <h3
            className="text-3xl font-bold tracking-tight text-gray-900"
            id="empty-state-title"
          >
            {title}
          </h3>

          <p
            className="text-lg leading-relaxed text-gray-600"
            aria-describedby="empty-state-title"
          >
            {description}
          </p>
        </div>

        {/* Suggestions Grid */}
        <div className="mb-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200/60 transition-all hover:shadow-md hover:ring-gray-300/80"
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative flex flex-col items-center gap-3 text-center">
                <div
                  className={`rounded-lg bg-gray-50 p-2.5 transition-colors group-hover:bg-gray-100 ${suggestion.color}`}
                >
                  <suggestion.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="text-sm leading-snug font-medium text-gray-700">
                  {suggestion.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {action || (
          <Button
            onClick={onShowAll}
            className="group gap-2 bg-gradient-to-r from-blue-600 to-blue-700 shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
            aria-label={`Tüm ${mode === 'jobs' ? 'iş ilanlarını' : 'hizmet paketlerini'} göster`}
          >
            <Search
              className="h-4 w-4 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <span>
              {mode === 'jobs'
                ? 'Tüm İş İlanlarını Göster'
                : 'Tüm Hizmet Paketlerini Göster'}
            </span>
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
        )}

        {/* Bottom hint */}
        <p className="mt-8 text-sm text-gray-500">
          Yeni {mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri'} düzenli
          olarak ekleniyor. Daha sonra tekrar kontrol edin.
        </p>
      </div>
    </div>
  );
}
