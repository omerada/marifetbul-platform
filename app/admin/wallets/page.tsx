/**
 * ================================================
 * ADMIN WALLET MANAGEMENT PAGE
 * ================================================
 * Main page for admin wallet management
 *
 * Route: /admin/wallets
 * Features:
 * - View all user wallets
 * - Search and filter
 * - Manage balances
 * - Freeze/unfreeze wallets
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.1
 */

import { Metadata } from 'next';
import { AdminWalletManagement } from '@/components/admin/wallet';

export const metadata: Metadata = {
  title: 'Cüzdan Yönetimi | Admin - MarifetBul',
  description: 'Kullanıcı cüzdanlarını yönetin',
};

export default function AdminWalletsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cüzdan Yönetimi</h1>
        <p className="mt-2 text-gray-600">
          Tüm kullanıcı cüzdanlarını görüntüleyin ve yönetin
        </p>
      </div>

      <AdminWalletManagement />
    </div>
  );
}
