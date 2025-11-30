/**
 * ModerationItemsList Component
 *
 * List of moderation items with empty state
 */

import { Shield, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { ModerationItemCard } from './ModerationItemCard';
import type { ModerationItemsListProps } from '../types/moderationDashboardTypes';

export function ModerationItemsList({
  items,
  onItemAction,
}: ModerationItemsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Denetim Listesi ({items.length})
        </h2>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filtrele
        </Button>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Denetim öğesi bulunamadı
            </h3>
            <p className="text-gray-600">
              Seçilen filtrelere uygun denetim öğesi bulunmuyor.
            </p>
          </CardContent>
        </Card>
      ) : (
        items.map((item) => (
          <ModerationItemCard
            key={item.id}
            item={item}
            onAction={onItemAction}
          />
        ))
      )}
    </div>
  );
}
