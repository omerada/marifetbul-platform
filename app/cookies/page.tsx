import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
};

export default function CookiesPage() {
  redirect('/legal/cookies');
}
