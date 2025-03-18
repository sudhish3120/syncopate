'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";

const EmailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(
      /@uwaterloo.ca$/,
      "Must be a UWaterloo email address"
    )
    .required("Email is required"),
});

export default function EmailVerifyPage() {
  const router = useRouter();

  const handleSubmit = async (values: { email: string }, { setSubmitting, setStatus }: any) => {
    try {
      const res = await fetch('http://localhost:8000/api/auth/register/send_magic_link/', {  // Updated endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      // Store email and proceed to verify page
      localStorage.setItem('registerEmail', values.email);
      router.push('/verify');
      
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-3xl font-bold mb-8">1. Enter Your UWaterloo Email</h1>
        
        <Formik
          initialValues={{ email: '' }}
          validationSchema={EmailSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form className="flex flex-col gap-4 w-96">
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="yourname@uwaterloo.ca"
                  className="w-full p-2 border rounded"
                />
                {errors.email && touched.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
              </div>

              {status && (
                <div className="text-red-500 text-sm text-center">{status}</div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting ? "Sending..." : "Send Verification Code"}
              </button>
            </Form>
          )}
        </Formik>
      </main>
    </div>
  );
}
