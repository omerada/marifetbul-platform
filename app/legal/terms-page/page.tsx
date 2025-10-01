import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
};

export default function TermsPage() {
  redirect('/legal/terms');
}
