import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'İletişim',
};

export default function ContactPage() {
  redirect('/info/contact');
}
