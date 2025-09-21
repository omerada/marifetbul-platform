'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  FileText,
  BarChart3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  X,
  CreditCard,
  MessageCircle,
  Database,
  Lock,
  Home,
  UserCheck,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminDashboard } from '@/hooks';
import { useAuth } from '@/hooks';

interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: string | number | null;
  permissions?: string[];
  subItems?: {
    name: string;
    href: string;
    current: boolean;
    badge?: string | number | null;
  }[];
}

const navigationItems: Omit<NavigationItem, 'current'>[] = [
  {
    name: 'Ana Sayfa',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
    badge: 3,
    subItems: [
      { name: 'Tüm Kullanıcılar', href: '/admin/users', current: false },
      {
        name: 'Bekleyen Doğrulamalar',
        href: '/admin/users/verifications',
        current: false,
        badge: 3,
      },
      {
        name: 'Kullanıcı Grupları',
        href: '/admin/users/groups',
        current: false,
      },
      {
        name: 'Engellenen Kullanıcılar',
        href: '/admin/users/blocked',
        current: false,
      },
    ],
  },
  {
    name: 'Analitik',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: null,
    subItems: [
      { name: 'Genel Görünüm', href: '/admin/analytics', current: false },
      {
        name: 'Kullanıcı Analizi',
        href: '/admin/analytics/users',
        current: false,
      },
      {
        name: 'Finansal Analiz',
        href: '/admin/analytics/financial',
        current: false,
      },
      {
        name: 'Platform Performansı',
        href: '/admin/analytics/performance',
        current: false,
      },
    ],
  },
  {
    name: 'İçerik Denetimi',
    href: '/admin/moderation',
    icon: Shield,
    badge: 12,
    subItems: [
      {
        name: 'Bekleyen İncelemeler',
        href: '/admin/moderation',
        current: false,
        badge: 7,
      },
      {
        name: 'Raporlanan İçerik',
        href: '/admin/moderation/reports',
        current: false,
        badge: 5,
      },
      {
        name: 'Otomatik Kurallar',
        href: '/admin/moderation/rules',
        current: false,
      },
      {
        name: 'Engellenmiş İçerik',
        href: '/admin/moderation/blocked',
        current: false,
      },
    ],
  },
  {
    name: 'Finans Yönetimi',
    href: '/admin/financial',
    icon: CreditCard,
    badge: null,
    subItems: [
      { name: 'Genel Bakış', href: '/admin/financial', current: false },
      { name: 'Ödemeler', href: '/admin/financial/payments', current: false },
      {
        name: 'Para Çekme Talepleri',
        href: '/admin/financial/withdrawals',
        current: false,
        badge: 2,
      },
      {
        name: 'Komisyonlar',
        href: '/admin/financial/commissions',
        current: false,
      },
      {
        name: 'Fatura Yönetimi',
        href: '/admin/financial/invoices',
        current: false,
      },
    ],
  },
  {
    name: 'İçerik Yönetimi',
    href: '/admin/content',
    icon: FileText,
    badge: null,
    subItems: [
      { name: 'İş İlanları', href: '/admin/content/jobs', current: false },
      {
        name: 'Hizmet Paketleri',
        href: '/admin/content/packages',
        current: false,
      },
      {
        name: 'Kategoriler',
        href: '/admin/content/categories',
        current: false,
      },
      { name: 'Blog & Sayfalar', href: '/admin/content/pages', current: false },
      {
        name: 'Medya Kütüphanesi',
        href: '/admin/content/media',
        current: false,
      },
    ],
  },
  {
    name: 'Mesajlaşma',
    href: '/admin/messaging',
    icon: MessageCircle,
    badge: 8,
    subItems: [
      { name: 'Tüm Konuşmalar', href: '/admin/messaging', current: false },
      {
        name: 'Şikayet Edilen Mesajlar',
        href: '/admin/messaging/reports',
        current: false,
        badge: 3,
      },
      {
        name: 'Sistem Mesajları',
        href: '/admin/messaging/system',
        current: false,
      },
      {
        name: 'Engellenen Kelimeler',
        href: '/admin/messaging/blocked-words',
        current: false,
      },
    ],
  },
  {
    name: 'Destek Sistemi',
    href: '/admin/support',
    icon: MessageCircle,
    badge: 8,
    subItems: [
      {
        name: 'Destek Talepleri',
        href: '/admin/support',
        current: false,
        badge: 5,
      },
      {
        name: 'Sık Sorulan Sorular',
        href: '/admin/support/faq',
        current: false,
      },
      {
        name: 'Bilgi Bankası',
        href: '/admin/support/knowledge-base',
        current: false,
      },
      {
        name: 'Geri Bildirimler',
        href: '/admin/support/feedback',
        current: false,
        badge: 3,
      },
    ],
  },
  {
    name: 'Raporlar',
    href: '/admin/reports',
    icon: BarChart3,
    badge: null,
    subItems: [
      { name: 'Günlük Raporlar', href: '/admin/reports/daily', current: false },
      {
        name: 'Aylık Raporlar',
        href: '/admin/reports/monthly',
        current: false,
      },
      { name: 'Özel Raporlar', href: '/admin/reports/custom', current: false },
      {
        name: 'Performans Raporları',
        href: '/admin/reports/performance',
        current: false,
      },
    ],
  },
  {
    name: 'Sistem Yönetimi',
    href: '/admin/system',
    icon: Database,
    badge: null,
    permissions: ['super_admin'],
    subItems: [
      { name: 'Sistem Durumu', href: '/admin/system/health', current: false },
      { name: 'Yedekleme', href: '/admin/system/backup', current: false },
      { name: 'Loglar', href: '/admin/system/logs', current: false },
      {
        name: 'Performans İzleme',
        href: '/admin/system/performance',
        current: false,
      },
    ],
  },
  {
    name: 'Güvenlik',
    href: '/admin/security',
    icon: Lock,
    badge: null,
    permissions: ['super_admin', 'admin'],
    subItems: [
      { name: 'Güvenlik Ayarları', href: '/admin/security', current: false },
      {
        name: 'İki Faktörlü Doğrulama',
        href: '/admin/security/2fa',
        current: false,
      },
      {
        name: 'API Anahtarları',
        href: '/admin/security/api-keys',
        current: false,
      },
      {
        name: 'Güvenlik Logları',
        href: '/admin/security/logs',
        current: false,
      },
    ],
  },
  {
    name: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
    badge: null,
    subItems: [
      { name: 'Genel Ayarlar', href: '/admin/settings', current: false },
      {
        name: 'E-posta Şablonları',
        href: '/admin/settings/email',
        current: false,
      },
      {
        name: 'Bildirim Ayarları',
        href: '/admin/settings/notifications',
        current: false,
      },
      { name: 'API Ayarları', href: '/admin/settings/api', current: false },
      {
        name: 'Bakım Modu',
        href: '/admin/settings/maintenance',
        current: false,
      },
    ],
  },
];

