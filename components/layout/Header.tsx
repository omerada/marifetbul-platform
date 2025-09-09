'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search, Bell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import useAuthStore from '@/lib/store/auth';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, refreshAuth } = useAuthStore();

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Marifeto</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link
              href="/marketplace"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              İş İlanları
            </Link>
            <Link
              href="/packages"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Hizmetler
            </Link>
            <Link
              href="/freelancers"
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Uzmanlar
            </Link>
          </nav>

          {/* Search Bar (Desktop) */}
          <div className="mx-8 hidden max-w-lg flex-1 lg:flex">
            <div className="relative w-full">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="İş, hizmet veya uzman ara..."
                className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden items-center space-x-4 md:flex">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4" />
                    <span className="ml-2">{user?.firstName}</span>
                  </Button>
                </div>
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
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
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="İş, hizmet veya uzman ara..."
                  className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="mb-4 space-y-2">
              <Link
                href="/marketplace"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                İş İlanları
              </Link>
              <Link
                href="/packages"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hizmetler
              </Link>
              <Link
                href="/freelancers"
                className="block rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Uzmanlar
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
