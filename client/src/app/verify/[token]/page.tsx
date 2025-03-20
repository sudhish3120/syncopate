'use client';
import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyToken({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/auth/verify-token/${token}/`,
          { 
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          localStorage.setItem('registerEmail', data.email);
          router.push('/register?verified=true');
        } else {
          const errorMessage = data.error || 'Verification failed';
          router.push(`/email-verify?error=${encodeURIComponent(errorMessage)}`);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        router.push('/email-verify?error=verification-failed');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-black relative pt-20">
      <div className="container mx-auto py-8 px-8">
        <div className="flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Verifying your email...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
