'use client';
import React from "react";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";

interface RegisterValues {
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username too short")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required("Please confirm your password"),
});

export default function Register() {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');
  const router = useRouter();

  const handleSubmit = async (
    values: RegisterValues,
    { setSubmitting, setStatus }: FormikHelpers<RegisterValues>
  ) => {
    try {
      const email = localStorage.getItem('registerEmail');
      if (!email) {
        router.push('/email-verify');
        return;
      }

      const res = await fetch("http://localhost:8000/api/auth/register/init/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          email: email,
          password: values.password
        }),
      });

      if (res.ok) {
        const { setup_token } = await res.json();
        router.push(`/register/totp-setup?token=${setup_token}`);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ username: "", password: "", confirmPassword: "" }}
      validationSchema={RegisterSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, status }) => (
        <Form className="flex flex-col gap-4 max-w-md mx-auto mt-8">
          {verified && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
              Email verified successfully! Complete your registration below.
            </div>
          )}
          <div>
            <Field
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-2 border rounded"
            />
            {errors.username && touched.username && (
              <div className="text-red-500 text-sm">{errors.username}</div>
            )}
          </div>

          <div>
            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
            {errors.password && touched.password && (
              <div className="text-red-500 text-sm">{errors.password}</div>
            )}
          </div>

          <div>
            <Field
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-2 border rounded"
            />
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="text-red-500 text-sm">{errors.confirmPassword}</div>
            )}
          </div>

          {status && (
            <div className="text-red-500 text-center text-sm">{status}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 disabled:bg-violet-400 transition-colors duration-200"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Registering...
              </div>
            ) : (
              "Register"
            )}
          </button>

          <div className="text-center">
            <Link href="/" className="text-blue-500 hover:text-blue-600">
              Already have an account? Login
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}
