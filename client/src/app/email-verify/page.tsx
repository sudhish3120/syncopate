'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { Typography } from '../../../node_modules/@mui/material/index';

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

  const handleSubmit = async (values: { email: string }, { setSubmitting, setStatus }: { setSubmitting: (isSubmitting: boolean) => void, setStatus: (status?: string) => void }) => {

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
    <div className="h-full">
      <div className="absolute bg-gradient-to-l from-purple-800 to-yellow-700 h-screen flex">
        <div className="max-w-xl text-center p-20 rounded-md bg-stone-700 m-auto rounded-3xl">
          <Typography variant="h5" fontWeight={600} className="text-center" marginBottom={-1}>1. enter your</Typography>
          <Typography variant="h3" className="tracking-[-1px]" marginBottom={2}>uWaterloo email</Typography>
          <Formik
            initialValues={{ email: '' }}
            validationSchema={EmailSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, status }) => (
              <Form className="flex flex-col gap-4">
                <div>
                  <Field
                    type="email"
                    name="email"
                    placeholder="yourname@uwaterloo.ca"
                    className="w-full p-2 border rounded bg-white text-gray-900"
                  />
                  {errors.email && touched.email && (
                    <Typography className="text-red-500" fontWeight={800} marginTop={1}>{errors.email}</Typography>
                  )}
                </div>

                {status && (
                  <Typography className="text-red-500" fontWeight={800} marginTop={1}>{status}</Typography>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 disabled:bg-violet-400 transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}
