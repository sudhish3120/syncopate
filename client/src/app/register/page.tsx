"use client";
import React from "react";
import { Typography } from "../../../node_modules/@mui/material/index";
import Register from "../components/Register";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-l from-purple-800 to-yellow-700 h-screen flex">
      <div className="max-w-xl text-center p-20 rounded-md bg-stone-700 m-auto rounded-3xl">
        <Typography variant="h5" fontWeight={600} className="text-center" marginBottom={-1}>3. create an</Typography>
        <Typography variant="h3" className="tracking-[-1px]" marginBottom={2}>account</Typography>
        <Register />
      </div>
    </div>
  );
}
