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
    <div className="min-h-screen relative mx-auto w-full h-dvh">
      <div className="grid grid-cols-2 h-full bg-stone-900">
        <div className="bg-gradient-to-r from-purple-600 to-stone-900 break-all overflow-hidden">
          <Typography variant="h1" className="tracking-[-10px] text-transparent bg-clip-text bg-gradient-to-l from-purple-800 to-yellow-700">
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
            SYNCOPATE
          </Typography>
        </div>
        <div className="m-auto max-w-md mx-auto text-center bg-stone-700 p-20 rounded-md backdrop-blur-md">
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
    </div>
  );
}
