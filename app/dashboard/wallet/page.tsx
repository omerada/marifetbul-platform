/**
 * ================================================
 * WALLET DASHBOARD PAGE - Role-based Routing
 * ================================================
 * Main wallet page that redirects based on user role
 * - FREELANCER → /dashboard/freelancer/wallet
 * - EMPLOYER → Access denied (employers don't have wallets)
 * - ADMIN → /admin/wallets
 *
 * Sprint Day 1 - Task 4: Wallet Page Routing Fix
 * @version 1.0.0
 */

'use client';

import { useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Loading } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { AlertCircle, Wallet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      switch (user.role) {
        case 'FREELANCER':
          redirect('/dashboard/freelancer/wallet');
          break;
        case 'ADMIN':
          redirect('/admin/wallets');
          break;
        case 'EMPLOYER':
          // Employers don't have wallet access - show error below
          break;
        default:
          redirect('/dashboard');
      }
    } else if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  // Show loading during auth check
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  // Show error for employers
  if (user?.role === 'EMPLOYER') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="border-orange-200 bg-orange-50 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-orange-100 p-4">
              <Wallet className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Cüzdan Erişimi
            </h2>
            <div className="mb-4 flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              <p>İşveren hesapları için cüzdan özelliği bulunmamaktadır.</p>
            </div>
            <p className="mb-6 text-gray-600">
              Cüzdan özellikleri sadece freelancer hesapları için aktiftir.
              Ödemelerinizi sipariş detaylarından takip edebilirsiniz.
            </p>
            <button
              onClick={() => redirect('/dashboard')}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Dashboard&apos;a Dön
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback loading (should not reach here due to redirects)
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
