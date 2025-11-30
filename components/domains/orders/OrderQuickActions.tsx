/**
 * ================================================
 * ORDER DASHBOARD WIDGET
 * ================================================
 * Quick actions widget for order management
 *
 * Features:
 * - New order button (for buyers)
 * - View all orders link
 * - Filter shortcuts
 * - Quick stats
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Order System Enhancement
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Plus, List, Filter, Search } from 'lucide-react';

// ================================================
// TYPES
// ================================================

export interface OrderQuickActionsProps {
  /** User role */
  userRole?: 'buyer' | 'seller';
}

// ================================================
// COMPONENT
// ================================================

export function OrderQuickActions({
  userRole = 'buyer',
}: OrderQuickActionsProps) {
  const router = useRouter();

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-gray-900">Hızlı İşlemler</h3>

      <div className="space-y-3">
        {/* View All Orders */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push('/dashboard/orders')}
        >
          <List className="mr-2 h-4 w-4" />
          Tüm Siparişler
        </Button>

        {/* Active Orders */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push('/dashboard/orders?status=active')}
        >
          <Filter className="mr-2 h-4 w-4" />
          Aktif Siparişler
        </Button>

        {/* Search Orders */}
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => router.push('/dashboard/orders?tab=search')}
        >
          <Search className="mr-2 h-4 w-4" />
          Sipariş Ara
        </Button>

        {/* New Order (for buyers) */}
        {userRole === 'buyer' && (
          <Button
            className="w-full justify-start"
            onClick={() => router.push('/marketplace')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Sipariş Ver
          </Button>
        )}
      </div>
    </Card>
  );
}
