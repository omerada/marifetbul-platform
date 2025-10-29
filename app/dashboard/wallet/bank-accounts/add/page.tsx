/**
 * ================================================
 * ADD BANK ACCOUNT PAGE
 * ================================================
 * Standalone page for adding a new bank account
 * Supports return URL for redirecting after successful addition
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 4 Story 4.3
 */

'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AddBankAccountModal } from '@/components/dashboard/freelancer/wallet';

// ================================================
// MAIN COMPONENT (wrapped in Suspense)
// ================================================

function AddBankAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams?.get('returnUrl') || '/dashboard/wallet';

  const handleSuccess = () => {
    // Redirect to return URL after successful addition
    router.push(returnUrl);
  };

  const handleCancel = () => {
    // Go back to return URL or default wallet page
    router.push(returnUrl);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <Building2 className="h-8 w-8 text-blue-600" />
            Banka Hesabı Ekle
          </h1>
        </div>
        <p className="ml-14 text-gray-600">
          Para çekme işlemleri için yeni banka hesabı ekleyin
        </p>
      </div>

      {/* Add Bank Account Card */}
      <Card>
        <CardHeader>
          <CardTitle>Banka Hesap Bilgileri</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Use existing AddBankAccountModal component */}
          {/* We'll render it as open by default and handle close */}
          <AddBankAccountModal
            isOpen={true}
            onClose={handleCancel}
            onSuccess={handleSuccess}
          />
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 border-blue-100 bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <p className="text-blue-900">
                Banka hesap bilgileriniz güvenli bir şekilde şifrelenir ve
                saklanır
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <p className="text-blue-900">
                IBAN numaranızın size ait olduğundan emin olun
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" />
              <p className="text-blue-900">
                Eklediğiniz hesabı para çekme işlemlerinde kullanabilirsiniz
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================================================
// PAGE COMPONENT (with Suspense wrapper)
// ================================================

export default function AddBankAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <div className="animate-pulse">
            <div className="mb-6 h-12 w-64 rounded bg-gray-200" />
            <div className="h-96 rounded-lg bg-gray-100" />
          </div>
        </div>
      }
    >
      <AddBankAccountContent />
    </Suspense>
  );
}
