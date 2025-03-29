'use client';
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import React from "react";
import { FormikErrors, FormikTouched } from "../../../node_modules/formik/dist/types";
interface RegisterValues {
  username: string;
  password: string;
  confirmPassword: string;
  use2FA: boolean;  // Add this line
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username too short.")
    .required("Username is required."),
  password: Yup.string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Password is invalid."
    )
    .required("Password is required."),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match.')
    .required("Please confirm your password."),
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
          password: values.password,
          use2FA: values.use2FA 
        }),
      });

      if (res.ok) {
        const resJson = await res.json();
        if (resJson.user) {
          router.push('/'); 
        } else if (resJson.setup_token) {
          const { setup_token } = resJson;
          router.push(`/register/totp-setup?token=${setup_token}`);
        }
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

  const formattedPasswordError = (touched: FormikTouched<RegisterValues>, error: FormikErrors<RegisterValues>) => {
    if (touched.password && error.password == "Password is invalid.") {
      return (
        <>
          <p>Password must include at least:</p>
            <ul>
              <li>1 uppercase letter</li>
              <li>1 lowercase letter</li>
              <li>1 digit</li>
              <li>1 special character</li>
            </ul>
          <p>and is at least 8 characters long.</p>
        </>
      )
    } else if (touched.password && error.password) {
      return <>{error.password}</>
    }
  }

  return (
    <Formik
      initialValues={{ username: "", password: "", confirmPassword: "", use2FA: true }}
      validationSchema={RegisterSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, status, values, setFieldValue }) => (
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
            {errors.password && touched.password && 
              (
                <div className="text-red-500 text-sm">
                  {formattedPasswordError(touched, errors)}
                </div>
              )
}
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

          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex flex-col">
              <span className="text-white font-medium">Disable 2FA</span>
              <span className="text-gray-400 text-sm">
                Two-factor authentication adds an extra layer of security
              </span>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-black ${
                values.use2FA ? 'bg-gray-500' : 'bg-violet-600'
              }`}
              onClick={() => setFieldValue('use2FA', !values.use2FA)}
            >
              <span
                className={`${
                  values.use2FA ? 'translate-x-1' : 'translate-x-6'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </button>
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
