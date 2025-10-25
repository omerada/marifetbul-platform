'use client';

import React from 'react';
import { AnalyticsDashboard } from '@/components/domains/analytics';

export default function EmployerAnalyticsPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          İşveren İstatistikleri
        </h1>
        <p className="mt-1 text-gray-600">
          İşe alım süreçlerinizi ve harcamalarınızı analiz edin
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
