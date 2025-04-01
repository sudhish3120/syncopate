"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Login from "./components/Login";
import { Typography } from "../../node_modules/@mui/material/index";

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
    <div className="relative mx-auto w-screen h-screen">
      <div className="absolute t-0 left-0 h-full w-full flex">
          <div className="m-auto max-w-md text-center bg-stone-700 p-20 rounded-3xl">
            <div className="mb-4">
              <Typography fontSize={20} fontWeight={400}>
                Welcome to
              </Typography>
              <Typography variant="h3" marginTop={-1} marginBottom={3}>
                Syncopate!
              </Typography>
            </div>
            <Login />
          </div>
      </div>
      <div className="bg-gradient-to-r from-purple-600 to-stone-900 break-all overflow-hidden z-0 h-full w-full text-center">
        <Typography variant="h1" fontSize={140} className="tracking-[-10px] text-transparent bg-clip-text bg-gradient-to-l from-purple-800 to-yellow-700">
          SYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATESYNCOPATE
        </Typography>
      </div>
    </div>
  );
}
