import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular',
};

export default function FaqPage() {
  redirect('/info/faq');
}
