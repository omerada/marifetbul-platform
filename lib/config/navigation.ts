/**
 * Navigation Configuration
 * Centralized navigation links for consistency across all components
 */

import {
  Home,
  Search,
  Package,
  Briefcase,
  Grid,
  MessageCircle,
  Bell,
  Settings,
  User,
  HelpCircle,
  FileText,
  Shield,
  type LucideIcon,
} from 'lucide-react';

export interface NavigationItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  roles?: Array<'freelancer' | 'employer' | 'admin'>;
}

/**
 * Main Navigation (Header)
 */
export const mainNavigation: NavigationItem[] = [
  {
    href: '/',
    label: 'Ana Sayfa',
    icon: Home,
  },
  {
    href: '/marketplace',
    label: 'Keşfet',
    icon: Search,
    children: [
      {
        href: '/marketplace/packages',
        label: 'Paketler',
        icon: Package,
      },
      {
        href: '/marketplace/jobs',
        label: 'İşler',
        icon: Briefcase,
      },
      {
        href: '/marketplace/categories',
        label: 'Kategoriler',
        icon: Grid,
      },
    ],
  },
  {
    href: '/messages',
    label: 'Mesajlar',
    icon: MessageCircle,
    requiresAuth: true,
  },
  {
    href: '/notifications',
    label: 'Bildirimler',
    icon: Bell,
    requiresAuth: true,
  },
];

/**
 * Marketplace Sub-Navigation
 */
export const marketplaceNavigation: NavigationItem[] = [
  {
    href: '/marketplace',
    label: 'Keşfet',
    icon: Search,
  },
  {
    href: '/marketplace/packages',
    label: 'Paketler',
    icon: Package,
  },
  {
    href: '/marketplace/jobs',
    label: 'İşler',
    icon: Briefcase,
  },
  {
    href: '/marketplace/categories',
    label: 'Kategoriler',
    icon: Grid,
  },
];

/**
 * Dashboard Navigation - Freelancer
 */
export const freelancerDashboardNavigation: NavigationItem[] = [
  {
    href: '/dashboard/freelancer',
    label: 'Özet',
    icon: Home,
  },
  {
    href: '/dashboard/freelancer/packages',
    label: 'Paketlerim',
    icon: Package,
  },
  {
    href: '/dashboard/freelancer/orders',
    label: 'Siparişler',
    icon: Briefcase,
  },
  {
    href: '/dashboard/freelancer/proposals',
    label: 'Teklifler',
    icon: FileText,
  },
  {
    href: '/dashboard/freelancer/reviews',
    label: 'Değerlendirmeler',
    icon: Shield,
  },
  {
    href: '/dashboard/wallet',
    label: 'Cüzdan',
    icon: Shield,
  },
  {
    href: '/dashboard/freelancer/analytics',
    label: 'Analitik',
    icon: Grid,
  },
];

/**
 * Dashboard Navigation - Employer
 * @deprecated Use unified /dashboard route instead. These routes redirect automatically.
 * Keep for backward compatibility with matchPaths
 */
export const employerDashboardNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Özet',
    icon: Home,
  },
  {
    href: '/dashboard/my-jobs',
    label: 'İş İlanlarım',
    icon: Briefcase,
  },
  {
    href: '/dashboard/orders',
    label: 'Siparişler',
    icon: Package,
  },
  {
    href: '/dashboard/my-proposals',
    label: 'Gelen Teklifler',
    icon: FileText,
  },
  {
    href: '/search?type=freelancers',
    label: 'Freelancerlar',
    icon: User,
  },
  {
    href: '/dashboard/reviews',
    label: 'Değerlendirmeler',
    icon: Shield,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analitik',
    icon: Grid,
  },
];

/**
 * Moderator Tools Navigation
 * Note: Main moderator dashboard is at /dashboard (UnifiedDashboard)
 * These are moderator-specific tools and actions
 */
