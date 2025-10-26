/**
 * NavLink Component
 * Standardized navigation link with active state detection
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isNavItemActive } from '@/lib/config/navigation';
import type { NavigationItem } from '@/lib/config/navigation';
import type { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  badge?: number;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}

export function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  className,
  activeClassName,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
        'hover:bg-gray-100 hover:text-gray-900',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
        isActive
          ? activeClassName ||
              'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
          : 'text-gray-700',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 transition-colors',
            isActive
              ? 'text-blue-600'
              : 'text-gray-500 group-hover:text-gray-700'
          )}
        />
      )}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold',
            isActive
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

/**
 * NavLinkList Component
 * Renders a list of navigation links
 */
interface NavLinkListProps {
  items: NavigationItem[];
  className?: string;
  onItemClick?: () => void;
}

export function NavLinkList({
  items,
  className,
  onItemClick,
}: NavLinkListProps) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          onClick={onItemClick}
        />
      ))}
    </nav>
  );
}

/**
 * HorizontalNavLink Component
 * Navigation link for horizontal layouts (header)
 */
export function HorizontalNavLink({
  href,
  label,
  icon: Icon,
  badge,
  className,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200',
        'hover:text-blue-600',
        'rounded-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
        isActive ? 'text-blue-600' : 'text-gray-700',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-4 w-4 transition-colors',
            isActive
              ? 'text-blue-600'
              : 'text-gray-500 group-hover:text-blue-600'
          )}
        />
      )}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {isActive && (
        <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-blue-600" />
      )}
    </Link>
  );
}

/**
 * HorizontalNavLinkList Component
 * Renders a horizontal list of navigation links
 */
export function HorizontalNavLinkList({
  items,
  className,
  onItemClick,
}: NavLinkListProps) {
  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {items.map((item) => (
        <HorizontalNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          onClick={onItemClick}
        />
      ))}
    </nav>
  );
}

/**
 * MobileNavLink Component
 * Navigation link optimized for mobile menus
 */
export function MobileNavLink({
  href,
  label,
  icon: Icon,
  badge,
  className,
  onClick,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavItemActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200',
        'active:scale-95',
        isActive
          ? 'bg-blue-50 text-blue-700 shadow-sm'
          : 'text-gray-700 hover:bg-gray-50',
        className
      )}
    >
      {Icon && (
        <Icon
          className={cn(
            'h-5 w-5',
            isActive ? 'text-blue-600' : 'text-gray-500'
          )}
        />
      )}
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-semibold',
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

/**
 * MobileNavLinkList Component
 * Renders a mobile-optimized list of navigation links
 */
export function MobileNavLinkList({
  items,
  className,
  onItemClick,
}: NavLinkListProps) {
  return (
    <nav className={cn('flex flex-col gap-2', className)}>
      {items.map((item) => (
        <MobileNavLink
          key={item.href}
          href={item.href}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          onClick={onItemClick}
        />
      ))}
    </nav>
  );
}
