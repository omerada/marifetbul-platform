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
import { UniversalSearch } from '@/components/domains/search';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useUnreadCount } from '@/hooks';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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

  const handleSearch = (query: string, type?: string) => {
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set('q', query);
    if (type === 'packages') {
      params.set('view', 'packages');
    } else if (type === 'jobs') {
      params.set('view', 'jobs');
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/icons/icon-48x48.png"
                alt="MarifetBul"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-foreground text-xl font-bold">
                MarifetBul
              </span>
            </Link>
          </div>

          <nav className="hidden space-x-8 md:flex">
            <Link
              href="/marketplace"
              className="text-foreground hover:text-primary transition-colors"
            >
              Pazar Yeri
            </Link>
            <Link
              href="/marketplace?view=jobs"
              className="text-foreground hover:text-primary transition-colors"
            >
              ş lanları
            </Link>
            <Link
              href="/marketplace?view=packages"
              className="text-foreground hover:text-primary transition-colors"
            >
              Hizmet Paketleri
            </Link>
          </nav>

          <div className="mx-8 hidden max-w-lg flex-1 md:block">
            <UniversalSearch
              onSearch={handleSearch}
              placeholder="Hizmet, iş veya beceri ara..."
              className="w-full"
            />
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <ThemeToggle variant="icon" size="sm" />

            {isAuthenticated ? (
              <>
                <Link
                  href="/messages"
                  className="text-muted-foreground hover:text-foreground relative p-2 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="text-muted-foreground hover:text-foreground flex items-center space-x-2 rounded-lg p-2 transition-colors"
                  >
                    <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="border-border bg-popover absolute right-0 z-50 mt-2 w-48 rounded-md border py-1 shadow-lg">
                      <Link
                        href={`/profile/${user?.id}`}
                        className="text-popover-foreground hover:bg-accent flex items-center px-4 py-2 text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserCircle className="mr-3 h-4 w-4" />
                        Profilim
                      </Link>
                      <Link
                        href="/dashboard"
                        className="text-popover-foreground hover:bg-accent flex items-center px-4 py-2 text-sm"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="mr-3 h-4 w-4" />
                        Panel
                      </Link>
                      <hr className="border-border my-1" />
                      <button
                        onClick={handleLogout}
                        className="text-popover-foreground hover:bg-accent flex w-full items-center px-4 py-2 text-sm"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                >
                  Üye Ol
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle variant="icon" size="sm" />
            <button
              onClick={toggleMobileMenu}
              className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center rounded-md p-2 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-border border-t py-4 md:hidden">
            <div className="mb-4 px-2">
              <UniversalSearch
                onSearch={handleSearch}
                placeholder="Hizmet, iş veya beceri ara..."
                className="w-full"
              />
            </div>
            <div className="space-y-2 px-2">
              <Link
                href="/marketplace"
                className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pazar Yeri
              </Link>
              <Link
                href="/marketplace?view=jobs"
                className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ş lanları
              </Link>
              <Link
                href="/marketplace?view=packages"
                className="text-foreground hover:bg-accent block rounded-md px-3 py-2 text-base font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Hizmet Paketleri
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
