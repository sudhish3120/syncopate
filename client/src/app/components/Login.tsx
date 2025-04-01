import { useRouter } from "next/navigation";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import React, { useState } from "react";
import { Typography } from "../../../node_modules/@mui/material/index";

interface LoginValues {
  username: string;
  password: string;
  totp_code: string; // Changed from optional to required
}

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(5, "Username too short")
    .required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  totp_code: Yup.string() // Add validation for totp_code
    .when("$requiresTotp", {
      is: true,
      then: (schema) =>
        schema
          .matches(/^\d{6}$/, "Must be exactly 6 digits")
          .required("TOTP code required"),
      otherwise: (schema) => schema,
    }),
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
        credentials: "include",
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          ...(values.totp_code && { totp_code: values.totp_code }),
        }),
      });

      const data = await res.json();

      if (res.status === 401 && data.requires_totp) {
        setRequiresTotp(true);
        setStatus(data.message);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setStatus(error instanceof Error ? error.message : "Login failed");
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
      context={{ requiresTotp }} // Add context for conditional validation
    >
      {({ errors, touched, isSubmitting, status }) => (
        <Form className="flex flex-col gap-4 w-full max-w-md">
          <div>
            <Field
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-2 border rounded bg-white text-gray-900"
            />
            {errors.username && touched.username && (
              <Typography className="text-red-500" fontWeight={800} marginTop={1}>{errors.username}</Typography>
            )}
          </div>

          <div>
            <Field
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-2 border rounded bg-white text-gray-900"
            />
            {errors.password && touched.password && (
              <Typography className="text-red-500" fontWeight={800} marginTop={1}>{errors.password}</Typography>
            )}
          </div>

          {requiresTotp && (
            <div>
              <Field
                type="text"
                name="totp_code"
                placeholder="Enter 6-digit authenticator code"
                className="w-full p-2 border rounded bg-white text-gray-900"
              />
              {errors.totp_code && touched.totp_code && (
                <Typography className="text-red-500" fontWeight={800} marginTop={1}>{errors.totp_code}</Typography>
              )}
              {status && (<Typography className="text-red-500" fontWeight={800} marginTop={1}>{status}</Typography>)}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 disabled:bg-violet-400 transition-colors duration-200"
          >
            {isSubmitting ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {requiresTotp ? "Verifying 2FA..." : "Logging in..."}
              </div>
            ) : requiresTotp ? (
              "Verify 2FA"
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center">
            <Link
              href="/email-verify"
              className="text-blue-300 hover:text-blue-600"
            >
              New to Syncopate? Create Account
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  );
}
