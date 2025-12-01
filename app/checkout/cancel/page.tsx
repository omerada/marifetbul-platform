/**
 * ================================================
 * CHECKOUT CANCEL PAGE
 * ================================================
 * Payment cancellation page
 *
 * Features:
 * - Cancellation message
 * - Retry option
 * - Return to package
 *
 * Route: /checkout/cancel
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

export const dynamic = 'force-dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { Loading } from '@/components/ui';

function CheckoutCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const packageId = searchParams.get('packageId');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl">
          {/* Cancel Icon */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-12 w-12 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Ã–deme Ä°ptal Edildi
            </h1>
            <p className="text-gray-600">Ã–deme iÅŸleminiz tamamlanmadÄ±</p>
          </div>

          {/* Info Card */}
          <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Ne Oldu?
            </h2>
            <p className="mb-4 text-gray-600">
              Ã–deme iÅŸlemini iptal ettiniz veya bir hata oluÅŸtu.
              EndiÅŸelenmeyin, kartÄ±nÄ±zdan herhangi bir Ã¼cret Ã§ekilmedi.
            </p>

            {orderId && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-sm text-gray-600">
                  SipariÅŸ ID:{' '}
                  <span className="font-mono text-xs">{orderId}</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Bu sipariÅŸ otomatik olarak iptal edilecektir
                </p>
              </div>
            )}
          </div>

          {/* Common Reasons */}
          <div className="mb-6 rounded-lg bg-blue-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-blue-900">
              SÄ±k KarÅŸÄ±laÅŸÄ±lan Sorunlar
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">â€¢</span>
                <span>Kart bilgileri hatalÄ± girildi</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">â€¢</span>
                <span>KartÄ±nÄ±zda yeterli bakiye bulunmuyor</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">â€¢</span>
                <span>BankanÄ±z iÅŸlemi reddetti</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">â€¢</span>
                <span>Ä°nternet baÄŸlantÄ±sÄ± kesildi</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {packageId ? (
              <Link
                href={`/checkout/${packageId}`}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Tekrar Dene
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="rounded-lg bg-indigo-600 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Tekrar Dene
              </button>
            )}
            <Link
              href="/marketplace"
              className="rounded-lg border-2 border-gray-300 px-6 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Marketplace&apos;e DÃ¶n
            </Link>
          </div>

          {/* Help Section */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-sm text-gray-600">
              YardÄ±ma mÄ± ihtiyacÄ±nÄ±z var?{' '}
              <Link
                href="/support"
                className="font-medium text-indigo-600 hover:underline"
              >
                Destek ekibimizle iletiÅŸime geÃ§in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="animate-pulse">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gray-200"></div>
                <div className="mb-2 h-8 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}
