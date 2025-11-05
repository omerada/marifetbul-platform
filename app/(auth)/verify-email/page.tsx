import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

import { Loading } from '@/components/ui';

const VerifyEmailForm = dynamic(
  () =>
    import('@/components/forms').then((mod) => ({
      default: mod.VerifyEmailForm,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export const metadata: Metadata = {
  title: 'E-posta Doğrulama | MarifetBul',
  description:
    'E-posta adresinizi doğrulayın ve tüm özelliklere erişim sağlayın.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <VerifyEmailForm />
    </div>
  );
}
