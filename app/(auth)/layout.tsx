'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const AuthLayoutWrapper = dynamic(
  () =>
    import('@/components/layout/AuthLayout').then((mod) => ({
      default: mod.AuthLayoutWrapper,
    })),
  { ssr: false }
);

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">MarifetBul</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <AuthLayoutWrapper>{children}</AuthLayoutWrapper>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          © 2025 MarifetBul. Tüm hakları saklıdır.{' '}
          <Link href="/terms" className="text-blue-600 hover:text-blue-500">
            Kullanım Şartları
          </Link>{' '}
          |{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
            Gizlilik Politikası
          </Link>
        </p>
      </div>
    </div>
  );
}
