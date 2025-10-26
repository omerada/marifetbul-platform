/**
 * ================================================
 * STRIPE PROVIDER - Stripe Elements Provider
 * ================================================
 * Wraps components with Stripe Elements context
 * Initializes Stripe.js with publishable key
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';

// ================================================
// TYPES
// ================================================

export interface StripeProviderProps {
  /**
   * Child components to wrap with Stripe context
   */
  children: React.ReactNode;

  /**
   * Override publishable key (optional)
   * If not provided, uses NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   */
  publishableKey?: string;

  /**
   * Stripe Elements appearance options
   */
  appearance?: {
    theme?: 'stripe' | 'night' | 'flat';
    variables?: Record<string, string>;
  };

  /**
   * Stripe Elements fonts
   */
  fonts?: Array<{
    cssSrc: string;
  }>;
}

// ================================================
// STRIPE INITIALIZATION
// ================================================

/**
 * Get Stripe publishable key from environment
 */
function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!key) {
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
    throw new Error('Stripe publishable key is required');
  }

  return key;
}

/**
 * Initialize Stripe instance (singleton)
 */
let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(publishableKey?: string): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = publishableKey || getStripePublishableKey();
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}

// ================================================
// COMPONENT
// ================================================

/**
 * StripeProvider Component
 *
 * Provides Stripe Elements context to child components
 *
 * @example
 * ```tsx
 * <StripeProvider>
 *   <PaymentForm />
 * </StripeProvider>
 * ```
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({
  children,
  publishableKey,
  appearance,
  fonts,
}) => {
  // ==================== STATE ====================

  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const stripeInstance = await getStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to initialize Stripe';
        setError(errorMessage);
        console.error('Stripe initialization error:', err);
      }
    };

    initializeStripe();
  }, [publishableKey]);

  // ==================== RENDER ====================

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm font-medium text-red-900">
          Ödeme sistemi yüklenemedi
        </p>
        <p className="mt-1 text-xs text-red-700">{error}</p>
      </div>
    );
  }

  // Loading state
  if (!stripe) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  // Default appearance options
  const defaultAppearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0066ff',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
      ...appearance?.variables,
    },
  };

  // Elements options
  const options = {
    appearance: appearance || defaultAppearance,
    fonts: fonts || [],
  };

  return (
    <Elements stripe={stripe} options={options}>
      {children}
    </Elements>
  );
};

StripeProvider.displayName = 'StripeProvider';

// ================================================
// EXPORTS
// ================================================

export default StripeProvider;

/**
 * Hook to check if Stripe is loaded
 */
export function useStripeLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getStripe().then((stripe) => {
      setLoaded(!!stripe);
    });
  }, []);

  return loaded;
}
