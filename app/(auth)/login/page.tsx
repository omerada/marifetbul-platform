import { Suspense } from 'react';
import { LoginForm } from '@/components/forms';
import { Loading } from '@/components/ui';

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginForm />
    </Suspense>
  );
}
