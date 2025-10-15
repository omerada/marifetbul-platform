/**
 * BulkActions Component
 *
 * Displays bulk action controls when users are selected
 */

'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Users, UserCheck, UserX, X } from 'lucide-react';
import { BulkActionsProps } from '../types/userTableTypes';

export function BulkActions({
  selectedCount,
  onAction,
  onClear,
}: BulkActionsProps) {
  return (
    <Card className="bg-blue-50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex flex-col items-start justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
          {/* Selected Count Info */}
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 px-3 py-1 font-semibold text-blue-800">
                  {selectedCount} seçili
                </Badge>
                <span className="text-sm font-medium text-blue-900">
                  Toplu işlemler mevcut
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-700">
                Seçili tüm kullanıcılara uygulanacak bir işlem seçin
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('activate')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Aktifleştir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('suspend')}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <UserX className="mr-2 h-4 w-4" />
              Askıya Al
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:bg-gray-100"
            >
              <X className="mr-2 h-4 w-4" />
              Temizle
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
