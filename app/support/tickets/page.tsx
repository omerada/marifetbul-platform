'use client';

import { SupportLayout } from '@/components/features/support';
import { TicketList } from '@/components/features/support';
import { Card } from '@/components/ui/Card';

export default function TicketsPage() {
  return (
    <SupportLayout showCreateButton={true}>
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Destek Taleplerim
          </h2>
          <p className="text-gray-600">
            Oluşturduğunuz tüm destek taleplerini burada görüntüleyebilir, durum
            takibi yapabilirsiniz.
          </p>
        </Card>

        <TicketList />
      </div>
    </SupportLayout>
  );
}
