import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Yardım Merkezi',
};

export default function HelpPage() {
  redirect('/support/help');
}
