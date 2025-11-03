'use client';

import { ModeratorDashboardOverview } from '@/components/domains/moderator';

export default function ModeratorDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Moderasyon Paneli</h1>
        <p className="text-muted-foreground">
          Tüm moderasyon işlemlerinin genel görünümü ve öncelikli işlemler.
        </p>
      </div>

      <ModeratorDashboardOverview />
    </div>
  );
}
