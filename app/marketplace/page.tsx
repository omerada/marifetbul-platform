import { AppLayout } from '@/components/layout';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';

export default function MarketplacePage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <MarketplaceList />
        </div>
      </div>
    </AppLayout>
  );
}
