'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we have registration data
    const registrationData = localStorage.getItem('registrationData');
    if (!registrationData) {
      router.push('/register');
    }
  }, [router]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}');
      
      // First verify the code
      const verifyRes = await fetch('http://localhost:8000/api/auth/register/verify_code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationData.email,
          code: code.trim() // Add trim to remove any whitespace
        }),
      });

      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Invalid verification code');
      }

      // If verification successful, create the account
      const registerRes = await fetch('http://localhost:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const data = await registerRes.json();

      if (registerRes.ok) {
        localStorage.removeItem('registrationData'); // Clean up
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'An error occurred during verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Verify Your Email</h2>
      <p className="mb-4 text-gray-600 text-center">
        Please enter the verification code sent to your email
      </p>

      <form onSubmit={handleVerification} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter verification code"
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  );
}
