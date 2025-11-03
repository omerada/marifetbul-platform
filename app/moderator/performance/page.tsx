'use client';

import { ModeratorPerformanceCharts } from '@/components/domains/moderator';

export default function ModeratorPerformancePage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Performans Analitik</h1>
        <p className="text-muted-foreground">
          Moderasyon performansınızın detaylı analizi ve trend grafikler.
        </p>
      </div>

      <ModeratorPerformanceCharts days={30} />
    </div>
  );
}
