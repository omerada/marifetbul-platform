'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  FileText,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
} from 'lucide-react';
import { useHelpCenter } from '@/hooks/useHelpCenter';
import { cn } from '@/lib/utils';
import type { HelpCategory } from '@/types';

interface CategoryGridProps {
  categories?: HelpCategory[];
  showStats?: boolean;
  maxVisible?: number;
  className?: string;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories: propCategories,
  showStats = true,
  maxVisible,
  className,
}) => {
  const router = useRouter();
  const {
    categories: storeCategories,
    categoriesLoading,
    fetchCategories,
  } = useHelpCenter();

  const categories = propCategories || storeCategories;
  const displayCategories = maxVisible
    ? categories.slice(0, maxVisible)
    : categories;

  React.useEffect(() => {
    if (!propCategories && categories.length === 0 && !categoriesLoading) {
      fetchCategories();
    }
  }, [propCategories, categories.length, categoriesLoading, fetchCategories]);

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<{ className?: string }>
    > = {
      'file-text': FileText,
      users: Users,
      'trending-up': TrendingUp,
      clock: Clock,
      'book-open': BookOpen,
      default: BookOpen,
    };

    return iconMap[iconName] || iconMap.default;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-blue-50 text-blue-700 border-blue-200',
      'bg-green-50 text-green-700 border-green-200',
      'bg-purple-50 text-purple-700 border-purple-200',
      'bg-orange-50 text-orange-700 border-orange-200',
      'bg-pink-50 text-pink-700 border-pink-200',
      'bg-indigo-50 text-indigo-700 border-indigo-200',
    ];
    return colors[index % colors.length];
  };

  if (categoriesLoading && categories.length === 0) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
                <div className="flex-1">
                  <div className="mb-2 h-5 rounded bg-gray-200"></div>
                  <div className="h-4 w-3/4 rounded bg-gray-100"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 rounded bg-gray-100"></div>
                <div className="h-4 w-2/3 rounded bg-gray-100"></div>
              </div>
              {showStats && (
                <div className="mt-4 flex justify-between border-t border-gray-100 pt-4">
                  <div className="h-4 w-16 rounded bg-gray-100"></div>
                  <div className="h-4 w-20 rounded bg-gray-100"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Henüz kategori bulunmuyor
        </h3>
        <p className="text-gray-500">
          Yardım kategorileri hazırlanıyor. Lütfen daha sonra tekrar kontrol
          edin.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {displayCategories.map((category, index) => {
        const IconComponent = getCategoryIcon(category.icon || 'default');
        const colorClass = getCategoryColor(index);

        return (
          <button
            key={category.id}
            onClick={() => router.push(`/help/category/${category.slug}`)}
            className="group rounded-xl border border-gray-200 bg-white p-6 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-lg"
          >
            {/* Header */}
            <div className="mb-4 flex items-center gap-4">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-lg border',
                  colorClass
                )}
              >
                <IconComponent className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="truncate text-sm text-gray-500">
                  {category.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 transition-colors group-hover:text-blue-600" />
            </div>

            {/* Description */}
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">
              {category.description}
            </p>

            {/* Stats */}
            {showStats && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>{category.articleCount || 0} makale</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Kategori</span>
                </div>
              </div>
            )}
          </button>
        );
      })}

      {/* Show More Card */}
      {maxVisible && categories.length > maxVisible && (
        <button
          onClick={() => router.push('/help/categories')}
          className="group flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center transition-all duration-200 hover:border-gray-300 hover:bg-gray-100"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 transition-colors group-hover:bg-gray-300">
            <ChevronRight className="h-6 w-6 text-gray-500" />
          </div>
          <h3 className="mb-2 font-semibold text-gray-700">
            Tüm Kategorileri Gör
          </h3>
          <p className="text-sm text-gray-500">
            {categories.length - maxVisible} kategori daha
          </p>
        </button>
      )}
    </div>
  );
};

export default CategoryGrid;
