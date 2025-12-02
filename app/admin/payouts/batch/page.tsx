import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import { BatchPayoutManager } from '@/components/domains/admin/finance';

export const metadata: Metadata = {
  title: 'Toplu Para Çekme İşlemleri | Admin Panel',
  description:
    'Bekleyen para çekme taleplerini toplu olarak yönetin ve işleyin',
};

export default async function BatchPayoutsPage() {
  const session = await getServerSession();

  // Auth handled by middleware.ts - admin routes are protected
  // See middleware.ts for role-based access control

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
