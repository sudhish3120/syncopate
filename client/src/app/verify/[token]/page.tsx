'use client';
import React, { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from "../../../../node_modules/@mui/material/index";

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
    <div className="min-h-screen bg-gradient-to-l from-purple-800 to-yellow-700 h-screen flex">
      <div className="max-w-xl text-center p-20 bg-stone-700 m-auto rounded-3xl">
        <Typography variant="h3" className="tracking-[-1px]" marginBottom={3}>
          verifying email...
        </Typography>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    </div>
  );
}