export function AdminSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { alertsSummary } = useAdminDashboard();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  // Filter items based on user permissions
  const getFilteredNavigation = () => {
    return navigationItems
      .filter((item) => {
        if (!item.permissions) return true;
        return item.permissions.some((permission) => user?.role === permission);
      })
      .map((item) => {
        const isCurrentPage = pathname === item.href;
        const isChildPage = item.subItems?.some(
          (subItem) => pathname === subItem.href
        );
        const current = isCurrentPage || isChildPage || false;

        // Auto-expand if current page is in sub-items
        if (isChildPage && !expandedItems.includes(item.name)) {
          setExpandedItems((prev) => [...prev, item.name]);
        }

        return {
          ...item,
          current,
          subItems: item.subItems?.map((subItem) => ({
            ...subItem,
            current: pathname === subItem.href,
          })),
        } as NavigationItem;
      })
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const filteredNavigation = getFilteredNavigation();

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col',
          'ease-out-quart transition-all duration-300',
          isCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        <div className="shadow-soft flex flex-col border-r border-gray-200 bg-white">
          {/* Logo & Toggle */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            {!isCollapsed && (
              <Link href="/admin" className="flex items-center space-x-2">
                <Image
                  src="/logo.png"
                  alt="MarifetBul"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-semibold text-gray-900">
                  Admin
                </span>
              </Link>
            )}

            {isCollapsed && (
              <Link
                href="/admin"
                className="flex w-full items-center justify-center"
              >
                <Image
                  src="/logo.png"
                  alt="MarifetBul"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </Link>
            )}

            {!isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search */}
          {!isCollapsed && (
            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Menüde ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-gray-200 bg-gray-50 pl-10 focus:bg-white"
                />
              </div>
            </div>
          )}

          {/* User info */}
          {!isCollapsed && user && (
            <div className="border-b border-gray-100 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                  <Badge variant="outline" size="sm" className="mt-1">
                    Admin
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.name);

              return (
                <div key={item.name}>
                  <div className="relative">
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        'hover:bg-gray-50 hover:text-gray-900',
                        isCollapsed ? 'justify-center' : 'justify-start',
                        item.current
                          ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      onClick={(e) => {
                        if (hasSubItems && !isCollapsed) {
                          e.preventDefault();
                          toggleExpanded(item.name);
                        }
                      }}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          item.current
                            ? 'text-primary-600'
                            : 'text-gray-500 group-hover:text-gray-700',
                          !isCollapsed && 'mr-3'
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.name}</span>
                          {item.badge && (
                            <Badge
                              variant={
                                typeof item.badge === 'string' &&
                                item.badge === 'new'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="ml-2"
                            >
                              {item.badge === 'new' ? 'Yeni' : item.badge}
                            </Badge>
                          )}
                          {hasSubItems && (
                            <ChevronRight
                              className={cn(
                                'ml-2 h-4 w-4 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                            />
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute left-full z-50 ml-2 rounded-lg bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {item.name}
                          {item.badge && (
                            <span className="ml-1 rounded bg-gray-700 px-1">
                              {item.badge === 'new' ? 'Yeni' : item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  </div>

                  {/* Sub items */}
                  {hasSubItems && !isCollapsed && isExpanded && (
                    <div className="mt-1 space-y-1 pl-8">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                            subItem.current
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <span>{subItem.name}</span>
                          {subItem.badge && (
                            <Badge variant="secondary" size="sm">
                              {subItem.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-gray-200 p-4">
            {/* Alerts summary */}
            {!isCollapsed && alertsSummary.unread > 0 && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-800">
                    {alertsSummary.unread} bekleyen uyarı
                  </span>
                </div>
              </div>
            )}

            {/* Collapse toggle for collapsed state */}
            {isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="mb-2 w-full justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {/* Navigation to main site */}
            {!isCollapsed && (
              <Link href="/" className="mb-2 block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ana Site
                </Button>
              </Link>
            )}

            {isCollapsed && (
              <Link href="/" className="mb-2 block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {/* Logout */}
            <Button
              variant="ghost"
              size={isCollapsed ? 'sm' : 'md'}
              onClick={handleLogout}
              className={cn(
                'w-full text-red-600 transition-colors hover:bg-red-50 hover:text-red-700',
                isCollapsed ? 'justify-center px-2' : 'justify-start'
              )}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Çıkış Yap</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isOpen ? 'block' : 'hidden'
        )}
      >
        <div className="shadow-large fixed inset-y-0 left-0 flex w-64 flex-col border-r border-gray-200 bg-white">
          {/* Mobile header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <Link href="/admin" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="MarifetBul"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-semibold text-gray-900">
                Admin Panel
              </span>
            </Link>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile navigation */}
          <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-4">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.name);

              return (
                <div key={item.name}>
                  <div
                    className={cn(
                      'group flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-gray-50 hover:text-gray-900',
                      item.current
                        ? 'bg-primary-50 text-primary-700 border-primary-200 border'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => {
                      if (hasSubItems) {
                        toggleExpanded(item.name);
                      } else {
                        // Navigate to the item and close mobile menu
                        window.location.href = item.href;
                        onClose();
                      }
                    }}
                  >
                    <Icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        item.current
                          ? 'text-primary-600'
                          : 'text-gray-500 group-hover:text-gray-700'
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant={
                          typeof item.badge === 'string' && item.badge === 'new'
                            ? 'default'
                            : 'secondary'
                        }
                        className="ml-2"
                      >
                        {item.badge === 'new' ? 'Yeni' : item.badge}
                      </Badge>
                    )}
                    {hasSubItems && (
                      <ChevronRight
                        className={cn(
                          'ml-2 h-4 w-4 transition-transform',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </div>

                  {/* Mobile Sub items */}
                  {hasSubItems && isExpanded && (
                    <div className="mt-1 space-y-1 pl-8">
                      {item.subItems!.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={onClose}
                          className={cn(
                            'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                            subItem.current
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <span>{subItem.name}</span>
                          {subItem.badge && (
                            <Badge variant="secondary" size="sm">
                              {subItem.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile bottom section */}
          <div className="space-y-2 border-t border-gray-200 p-4">
            <Link href="/" onClick={onClose}>
              <Button
                variant="ghost"
                size="md"
                className="w-full justify-start text-gray-700 hover:bg-gray-50"
              >
                <Home className="mr-2 h-4 w-4" />
                Ana Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="md"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminSidebar;
