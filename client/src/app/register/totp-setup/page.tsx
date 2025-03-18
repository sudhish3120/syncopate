'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const TOTPSchema = Yup.object().shape({
  code: Yup.string()
    .matches(/^\d{6}$/, 'Must be exactly 6 digits')
    .required('Code is required'),
});

export default function TOTPSetup() {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const setupToken = searchParams.get('token');

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/totp/setup/', {
          headers: {
            'Authorization': `Bearer ${setupToken}`,
          },
        });
        
        if (!res.ok) throw new Error('Failed to get QR code');
        
        const data = await res.json();
        setQrUrl(data.qr_url);
      } catch (err) {
        setError('Failed to load QR code');
        console.error(err);
      }
    };

    if (setupToken) {
      fetchQRCode();
    }
  }, [setupToken]);

  const handleVerify = async (values: { code: string }, { setSubmitting, setStatus, resetForm }: any) => {
    try {
      if (!setupToken) {
        throw new Error('No setup token found');
      }

      const res = await fetch('http://localhost:8000/api/auth/totp/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${setupToken}`
        },
        body: JSON.stringify({ code: values.code }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to parse response' }));
        resetForm({ 
          values: { code: '' },
          status: data.error || 'Verification failed'
        });
        return;
      }

      const data = await res.json();
      router.push('/');  // Redirect to login after successful TOTP setup

    } catch (err) {
      console.error('TOTP verification error:', err);
      setStatus(err instanceof Error ? err.message : 'Verification failed');
      resetForm({ values: { code: '' } });
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-8">Set Up Two-Factor Authentication</h1>
      
      {qrUrl && (
        <div className="mb-8">
          <Image src={qrUrl} alt="QR Code" width={200} height={200} />
          <p className="text-sm text-gray-600 mt-2">
            Scan this QR code with your authenticator app
          </p>
        </div>
      )}

      <Formik
        initialValues={{ code: '' }}
        validationSchema={TOTPSchema}
        onSubmit={handleVerify}
      >
        {({ errors, touched, isSubmitting, status }) => (
          <Form className="w-full max-w-xs">
            <div className="mb-4">
              <Field
                type="text"
                name="code"
                placeholder="Enter 6-digit code"
                className="w-full p-2 border rounded"
              />
              {errors.code && touched.code && (
                <div className="text-red-500 text-sm">{errors.code}</div>
              )}
              {status && (
                <div className="text-red-500 text-sm mt-2">{status}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? "Verifying..." : "Verify Code"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
