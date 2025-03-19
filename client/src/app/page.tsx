"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./components/Login";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: 'include',
        });
        
        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          console.log(data);
          router.replace('/dashboard'); // Use replace instead of push
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Loading spinner
  if (isLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Login page
  return (
    <div className="min-h-screen bg-black relative pt-20">
      <main className="container mx-auto py-8 px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold mb-8 text-white">Welcome to Syncopate!</h1>
          <Login />
        </div>
      </main>
    </div>
  );
}
