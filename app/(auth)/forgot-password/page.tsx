'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui';

const ForgotPasswordForm = dynamic(
  () =>
    import('@/components/forms').then((mod) => ({
      default: mod.ForgotPasswordForm,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
