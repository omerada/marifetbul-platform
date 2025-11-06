import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import BatchPayoutManager from '@/components/admin/payouts/BatchPayoutManager';

export const metadata: Metadata = {
  title: 'Toplu Para Çekme İşlemleri | Admin Panel',
  description:
    'Bekleyen para çekme taleplerini toplu olarak yönetin ve işleyin',
};

export default async function BatchPayoutsPage() {
  const session = await auth();

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Toplu Para Çekme İşlemleri</h1>
        <p className="text-muted-foreground mt-2">
          Bekleyen para çekme taleplerini toplu olarak onaylayıp işleyin
        </p>
      </div>

      <BatchPayoutManager />
    </div>
  );
}
