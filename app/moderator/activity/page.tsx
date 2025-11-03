'use client';

import { ModeratorActivityTimeline } from '@/components/domains/moderator';

export default function ModeratorActivityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Aktivite Geçmişi</h1>
        <p className="text-muted-foreground">
          Yaptığınız tüm moderasyon işlemlerinin kronolojik listesi.
        </p>
      </div>

      <ModeratorActivityTimeline limit={100} />
    </div>
  );
}
