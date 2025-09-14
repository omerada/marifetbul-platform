'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui';

const LoginForm = dynamic(
  () =>
    import('@/components/forms').then((mod) => ({ default: mod.LoginForm })),
  {
    ssr: false,
    loading: () => <Loading />,
  }
);

export default function LoginPage() {
  return <LoginForm />;
}
