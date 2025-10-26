/**
 * Package Detail Page
 * Displays detailed package information for seller
 */

import { PackageDetailContainer } from '@/components/packages/detail';

export const metadata = {
  title: 'Paket Detayları | MarifetBul',
  description: 'Paket detaylarını görüntüleyin ve yönetin',
};

export default function PackageDetailPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PackageDetailContainer />
    </div>
  );
}
