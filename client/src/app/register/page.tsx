"use client";
import Register from "../components/Register";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-black relative pt-20">
      <main className="container mx-auto py-8 px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8 text-white">3. Create an Account</h1>
          <Register />
        </div>
      </main>
    </div>
  );
}
