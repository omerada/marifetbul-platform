import type { Metadata } from 'next';
import { PublicPackageDetailContainer } from '@/components/packages/public';

export const metadata: Metadata = {
  title: 'Paket Detayı - MarifetBul',
};

export default function PublicPackageDetailPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PublicPackageDetailContainer />
    </div>
  );
}
