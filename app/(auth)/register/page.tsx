'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui';

const MultiStepRegisterForm = dynamic(
  () =>
    import('@/components/forms').then((mod) => ({
      default: mod.MultiStepRegisterForm,
    })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function RegisterPage() {
  return <MultiStepRegisterForm />;
}
