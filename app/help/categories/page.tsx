'use client';

import { HelpCenterLayout } from '@/components/help';
import { CategoryGrid } from '@/components/help';
import { useHelpCenter } from '@/hooks';
import { useEffect } from 'react';

export default function CategoriesPage() {
  const { categories, fetchCategories } = useHelpCenter();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const mainCategories = categories.filter((cat) => !cat.parentId);

  return (
    <HelpCenterLayout title="Yardım Kategorileri">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            Yardım Kategorileri
          </h1>
          <p className="text-lg text-gray-600">
            İhtiyacınıza uygun konuyu seçerek detaylı rehberlere ulaşın
          </p>
        </div>

        <CategoryGrid
          categories={mainCategories}
          variant="detailed"
          showArticleCount={true}
        />
      </div>
    </HelpCenterLayout>
  );
}
