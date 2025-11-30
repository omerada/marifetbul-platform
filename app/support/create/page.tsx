'use client';

import { SupportLayout } from '@/components/domains/support';
import { TicketForm } from '@/components/domains/support';
import { Card } from '@/components/ui';

export default function CreateTicketPage() {
  return (
    <SupportLayout showCreateButton={false}>
      <div className="mx-auto max-w-4xl">
        <Card className="p-8">
          <div className="mb-8">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Yeni Destek Talebi Oluştur
            </h2>
            <p className="text-lg text-gray-600">
              Sorunlarınızı detaylı olarak açıklayın, ekip olarak size en kısa
              sürede yardımcı olalım.
            </p>
          </div>

          <TicketForm />
        </Card>
      </div>
    </SupportLayout>
  );
}
