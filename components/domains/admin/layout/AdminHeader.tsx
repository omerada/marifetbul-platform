'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  Menu,
  Search,
  Bell,
  Settings,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
} from 'lucide-react';
import { useAdminDashboard } from '@/hooks';

interface AdminHeaderProps {
  onSidebarToggle: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminHeader({
  onSidebarToggle,
  isCollapsed,
  onToggleCollapse,
}: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { alertsSummary, refresh, isLoading } = useAdminDashboard();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality to be implemented with navigation
  };

  return (
    <header className="shadow-soft sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop sidebar toggle */}
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="MarifetBul"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="hidden text-lg font-semibold text-gray-900 sm:block">
                Admin Panel
              </span>
            </Link>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="mx-4 max-w-lg flex-1">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Kullanıcı, sipariş, içerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-gray-200 bg-gray-50 pr-4 pl-10 transition-colors focus:bg-white"
            />
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Back to main site */}
          <Link href="/">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Home className="mr-2 h-4 w-4" />
              Ana Site
            </Button>
          </Link>

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="hidden sm:flex"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-4 w-4" />
              {alertsSummary.unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 border-white bg-red-500 p-0 text-xs text-white">
                  {alertsSummary.unread > 9 ? '9+' : alertsSummary.unread}
                </Badge>
              )}
            </Button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="shadow-large animate-fade-in-up absolute top-full right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white">
                <div className="p-4">
                  <h3 className="mb-3 font-medium text-gray-900">
                    Bildirimler
                  </h3>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                      <p className="text-sm text-blue-800">
                        Yeni kullanıcı kaydı onay bekliyor
                      </p>
                      <p className="mt-1 text-xs text-blue-600">
                        2 dakika önce
                      </p>
                    </div>
                    <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3">
                      <p className="text-sm text-yellow-800">
                        İçerik moderasyon kuyruğu
                      </p>
                      <p className="mt-1 text-xs text-yellow-600">
                        5 dakika önce
                      </p>
                    </div>
                    <div className="rounded-lg border border-green-100 bg-green-50 p-3">
                      <p className="text-sm text-green-800">
                        Aylık rapor hazır
                      </p>
                      <p className="mt-1 text-xs text-green-600">1 saat önce</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link href="/admin/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="bg-primary-100 flex h-8 w-8 items-center justify-center rounded-full">
                <User className="text-primary-600 h-4 w-4" />
              </div>
              <span className="hidden text-sm font-medium text-gray-700 sm:block">
                Admin
              </span>
            </Button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="shadow-large animate-fade-in-up absolute top-full right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white">
                <div className="p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Button>
                  <hr className="my-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
