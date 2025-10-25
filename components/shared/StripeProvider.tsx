/**
 * ================================================
 * STRIPE PROVIDER WRAPPER
 * ================================================
 * Stripe Elements provider component
 *
 * Features:
 * - Initialize Stripe with publishable key
 * - Provide Stripe Elements context
 * - Configure Elements appearance
 * - Error handling for Stripe loading
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

/**
 * Stripe Provider Component
 * Wraps components that need Stripe Elements
 */
export function StripeProvider({
  children,
  clientSecret,
}: StripeProviderProps) {
  // Elements appearance configuration
  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#ffffff',
      colorText: '#1e293b',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        marginBottom: '8px',
      },
      '.Input': {
        padding: '12px',
        fontSize: '16px',
        border: '1px solid #e2e8f0',
      },
      '.Input:focus': {
        border: '1px solid #6366f1',
        boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)',
      },
      '.Error': {
        fontSize: '14px',
        marginTop: '4px',
      },
    },
  };

  // Elements options
  const options = {
    clientSecret,
    appearance,
    locale: 'tr' as const,
  };

  return (
    <Elements
      stripe={stripePromise}
      options={clientSecret ? options : { appearance, locale: 'tr' as const }}
    >
      {children}
    </Elements>
  );
}

export default StripeProvider;
