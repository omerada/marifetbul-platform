'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Home,
  MessageCircle,
  ChevronRight,
  HelpCircle,
  Book,
  Clock,
  Star,
} from 'lucide-react';
import { useHelpCenter } from '@/hooks/useHelpCenter';
import { cn } from '@/lib/utils';

interface HelpCenterLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export const HelpCenterLayout: React.FC<HelpCenterLayoutProps> = ({
  children,
  currentPath = '/',
}) => {
  const router = useRouter();
  const { searchArticles, searchLoading } = useHelpCenter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const navigation = [
    {
      name: 'Ana Sayfa',
      href: '/help',
      icon: Home,
      description: 'Yardım merkezine genel bakış',
    },
    {
      name: 'Makaleler',
      href: '/help/articles',
      icon: Book,
      description: 'Tüm yardım makaleleri',
    },
    {
      name: 'Sık Sorulanlar',
      href: '/help/faq',
      icon: HelpCircle,
      description: 'En çok sorulan sorular',
    },
    {
      name: 'Destek Talebi',
      href: '/help/support',
      icon: MessageCircle,
      description: 'Teknik destek al',
    },
    {
      name: 'Güncellemeler',
      href: '/help/updates',
      icon: Clock,
      description: 'Platform güncellemeleri',
    },
  ];

  const quickActions = [
    {
      title: 'İş Nasıl Yayınlanır?',
      description: 'Adım adım iş yayınlama rehberi',
      href: '/help/articles/how-to-post-job',
      popular: true,
    },
    {
      title: 'Ödeme Nasıl Yapılır?',
      description: 'Güvenli ödeme yöntemleri',
      href: '/help/articles/payment-methods',
      popular: true,
    },
    {
      title: 'Profil Nasıl Düzenlenir?',
      description: 'Profilinizi optimize edin',
      href: '/help/articles/edit-profile',
      popular: false,
    },
    {
      title: 'Güvenlik İpuçları',
      description: 'Hesabınızı güvende tutun',
      href: '/help/articles/security-tips',
      popular: true,
    },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchArticles(searchQuery);
      router.push(`/help/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const breadcrumbItems = currentPath.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Yardım Merkezi
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Marifeto platformunu en iyi şekilde kullanmanız için her türlü
                rehber ve destek
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nasıl yardım edebiliriz? Arama yapın..."
                  className="w-full rounded-xl border border-gray-300 py-4 pr-4 pl-12 text-lg focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="absolute top-1/2 right-2 -translate-y-1/2 transform rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {searchLoading ? 'Aranıyor...' : 'Ara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Navigation */}
          <div className="flex-shrink-0 lg:w-64">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      'group flex w-full items-center rounded-lg px-4 py-3 text-left transition-colors',
                      isActive
                        ? 'border-l-4 border-blue-600 bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        isActive
                          ? 'text-blue-600'
                          : 'text-gray-400 group-hover:text-gray-600'
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="truncate text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                Popüler Konular
              </h3>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => router.push(action.href)}
                    className="block w-full rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {action.title}
                          </span>
                          {action.popular && (
                            <Star className="h-3 w-3 fill-current text-yellow-500" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                          {action.description}
                        </p>
                      </div>
                      <ChevronRight className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Breadcrumb */}
            {breadcrumbItems.length > 1 && (
              <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
                <button
                  onClick={() => router.push('/help')}
                  className="hover:text-gray-900"
                >
                  Yardım
                </button>
                {breadcrumbItems.slice(1).map((item, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    <span
                      className={
                        index === breadcrumbItems.length - 2
                          ? 'font-medium text-gray-900'
                          : ''
                      }
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Content */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterLayout;
