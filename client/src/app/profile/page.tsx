"use client";
import React, { useEffect, useState } from "react";
import Nav from "../components/Nav";
import UpdateModal from "../components/UpdateModal";
import SessionExpired from "../components/SessionExpired";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: 'include',
        });
        
        if (res.status === 401) {
          setError('session-expired');
          return;
        }
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setError('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error === 'session-expired') {
    return <SessionExpired />;
  }

  return (
    <div className="font-sans bg-black relative pt-20">
      <Nav />
      <div className="container mx-auto p-4">
        <h1 className="text-white text-2xl mb-4">Edit Profile</h1>
        <UpdateModal />
      </div>
    </div>
  );
}
