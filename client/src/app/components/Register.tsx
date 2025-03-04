'use client';
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRouter } from 'next/navigation';
import Link from "next/link";

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username too short")
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required("Please confirm your password"),
});

export default function Register() {
  const router = useRouter();

  const handleSubmit = async (
    values: RegisterValues,
    { setSubmitting, setStatus }: FormikHelpers<RegisterValues>
  ) => {
    try {
      // Store registration data for later use
      localStorage.setItem('registrationData', JSON.stringify({
        username: values.username,
        email: values.email,
        password: values.password
      }));

      // Request verification code
      const res = await fetch("http://localhost:8000/api/auth/register/send_verification_code/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      });

      if (res.ok) {
        router.push('/verify');
      } else {
        const data = await res.json();
        setStatus(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      console.error("Registration error:", error);
      setStatus('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
      validationSchema={RegisterSchema}
      onSubmit={handleSubmit}
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
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
            {errors.email && touched.email && (
              <div className="text-red-500 text-sm">{errors.email}</div>
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
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Registering..." : "Register"}
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
