/**
 * Freelancer Packages List Page
 * Displays seller's packages with management actions
 */

import { PackageListContainer } from '@/components/packages/list';

export const metadata = {
  title: 'Paketlerim | MarifetBul',
  description: 'Hizmet paketlerinizi görüntüleyin ve yönetin',
};

export default function PackagesPage() {
  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PackageListContainer />
    </div>
  );
}
