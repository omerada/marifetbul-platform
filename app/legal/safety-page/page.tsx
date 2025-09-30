import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Güvenlik',
};

export default function SafetyPage() {
  redirect('/legal/safety');
}
