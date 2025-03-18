'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('registerEmail');
    if (!email) {
      router.push('/email-verify');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-black relative pt-20">
      <main className="container mx-auto py-8 px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">2. Check Your Email</h2>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent a verification link to your email address. 
              Please check your inbox and click the link to continue.
            </p>
            <div className="animate-pulse text-sm text-gray-500 mt-4">
              Waiting for verification...
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Didn't receive the email? Check your spam folder or{' '}
              <button 
                onClick={() => router.push('/email-verify')}
                className="text-blue-500 hover:text-blue-600"
              >
                try again
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
