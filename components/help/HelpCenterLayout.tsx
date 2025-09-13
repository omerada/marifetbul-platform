'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MessageCircle, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface HelpCenterLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

export function HelpCenterLayout({
  children,
  title = 'Yardım Merkezi',
  showBackButton = true,
  showSearch = true,
  onSearch,
}: HelpCenterLayoutProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/help/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const goHome = () => {
    router.push('/help');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="py-4">
            {/* Navigation */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {showBackButton && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Geri
                  </button>
                )}

                <button
                  onClick={goHome}
                  className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <Home className="h-4 w-4" />
                  Yardım Merkezi
                </button>

                <div className="h-5 w-px bg-gray-300" />

                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push('/help/chat')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Canlı Destek
                </Button>

                <Button
                  onClick={() => router.push('/support/create')}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Destek Talebi
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Yardım makalelerinde ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-20 pl-10"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                  >
                    Ara
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
