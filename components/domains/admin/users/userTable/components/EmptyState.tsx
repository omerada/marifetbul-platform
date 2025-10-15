/**
 * EmptyState Component
 *
 * Display when no users match filters or table is empty
 */

'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { EmptyStateProps } from '../types/userTableTypes';

export function EmptyState({ hasFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <Users className="h-8 w-8 text-gray-400" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">
          {hasFilters ? 'Kullanıcı bulunamadı' : 'Henüz kullanıcı yok'}
        </p>
        <p className="text-sm text-gray-500">
          {hasFilters
            ? 'Arama veya filtre kriterlerinizi ayarlamayı deneyin'
            : 'Kullanıcılar eklendiğinde burada görünecekler'}
        </p>
      </div>
    </div>
  );
}
