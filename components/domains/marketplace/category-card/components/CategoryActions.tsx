/**
 * CategoryActions Component
 *
 * Action buttons for viewing services and creating jobs
 */

import Link from 'next/link';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui';
import type { CategoryActionsProps } from '../types/categoryCardTypes';

export function CategoryActions({
  categorySlug,
  variant,
}: CategoryActionsProps) {
  // Compact variant - icon only
  if (variant === 'compact') {
    return (
      <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
    );
  }

  // Featured variant - both buttons with icon
  if (variant === 'featured') {
    return (
      <div className="flex gap-2">
        <Link
          href={`/marketplace/categories/${categorySlug}`}
          className="flex-1"
        >
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:border-blue-300"
          >
            Hizmetleri Gör
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
        <Link href="/marketplace/jobs/create" className="flex-1">
          <Button size="sm" className="w-full">
            İş Ver
          </Button>
        </Link>
      </div>
    );
  }

  // Detailed variant - explore button + create job
  if (variant === 'detailed') {
    return (
      <div className="flex gap-2">
        <Link
          href={`/marketplace/categories/${categorySlug}`}
          className="flex-1"
        >
          <Button variant="outline" size="sm" className="w-full">
            Kategoriyi İncele
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/marketplace/jobs/create">
          <Button size="sm">İş Ver</Button>
        </Link>
      </div>
    );
  }

  // Default variant - standard buttons
  return (
    <div className="flex gap-2 pt-4">
      <Link href={`/marketplace/categories/${categorySlug}`} className="flex-1">
        <Button variant="outline" size="sm" className="w-full">
          Hizmetleri Görüntüle
        </Button>
      </Link>
      <Link href="/marketplace/jobs/create">
        <Button size="sm">İş Ver</Button>
      </Link>
    </div>
  );
}
