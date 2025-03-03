import { useRouter } from 'next/navigation';
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";

interface LoginValues {
  username: string;
  password: string;
}

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(2, "Username too short")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const router = useRouter();

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
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
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
      initialValues={{ username: "", password: "" }}
      validationSchema={LoginSchema}
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
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded"
            />
            {errors.password && touched.password && (
              <div className="text-red-500 text-sm">{errors.password}</div>
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
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="text-center">
            <Link href="/register" className="text-blue-500 hover:text-blue-600">
              New to Syncopate? Register
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}
