'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  X,
  Bell,
  User,
  LogOut,
  UserCircle,
  Settings,
  ChevronDown,
  MessageCircle,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { UniversalSearch } from '@/components/shared/features';
import useAuthStore from '@/lib/core/store/auth';
import { useUnreadCount } from '@/hooks';

export function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, refreshAuth } = useAuthStore();
  const unreadCount = useUnreadCount();

  // Refresh auth on component mount
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

  const handleSearch = (query: string, type?: string) => {
    if (!query.trim()) return;

    const params = new URLSearchParams();
    params.set('q', query);

    if (type === 'packages') {
      params.set('view', 'packages');
    } else if (type === 'jobs') {
      params.set('view', 'jobs');
    } else {
      // Akıllı default: sorgu tipine göre karar ver
      const lowerQuery = query.toLowerCase();
      if (
        lowerQuery.includes('hizmet') ||
        lowerQuery.includes('paket') ||
        lowerQuery.includes('logo') ||
        lowerQuery.includes('tasarım') ||
        lowerQuery.includes('çeviri') ||
        lowerQuery.includes('yazı')
      ) {
        params.set('view', 'packages');
      } else {
        params.set('view', 'jobs');
      }
    }

    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/icons/icon-48x48.png"
                alt="Marifeto"
                width={32}
                height={32}
                className="rounded-lg"
                onError={(e) => {
                  // Fallback to M letter if icon fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                      <span class="text-sm font-bold text-white">M</span>
                    </div>
                  `;
                }}
              />
              <span className="text-xl font-bold text-gray-900">Marifeto</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden flex-shrink-0 items-center space-x-8 md:flex">
            <Link
              href="/marketplace"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              İş & Hizmet
            </Link>
            <Link
              href="/info/how-it-works"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Nasıl Çalışır?
            </Link>
          </nav>

          {/* Universal Search Bar (Desktop) */}
          <div className="mx-4 hidden max-w-md flex-1 lg:flex xl:mx-8 xl:max-w-lg">
            <UniversalSearch
              onSearch={handleSearch}
              placeholder="Ne arıyorsun? (logo tasarım, web geliştirme, veri analizi...)"
              className="w-full"
            />
          </div>

          {/* Desktop Auth */}
          <div className="hidden flex-shrink-0 items-center space-x-4 md:flex">
            {isAuthenticated ? (
              <>
                <Link href="/messages">
                  <Button variant="ghost" size="sm" className="relative">
                    <MessageCircle className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center"
                  >
                    <User className="h-4 w-4" />
                    <span className="ml-2">{user?.firstName}</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                      <Link
                        href={`/profile/${user?.id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle className="mr-2 h-4 w-4" />
                        Profilimi Görüntüle
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Profili Düzenle
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Üye Ol
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 md:hidden"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            {/* Mobile Universal Search */}
            <div className="mb-4">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Ne arıyorsun? (logo, web tasarım, yazılım...)"
                className="w-full"
              />
            </div>

            {/* Mobile Navigation */}
            <nav className="mb-4 space-y-2">
              <Link
                href="/marketplace"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Keşfet
              </Link>
              <Link
                href="/info/how-it-works"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Nasıl Çalışır?
              </Link>
            </nav>

            {/* Mobile Auth */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="mb-3 text-center text-sm text-gray-600">
                    Hoş geldin, {user?.firstName}
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" fullWidth>
                      Dashboard
                    </Button>
                  </Link>
                  <div className="mt-2 flex items-center justify-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <User className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" fullWidth>
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="primary" fullWidth>
                      Üye Ol
                    </Button>
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
