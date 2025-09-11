import { Suspense } from 'react';
import { MultiStepRegisterForm } from '@/components/forms';
import { Loading } from '@/components/ui';

export default function RegisterPage() {
  return (
    <Suspense fallback={<Loading />}>
      <MultiStepRegisterForm />
    </Suspense>
  );
}
