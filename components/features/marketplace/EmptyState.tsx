'use client';

import { Button } from '@/components/ui/Button';
import { Search, Briefcase, Package } from 'lucide-react';

interface EmptyStateProps {
  mode: 'jobs' | 'packages';
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  mode,
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = mode === 'jobs' ? Briefcase : Package;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-6 rounded-full bg-gray-100 p-6 dark:bg-gray-800">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>

      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mb-6 max-w-md text-gray-600 dark:text-gray-400">
        {description}
      </p>

      {action || (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline">
            <Search className="mr-2 h-4 w-4" />
            Filtreleri Temizle
          </Button>
          <Button>
            {mode === 'jobs' ? 'Tüm İş İlanları' : 'Tüm Hizmet Paketleri'}
          </Button>
        </div>
      )}
    </div>
  );
}
