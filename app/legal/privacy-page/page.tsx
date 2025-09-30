import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
};

export default function PrivacyPage() {
  redirect('/legal/privacy');
}
