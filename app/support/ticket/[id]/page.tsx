'use client';

import { SupportLayout } from '@/components/domains/support';
import { TicketDetail } from '@/components/domains/support';
import { useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  return (
    <SupportLayout showCreateButton={true}>
      <TicketDetail ticketId={ticketId} />
    </SupportLayout>
  );
}
