/**
 * ================================================
 * PAYMENT TEST PAGE - Stripe Integration Test
 * ================================================
 * Development page for testing payment modal
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { useState } from 'react';
import { PaymentModal } from '@/components/shared/PaymentModal';
import { CreditCard } from 'lucide-react';

export default function PaymentTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Payment Modal Test
          </h1>
          <p className="text-gray-600">
            Test Stripe payment integration with test cards
          </p>
        </div>

        {/* Test Cards Info */}
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-blue-900">
            Stripe Test Cards
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
            <strong>Stripe Key:</strong>{' '}
            {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
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
          console.log('Payment successful:', paymentId);
          alert(`Payment successful! ID: ${paymentId}`);
        }}
        onError={(error) => {
          console.error('Payment error:', error);
          alert(`Payment error: ${error}`);
        }}
      />
    </div>
  );
}
