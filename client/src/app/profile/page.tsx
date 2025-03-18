"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Nav from "../components/Nav";
import UpdateModal from "../components/UpdateModal";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
];

export default function Profile() {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profile_photo: "",
  });
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirect("/login");
      return;
    }
    setToken(token);

    // Fetch user profile
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/profile/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleAvatarSelect = (avatar: string) => {
    setUser({ ...user, profile_photo: avatar });
  };

  // not real yet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        throw new Error("Failed to update profile");
      }
      const data = await res.json();
      setUser(data);
      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };

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
