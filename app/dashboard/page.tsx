import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // For now, redirect to freelancer dashboard by default
  redirect('/dashboard/freelancer');
}