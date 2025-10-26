'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Client-side only component for safe HTML rendering
const SafeHtml = dynamic(
  () =>
    import('@/lib/infrastructure/security/xss-protection').then((mod) => ({
      default: mod.SafeHtml,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="prose max-w-none">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    ),
  }
);

interface SafeBlogContentProps {
  html: string;
  className?: string;
}

/**
 * Safe blog content renderer - Client Component
 *
 * Renders blog HTML content with XSS protection.
 * Uses dynamic import to avoid SSR issues with DOMPurify.
 */
export function SafeBlogContent({ html, className }: SafeBlogContentProps) {
  return (
    <SafeHtml
      html={html}
      config="RICH"
      className={className || 'prose max-w-none'}
    />
  );
}
