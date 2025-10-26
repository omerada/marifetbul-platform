/**
 * Package Creation Page
 * Full-page wizard for creating service packages
 */

import { Metadata } from 'next';
import { PackageCreationWizard } from '@/components/packages/create';

export const metadata: Metadata = {
  title: 'Yeni Paket Oluştur | MarifetBul',
  description: 'Hizmet paketinizi oluşturun ve müşterilere sunun',
};

export default function CreatePackagePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Paket Oluştur</h1>
        <p className="mt-2 text-gray-600">
          Hizmetlerinizi paketler halinde sunarak müşterilere net fiyatlandırma
          ve teslimat süreleri belirtin.
        </p>
      </div>

      <PackageCreationWizard />
    </div>
  );
}
