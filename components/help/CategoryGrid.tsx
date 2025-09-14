'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Folder,
  FileText,
  ArrowRight,
  Book,
  Users,
  Settings,
  Shield,
  DollarSign,
  Wrench,
  Building,
  Rocket,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { HelpCategory } from '@/types';

interface CategoryGridProps {
  categories: HelpCategory[];
  showArticleCount?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
  onCategoryClick?: (category: HelpCategory) => void;
}

export function CategoryGrid({
  categories,
  showArticleCount = true,
  variant = 'default',
  onCategoryClick,
}: CategoryGridProps) {
  const router = useRouter();

  const handleCategoryClick = (category: HelpCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      router.push(`/help/categories/${category.slug}`);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return Folder; // Default icon

    const icons: Record<string, React.ElementType> = {
      rocket: Rocket,
      user: Users,
      briefcase: FileText,
      building: Building,
      'credit-card': DollarSign,
      wrench: Wrench,
      shield: Shield,
      book: Book,
      folder: Folder,
      settings: Settings,
    };
    return icons[iconName] || Book;
  };

  const getCategoryColor = (categoryId: string) => {
    const colors: Record<string, { bg: string; icon: string; hover: string }> =
      {
        'getting-started': {
          bg: 'bg-blue-100',
          icon: 'text-blue-600',
          hover: 'group-hover:bg-blue-200',
        },
        'freelancer-guide': {
          bg: 'bg-green-100',
          icon: 'text-green-600',
          hover: 'group-hover:bg-green-200',
        },
        'employer-guide': {
          bg: 'bg-purple-100',
          icon: 'text-purple-600',
          hover: 'group-hover:bg-purple-200',
        },
        'payment-billing': {
          bg: 'bg-yellow-100',
          icon: 'text-yellow-600',
          hover: 'group-hover:bg-yellow-200',
        },
        'technical-support': {
          bg: 'bg-red-100',
          icon: 'text-red-600',
          hover: 'group-hover:bg-red-200',
        },
      };

    return (
      colors[categoryId] || {
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        hover: 'group-hover:bg-gray-200',
      }
    );
  };

  if (variant === 'compact') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const colors = getCategoryColor(category.id);

          return (
            <Card
              key={category.id}
              className="group cursor-pointer p-4 transition-all hover:shadow-md"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} ${colors.hover}`}
                >
                  <Icon className={`h-5 w-5 ${colors.icon}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  {showArticleCount && (
                    <p className="text-sm text-gray-500">
                      {category.articleCount} makale
                    </p>
                  )}
                </div>

                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);
          const colors = getCategoryColor(category.id);

          return (
            <Card
              key={category.id}
              className="group cursor-pointer p-6 transition-all hover:shadow-lg"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="mb-4">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.hover}`}
                >
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
              </div>

              <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                {category.name}
              </h3>

              <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                {showArticleCount && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <FileText className="h-4 w-4" />
                    <span>{category.articleCount} makale</span>
                  </div>
                )}

                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
              </div>

              {/* Subcategories Preview */}
              {category.children && category.children.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex flex-wrap gap-2">
                    {category.children.slice(0, 2).map((child) => (
                      <span
                        key={child.id}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600"
                      >
                        {child.name}
                      </span>
                    ))}
                    {category.children.length > 2 && (
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        +{category.children.length - 2} daha
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const colors = getCategoryColor(category.id);

        return (
          <Card
            key={category.id}
            className="group cursor-pointer p-5 transition-all hover:shadow-lg"
            onClick={() => handleCategoryClick(category)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.hover}`}
              >
                <Icon className={`h-6 w-6 ${colors.icon}`} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600">
                  {category.name}
                </h3>

                <p className="mb-2 line-clamp-2 text-sm text-gray-600">
                  {category.description}
                </p>

                {showArticleCount && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>{category.articleCount} makale</span>
                  </div>
                )}
              </div>

              <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// Category tree component for hierarchical display
interface CategoryTreeProps {
  categories: HelpCategory[];
  level?: number;
  onCategoryClick?: (category: HelpCategory) => void;
}

export function CategoryTree({
  categories,
  level = 0,
  onCategoryClick,
}: CategoryTreeProps) {
  const router = useRouter();

  const handleCategoryClick = (category: HelpCategory) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    } else {
      router.push(`/help/categories/${category.slug}`);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return Folder; // Default icon

    const icons: Record<string, React.ElementType> = {
      rocket: Rocket,
      user: Users,
      briefcase: FileText,
      building: Building,
      'credit-card': DollarSign,
      wrench: Wrench,
      shield: Shield,
      book: Book,
      folder: Folder,
      settings: Settings,
    };
    return icons[iconName] || Book;
  };

  return (
    <div className={level > 0 ? 'ml-6 border-l border-gray-200 pl-4' : ''}>
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);

        return (
          <div key={category.id} className="mb-2">
            <button
              onClick={() => handleCategoryClick(category)}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-50"
            >
              <Icon className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{category.name}</span>
              <span className="ml-auto text-sm text-gray-500">
                {category.articleCount}
              </span>
            </button>

            {category.children && category.children.length > 0 && (
              <CategoryTree
                categories={category.children}
                level={level + 1}
                onCategoryClick={onCategoryClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
