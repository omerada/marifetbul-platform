import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Nasıl Çalışır',
};

export default function HowItWorksPage() {
  redirect('/info/how-it-works');
}
