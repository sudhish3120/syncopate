'use client';
import { useState } from "react";
import { redirect } from "next/navigation";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        redirect("/login");
        return;
      }

      const response = await fetch("http://localhost:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("token");
      redirect("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
