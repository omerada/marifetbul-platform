'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui';

const ResetPasswordForm = dynamic(
  () =>
    import('@/components/forms').then((mod) => ({
      default: mod.ResetPasswordForm,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
