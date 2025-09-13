'use client';

import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { HelpCenterMain } from '@/components/help/HelpCenterMain';

export const metadata: Metadata = {
  title: 'Yardım Merkezi - Marifeto',
  description:
    'Marifeto platformu için kapsamlı yardım merkezi, rehberler ve destek sistemi.',
};

export default function HelpPage() {
  return (
    <AppLayout>
      <HelpCenterMain />
    </AppLayout>
  );
}
