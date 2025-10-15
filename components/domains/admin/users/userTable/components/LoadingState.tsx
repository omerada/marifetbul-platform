/**
 * LoadingState Component
 *
 * Loading spinner for table
 */

'use client';

import React from 'react';
import { Users } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-900">
          Kullanıcılar yükleniyor...
        </p>
        <p className="text-sm text-gray-500">
          Lütfen veriler alınırken bekleyin
        </p>
      </div>
    </div>
  );
}
