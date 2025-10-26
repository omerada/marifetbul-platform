/**
 * Package Edit Page
 * Allows seller to edit existing package
 */

import { PackageEditContainer } from '@/components/packages/edit';

export const metadata = {
  title: 'Paketi Düzenle | MarifetBul',
  description: 'Hizmet paketinizi düzenleyin',
};

export default function PackageEditPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PackageEditContainer />
    </div>
  );
}