export const moderatorToolsNavigation: NavigationItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/moderator/comments',
    label: 'Yorumlar',
    icon: MessageCircle,
  },
  {
    href: '/moderator/reviews',
    label: 'Değerlendirmeler',
    icon: Shield,
  },
  {
    href: '/moderator/reports',
    label: 'Raporlar',
    icon: FileText,
  },
  {
    href: '/moderator/tickets',
    label: 'Destek',
    icon: HelpCircle,
  },
  {
    href: '/moderator/performance',
    label: 'Performans',
    icon: Grid,
  },
  {
    href: '/moderator/activity',
    label: 'Aktivite',
    icon: Bell,
  },
];

/**
 * Settings Navigation
 */
export const settingsNavigation: NavigationItem[] = [
  {
    href: '/dashboard/settings/general',
    label: 'Genel',
    icon: Settings,
  },
  {
    href: '/dashboard/settings/security',
    label: 'Güvenlik',
    icon: Shield,
  },
  {
    href: '/dashboard/settings/notifications',
    label: 'Bildirimler',
    icon: Bell,
  },
  {
    href: '/dashboard/settings/privacy',
    label: 'Gizlilik',
    icon: Shield,
  },
  {
    href: '/dashboard/settings/payment',
    label: 'Ödeme Yöntemleri',
    icon: Package,
  },
];

/**
 * Footer Navigation
 */
export const footerNavigation = {
  company: [
    { href: '/info/how-it-works', label: 'Nasıl Çalışır?' },
    { href: '/info/contact', label: 'İletişim' },
    { href: '/info/faq', label: 'Sıkça Sorulan Sorular' },
    { href: '/blog', label: 'Blog' },
  ],
  support: [
    { href: '/support/help', label: 'Yardım Merkezi' },
    { href: '/support', label: 'Destek' },
    { href: '/legal/safety', label: 'Güvenlik' },
  ],
  legal: [
    { href: '/legal/terms', label: 'Kullanım Koşulları' },
    { href: '/legal/privacy', label: 'Gizlilik Politikası' },
    { href: '/legal/cookies', label: 'Çerez Politikası' },
  ],
};

/**
 * User Dropdown Menu Navigation
 */
export const userMenuNavigation: NavigationItem[] = [
  {
    href: '/profile/[id]',
    label: 'Profilim',
    icon: User,
    requiresAuth: true,
  },
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: Grid,
    requiresAuth: true,
  },
  {
    href: '/dashboard/settings',
    label: 'Ayarlar',
    icon: Settings,
    requiresAuth: true,
  },
  {
    href: '/messages',
    label: 'Mesajlar',
    icon: MessageCircle,
    requiresAuth: true,
  },
];

/**
 * Help & Support Navigation
 */
export const supportNavigation: NavigationItem[] = [
  {
    href: '/support/help',
    label: 'Yardım Merkezi',
    icon: HelpCircle,
  },
  {
    href: '/support/tickets',
    label: 'Destek Talepleri',
    icon: FileText,
    requiresAuth: true,
  },
  {
    href: '/info/contact',
    label: 'İletişim',
    icon: MessageCircle,
  },
];

/**
 * Helper function to get navigation items by user role
 */
export function getNavigationByRole(
  userType?: 'freelancer' | 'employer' | 'admin'
): NavigationItem[] {
  if (!userType) return mainNavigation;

  if (userType === 'freelancer') {
    return [...mainNavigation, ...freelancerDashboardNavigation];
  }

  if (userType === 'employer') {
    return [...mainNavigation, ...employerDashboardNavigation];
  }

  return mainNavigation;
}

/**
 * Helper function to check if path is active
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  // Exact match for home
  if (href === '/' && pathname === '/') return true;
  if (href === '/' && pathname !== '/') return false;

  // Starts with match for other paths
  return pathname === href || pathname.startsWith(href + '/');
}

const navigationConfig = {
  mainNavigation,
  marketplaceNavigation,
  freelancerDashboardNavigation,
  employerDashboardNavigation,
  moderatorToolsNavigation,
  settingsNavigation,
  footerNavigation,
  userMenuNavigation,
  supportNavigation,
  getNavigationByRole,
  isNavItemActive,
};

export default navigationConfig;
