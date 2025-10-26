'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SkipToContent - WCAG 2.1 AA compliant skip navigation link
 *
 * Allows keyboard users to bypass navigation and jump directly to main content.
 * Hidden by default, visible on focus.
 *
 * Usage:
 * ```tsx
 * <SkipToContent />
 * <Header />
 * <main id="main-content">
 *   {children}
 * </main>
 * ```
 *
 * @see https://www.w3.org/WAI/WCAG21/Techniques/general/G1
 */
export function SkipToContent() {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');

    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      className={cn(
        // Hidden by default
        'sr-only',
        // Visible on focus
        'focus:not-sr-only',
        // Positioning
        'fixed top-4 left-4 z-50',
        // Styling
        'bg-primary text-primary-foreground',
        'rounded-md px-4 py-2',
        'text-sm font-medium',
        // Focus styles
        'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
        // Transition
        'transition-all duration-200'
      )}
    >
      Skip to main content
    </a>
  );
}

/**
 * SkipLinks - Multiple skip links for complex layouts
 *
 * Provides skip links to multiple landmarks on the page.
 *
 * @param links - Array of skip link configurations
 */
interface SkipLink {
  id: string;
  label: string;
}

interface SkipLinksProps {
  links?: SkipLink[];
}

export function SkipLinks({ links }: SkipLinksProps) {
  const defaultLinks: SkipLink[] = [
    { id: 'main-content', label: 'Skip to main content' },
    { id: 'main-navigation', label: 'Skip to navigation' },
    { id: 'footer', label: 'Skip to footer' },
  ];

  const skipLinks = links || defaultLinks;

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const target = document.getElementById(targetId);

    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav aria-label="Skip links" className="skip-links">
      {skipLinks.map((link) => (
        <a
          key={link.id}
          href={`#${link.id}`}
          onClick={(e) => handleClick(e, link.id)}
          className={cn(
            'sr-only focus:not-sr-only',
            'fixed top-4 left-4 z-50',
            'bg-primary text-primary-foreground',
            'rounded-md px-4 py-2',
            'text-sm font-medium',
            'focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
            'transition-all duration-200'
          )}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

export default SkipToContent;
