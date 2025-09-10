import { AppLayout } from '@/components/layout';
import { MarketplaceList } from '@/components/marketplace/MarketplaceList';
import { MobileMarketplace } from '@/components/features/MobileMarketplace';

export default function MarketplacePage() {
  return (
    <AppLayout>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <MarketplaceList />
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden">
        <MobileMarketplace />
      </div>
    </AppLayout>
  );
}
