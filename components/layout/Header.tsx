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
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useUnreadCount } from '@/hooks';
import { NotificationBell } from '@/components/domains/notifications/NotificationBell';

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
            <Link
              href="/"
              className="flex items-center space-x-3"
              aria-label="MarifetBul Ana Sayfa"
            >
              <div className="relative">
                <Image
                  src="/icons/icon-48x48.png"
                  alt="MarifetBul Logo"
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
          <nav
            className="hidden md:flex"
            role="navigation"
            aria-label="Ana navigasyon"
          >
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
              placeholder="Hizmet, iþ veya beceri ara..."
              className="w-full"
            />
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden items-center space-x-3 md:flex">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <NotificationBell />

                {/* Messages */}
                <Link
                  href="/messages"
                  aria-label={
                    unreadCount > 0
                      ? `Mesajlar (${unreadCount} okunmamýþ)`
                      : 'Mesajlar'
                  }
                  className="relative inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
                      aria-label={`${unreadCount} okunmamýþ mesaj`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label="Kullanýcý menüsü"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-controls="user-menu"
                    className="flex items-center space-x-2 rounded-lg p-2 text-gray-700 transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      id="user-menu"
                      role="menu"
                      className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                    >
                      <Link
                        href={`/profile/${user?.id}`}
                        role="menuitem"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle
                          className="mr-3 h-4 w-4"
                          aria-hidden="true"
                        />
                        Profilim
                      </Link>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" aria-hidden="true" />
                        Panel
                      </Link>
                      <hr className="my-1 border-gray-200" role="separator" />
                      <button
                        onClick={handleLogout}
                        role="menuitem"
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
                        Çýkýþ Yap
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
                  Giriþ Yap
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
              aria-label={isMobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-gray-200 py-4 md:hidden"
          >
            {/* Mobile Search */}
            <div className="mb-4 px-2">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Hizmet, iþ veya beceri ara..."
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
                    Giriþ Yap
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
