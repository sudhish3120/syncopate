import { useRouter } from 'next/navigation';
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useState } from 'react';

interface LoginValues {
  username: string;
  password: string;
  totp_code: string;  // Changed from optional to required
}

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username too short")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  totp_code: Yup.string()  // Add validation for totp_code
    .when('$requiresTotp', {
      is: true,
      then: (schema) => schema.matches(/^\d{6}$/, 'Must be exactly 6 digits').required('TOTP code required'),
      otherwise: (schema) => schema
    })
});

export default function Login() {
  const router = useRouter();
  const [requiresTotp, setRequiresTotp] = useState(false);

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting, setStatus }: FormikHelpers<LoginValues>
  ) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          ...(values.totp_code && { totp_code: values.totp_code })
        }),
      });

      const data = await res.json();

      if (res.status === 401 && data.requires_totp) {
        setRequiresTotp(true);
        setStatus(data.message);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      
    } catch (error) {
      console.error('Login error:', error);
      setStatus(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ username: "", password: "", totp_code: "" }}
      validationSchema={LoginSchema}
      onSubmit={handleSubmit}
      validateOnChange={true}
      context={{ requiresTotp }}  // Add context for conditional validation
    >
      {({ errors, touched, isSubmitting, status }) => (
        <Form className="flex flex-col gap-4 max-w-md mx-auto mt-8">
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

          {requiresTotp && (
            <div>
              <Field
                type="text"
                name="totp_code"
                placeholder="Enter 6-digit authenticator code"
                className="w-full p-2 border rounded"
              />
            {errors.totp_code && touched.totp_code && (
                <div className="text-red-500 text-sm">{errors.totp_code}</div>
              )}
            </div>
          )}

          {status && (
            <div className="text-red-500 text-center text-sm">{status}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="text-center">
            <Link href="/email-verify" className="text-blue-500 hover:text-blue-600">
              New to Syncopate? Create Account
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}
