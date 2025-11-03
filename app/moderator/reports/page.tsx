'use client';

import { ModeratorReportQueue } from '@/components/domains/moderator';

export default function ModeratorReportsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Rapor Yönetimi</h1>
        <p className="text-muted-foreground">
          Kullanıcı raporlarını inceleyin, çözün veya reddedin.
        </p>
      </div>

      <ModeratorReportQueue />
    </div>
  );
}
