import { Suspense } from 'react';
import { LoginForm } from '@/components/forms';
import { Loading } from '@/components/ui';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-lg font-bold text-white">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Marifeto</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<Loading />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
