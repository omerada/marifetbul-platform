'use client';

import { SupportLayout } from '@/components/domains/support';
import { TicketForm } from '@/components/domains/support';
import { useSupport } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import type { CreateTicketFormData } from '@/lib/core/validations/support';

export default function CreateTicketPage() {
  const router = useRouter();
  const { createTicket, createTicketLoading } = useSupport();

  const handleSubmit = async (data: CreateTicketFormData) => {
    try {
      const result = await createTicket(data);
      if (result.success && result.ticketId) {
        router.push(`/support/ticket/${result.ticketId}`);
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

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

          <TicketForm onSubmit={handleSubmit} isLoading={createTicketLoading} />
        </Card>
      </div>
    </SupportLayout>
  );
}
