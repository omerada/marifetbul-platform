import type { Metadata } from 'next';
import { MarketplaceContainer } from '@/components/packages/public';

export const metadata: Metadata = {
  title: 'Paket Mağazası - MarifetBul',
  description: 'Freelancerların sunduğu hizmet paketlerini keşfedin',
};

export default function MarketplacePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paket Mağazası</h1>
        <p className="mt-2 text-gray-600">
          Profesyonel hizmetler için hazır paketleri keşfedin
        </p>
      </div>
      <MarketplaceContainer />
    </div>
  );
}
