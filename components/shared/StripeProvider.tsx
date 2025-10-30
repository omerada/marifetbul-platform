/**
 * ================================================
 * IYZICO PROVIDER WRAPPER
 * ================================================
 * Iyzico payment context provider component
 *
 * Features:
 * - Initialize Iyzico configuration
 * - Provide payment context
 * - Error handling for payment processing
 * - Localization support
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

'use client';

import React, { ReactNode, createContext, useContext } from 'react';

interface IyzicoConfig {
  apiKey: string;
  locale: 'tr' | 'en';
  baseUrl: string;
}

interface IyzicoContextType {
  config: IyzicoConfig;
  isReady: boolean;
}

const IyzicoContext = createContext<IyzicoContextType | undefined>(undefined);

interface IyzicoProviderProps {
  children: ReactNode;
}

/**
 * Iyzico Provider Component
 * Provides Iyzico configuration to child components
 */
export function IyzicoProvider({ children }: IyzicoProviderProps) {
  const config: IyzicoConfig = {
    apiKey: process.env.NEXT_PUBLIC_IYZICO_API_KEY || '',
    locale: 'tr',
    baseUrl: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com',
  };

  const isReady = Boolean(config.apiKey);

  return (
    <IyzicoContext.Provider value={{ config, isReady }}>
      {children}
    </IyzicoContext.Provider>
  );
}

/**
 * Hook to use Iyzico context
 */
export function useIyzico() {
  const context = useContext(IyzicoContext);
  if (context === undefined) {
    throw new Error('useIyzico must be used within IyzicoProvider');
  }
  return context;
}

export default IyzicoProvider;
