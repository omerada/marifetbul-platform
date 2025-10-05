'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  User,
  LogOut,
  UserCircle,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { UniversalSearch } from '@/components/domains/search';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useUnreadCount } from '@/hooks';

export function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, refreshAuth } = useAuthStore();
  const unreadCount = useUnreadCount()?.data?.total || 0;

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set('q', query);
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/icons/icon-48x48.png"
                  alt="MarifetBul"
                  width={32}
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
                MarifetBul
              </span>
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex">
            <Link
              href="/marketplace"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Pazar Yeri
            </Link>
            <Link
              href="/marketplace/categories"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
            >
              Kategoriler
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="mx-8 hidden max-w-lg flex-1 md:block">
            <UniversalSearch
              onSearch={handleSearch}
              placeholder="Hizmet, iş veya beceri ara..."
              className="w-full"
            />
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden items-center space-x-3 md:flex">
            {isAuthenticated ? (
              <>
                {/* Messages */}
                <Link
                  href="/messages"
                  className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 rounded-lg p-2 text-gray-700 transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <Link
                        href={`/profile/${user?.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle className="mr-3 h-4 w-4" />
                        Profilim
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Panel
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  Üye Ol
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            {/* Mobile Search */}
            <div className="mb-4 px-2">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Hizmet, iş veya beceri ara..."
                className="w-full"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="space-y-1 px-2">
              <Link
                href="/marketplace"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pazar Yeri
              </Link>
              <Link
                href="/marketplace/categories"
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kategoriler
              </Link>

              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    href="/register"
                    className="block rounded-lg bg-blue-600 px-3 py-2 text-base font-medium text-white hover:bg-blue-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Üye Ol
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
