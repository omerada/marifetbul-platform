/**
 * CategoryBreakdown Component
 *
 * Card displaying category breakdown with progress bars
 */

import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import type { CategoryBreakdownProps } from '../types/moderationDashboardTypes';

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5" />
          Kategori Dağılımı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {category.category}
              </span>
              <span className="text-gray-600">{category.count}</span>
            </div>
            <Progress value={category.percentage} className="h-2" />
            <div className="text-right text-xs text-gray-500">
              {category.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
