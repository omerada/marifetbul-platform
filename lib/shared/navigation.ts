/**
 * ================================================
 * NAVIGATION UTILITIES
 * ================================================
 * Helper functions for navigation and routing
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

import type { UserRole } from '@/types/backend-aligned';

/**
 * Get the appropriate dashboard route based on user role
 * @param userRole - The user's role (FREELANCER, EMPLOYER, ADMIN, MODERATOR)
 * @returns The dashboard route path
 */
export function getDashboardRoute(userRole?: UserRole | string): string {
  const role = userRole?.toUpperCase();
  switch (role) {
    case 'ADMIN':
    case 'MODERATOR':
      return '/admin';
    case 'FREELANCER':
    case 'EMPLOYER':
    default:
      return '/dashboard';
  }
}

/**
 * Check if a given path is the active dashboard section
 * @param pathname - Current pathname from usePathname()
 * @param href - The href to check against
 * @param matchPaths - Optional array of paths to match
 * @returns True if the path is active
 */
export function isDashboardPathActive(
  pathname: string,
  href: string,
  matchPaths?: string[]
): boolean {
  if (matchPaths) {
    return matchPaths.some(
      (path) => pathname === path || pathname?.startsWith(path + '/')
    );
  }
  return pathname === href || pathname?.startsWith(href + '/');
}

/**
 * Get dashboard navigation items for a specific role
 * @param role - The user's role
 * @returns Array of navigation items
 */
export function getDashboardNavigation(role: 'freelancer' | 'employer') {
  const freelancerNav = [
    {
      label: 'Genel Bakış',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      matchPaths: ['/dashboard'],
    },
    {
      label: 'Paketlerim',
      href: '/marketplace/packages',
      icon: 'Package',
    },
    {
      label: 'Siparişler',
      href: '/dashboard/orders',
      icon: 'Briefcase',
    },
    {
      label: 'Tekliflerim',
      href: '/dashboard/my-proposals',
      icon: 'FileText',
    },
    {
      label: 'Değerlendirmeler',
      href: '/dashboard/reviews',
      icon: 'Star',
    },
    {
      label: 'Cüzdan',
      href: '/dashboard/wallet',
      icon: 'Wallet',
    },
    {
      label: 'İstatistikler',
      href: '/dashboard/analytics',
      icon: 'TrendingUp',
    },
  ];

  const employerNav = [
    {
      label: 'Genel Bakış',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      matchPaths: ['/dashboard'],
    },
    {
      label: 'İş İlanları',
      href: '/dashboard/my-jobs',
      icon: 'Briefcase',
      matchPaths: ['/dashboard/my-jobs'],
    },
    {
      label: 'Siparişler',
      href: '/dashboard/orders',
      icon: 'Package',
      matchPaths: ['/dashboard/orders'],
    },
    {
      label: 'Teklifler',
      href: '/dashboard/my-proposals',
      icon: 'FileText',
      matchPaths: ['/dashboard/my-proposals'],
    },
    {
      label: 'Freelancerlar',
      href: '/search?type=freelancers',
      icon: 'Users',
      matchPaths: ['/search'],
    },
    {
      label: 'Değerlendirmeler',
      href: '/dashboard/reviews',
      icon: 'Star',
      matchPaths: ['/dashboard/reviews'],
    },
    {
      label: 'İstatistikler',
      href: '/dashboard/analytics',
      icon: 'TrendingUp',
      matchPaths: ['/dashboard/analytics'],
    },
  ];

  const sharedNav = [
    {
      label: 'Mesajlar',
      href: '/messages',
      icon: 'MessageSquare',
    },
    {
      label: 'Ayarlar',
      href: '/dashboard/settings',
      icon: 'Settings',
    },
  ];

  // Normalize role for comparison
  const normalizedRole = role?.toUpperCase();
  return [
    ...(normalizedRole === 'FREELANCER' ? freelancerNav : employerNav),
    ...sharedNav,
  ];
}

/**
 * Generate breadcrumb items from pathname
 * @param pathname - Current pathname
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  // Add home
  breadcrumbs.push({
    label: 'Ana Sayfa',
    href: '/',
  });

  // Build breadcrumbs from segments
  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // Skip dynamic segments like [id]
    if (segment.startsWith('[') && segment.endsWith(']')) {
      continue;
    }

    // Format label
    const label = formatBreadcrumbLabel(segment);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  }

  return breadcrumbs;
}

/**
 * Format a path segment into a readable breadcrumb label
 * @param segment - Path segment
 * @returns Formatted label
 */
function formatBreadcrumbLabel(segment: string): string {
  // Special cases
  const specialCases: Record<string, string> = {
    dashboard: 'Panel',
    freelancer: 'Freelancer',
    employer: 'İşveren',
    packages: 'Paketler',
    orders: 'Siparişler',
    proposals: 'Teklifler',
    reviews: 'Değerlendirmeler',
    analytics: 'İstatistikler',
    settings: 'Ayarlar',
    messages: 'Mesajlar',
    wallet: 'Cüzdan',
    payouts: 'Ödemeler',
    transactions: 'İşlemler',
    jobs: 'İş İlanları',
    freelancers: 'Freelancerlar',
    marketplace: 'Pazar Yeri',
    categories: 'Kategoriler',
    blog: 'Blog',
    admin: 'Yönetici',
    support: 'Destek',
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Default: capitalize first letter and replace hyphens
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
