/**
 * Email Verification Page
 * Route: /verify-email?token=xxx
 *
 * Handles email verification with token from URL
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { EmailVerificationPage } from '@/components/domains/auth';

export const metadata: Metadata = {
  title: 'E-posta Doğrulama | MarifetBul',
  description: 'E-posta adresinizi doğrulayın',
  robots: 'noindex, nofollow',
};

/**
 * Wrapper component for Suspense boundary
 */
function VerificationPageContent() {
  return (
    <EmailVerificationPage
      redirectUrl="/dashboard"
      showCountdown={true}
      redirectDelay={5}
    />
  );
}

/**
 * Main page component
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      }
    >
      <VerificationPageContent />
    </Suspense>
  );
}
