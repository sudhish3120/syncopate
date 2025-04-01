"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "../../../node_modules/@mui/material/index";

export default function VerifyEmail() {
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem("registerEmail");
    if (!email) {
      router.push("/email-verify");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-l from-purple-800 to-yellow-700 h-screen flex">
      <div className="max-w-xl text-center p-20 bg-stone-700 m-auto rounded-3xl">
        <Typography variant="h3" className="tracking-[-1px]" marginBottom={2}>2. check your email</Typography>
        <div className="text-center space-y-4">
          <Typography>
            We&apos;ve sent a verification link to your email address.<br />
            Please check your inbox and click the link to continue.
          </Typography>
          <Typography variant="h4" className="animate-pulse text-sm mt-4">
            Waiting for verification...
          </Typography>
          <Typography className="text-sm mt-4">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => router.push("/email-verify")}
              className="text-blue-500 hover:text-blue-600"
            >
              try again
            </button>
          </Typography>
        </div>
      </div>
    </div>
  );
}
