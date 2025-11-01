/**
 * ================================================
 * PAYMENT TEST PAGE - Iyzico Integration Test
 * ================================================
 * Development page for testing payment modal
 * Only accessible in development environment
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState, useEffect } from 'react';
import { PaymentModal } from '@/components/shared/PaymentModal';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/shared/utils/logger';
import { useRouter } from 'next/navigation';

export default function PaymentTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Redirect to home in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Attempted to access test page in production');
      router.push('/');
    }
  }, [router]);

  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      {/* Development Warning Banner */}
      <div className="mx-auto mb-6 max-w-2xl rounded-lg border-2 border-yellow-500 bg-yellow-50 p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <p className="font-semibold text-yellow-900">Development Mode Only</p>
        </div>
        <p className="mt-2 text-sm text-yellow-800">
          This test page is only accessible in development environment.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Payment Modal Test
          </h1>
          <p className="text-gray-600">
            Test Iyzico payment integration with test cards
          </p>
        </div>

        {/* Test Cards Info */}
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">
            Iyzico Test Cards
          </h2>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="rounded-lg bg-white p-3">
              <p className="mb-1 font-medium">Successful Payment:</p>
              <code className="text-xs">4242 4242 4242 4242</code>
              <p className="mt-1 text-xs">
                Exp: Any future date, CVV: Any 3 digits
              </p>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="mb-1 font-medium">Card Declined:</p>
              <code className="text-xs">4000 0000 0000 0002</code>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="mb-1 font-medium">Insufficient Funds:</p>
              <code className="text-xs">4000 0000 0000 9995</code>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-3 rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <CreditCard className="h-6 w-6" />
            Open Payment Modal
          </button>
        </div>

        {/* Environment Info */}
        <div className="mt-8 rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
          <p>
            <strong>Environment:</strong> {process.env.NODE_ENV}
          </p>
          <p className="mt-1">
            <strong>Iyzico Key:</strong>{' '}
            {process.env.NEXT_PUBLIC_IYZICO_API_KEY
              ? '✓ Configured'
              : '✗ Missing'}
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        orderId="test-order-12345"
        amount={500}
        description="Logo Tasarımı - Test Siparişi"
        onSuccess={(paymentId) => {
          logger.info('Test payment successful', { paymentId });
          alert(`Payment successful! ID: ${paymentId}`);
        }}
        onError={(error) => {
          logger.error('Test payment error', { error });
          alert(`Payment error: ${error}`);
        }}
      />
    </div>
  );
}
