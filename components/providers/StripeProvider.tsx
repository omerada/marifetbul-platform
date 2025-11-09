'use client';

/**
 * ================================================
 * IYZICO PROVIDER - Iyzico Payment Provider
 * ================================================
 * Wraps components with Iyzico payment context
 * Initializes Iyzico Checkout Form
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import { useEffect, useState } from 'react';

// ================================================
// TYPES
// ================================================

export interface IyzicoProviderProps {
  /**
   * Child components to wrap with Iyzico context
   */
  children: React.ReactNode;
}

// ================================================
// COMPONENT
// ================================================

/**
 * IyzicoProvider Component
 *
 * Provides Iyzico payment context to child components
 * In future, can be expanded to load Iyzico Checkout Form script
 *
 * @example
 * ```tsx
 * <IyzicoProvider>
 *   <PaymentForm />
 * </IyzicoProvider>
 * ```
 */
export const IyzicoProvider: React.FC<IyzicoProviderProps> = ({ children }) => {
  // ==================== STATE ====================

  const [isReady, setIsReady] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    // In future, load Iyzico Checkout Form script here
    // For now, just mark as ready
    setIsReady(true);
  }, []);

  // ==================== RENDER ====================

  // Loading state
  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

IyzicoProvider.displayName = 'IyzicoProvider';

// ================================================
// EXPORTS
// ================================================

export default IyzicoProvider;

/**
 * Hook to check if Iyzico is loaded
 */
export function useIyzicoLoaded(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // For now, always return true
    setLoaded(true);
  }, []);

  return loaded;
}
