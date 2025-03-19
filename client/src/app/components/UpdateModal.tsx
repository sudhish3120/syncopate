"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@mui/material";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
];

export interface UserData {
  id: number;
  username: string;
  email?: string;
  profile_photo?: string;
  favoriteArtist?: string;
  favoriteSong?: string;
}

const UpdateModal = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: "include",
        });

        if (res.ok) {
          setIsAuthenticated(true);
          const data = await res.json();
          setUser(data.user);
          console.log(data.user);
          router.replace("/profile"); // Use replace instead of push
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  // not real yet
  const handleSubmit = async () => {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value } as UserData);
  };

  const handleAvatarSelect = (avatar: string) => {
    setUser({ ...user, profile_photo: avatar } as UserData);
  };

  return (
    isAuthenticated &&
    !isLoading &&
    user && (
      <form onSubmit={handleSubmit} className="bg-space_black p-4 rounded">
        <div className="flex flex-row items-center">
          <div className="w-1/3 justify-items-center">
            {user.profile_photo ? (
              <img
                src={user.profile_photo}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mx-auto"
              />
            ) : (
              <Avatar className="w-32 h-32 justify-center" />
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {avatars.map((avatar) => (
                <img
                  key={avatar}
                  src={avatar}
                  alt="Avatar"
                  className={`w-16 h-16 rounded-full cursor-pointer ${
                    user.profile_photo === avatar
                      ? "border-4 border-violet-600"
                      : ""
                  }`}
                  onClick={() => handleAvatarSelect(avatar)}
                />
              ))}
            </div>
          </div>
          <div className="w-2/3 pl-4 flex flex-col">
            <div>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-black text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-neutral-900 text-white cursor-not-allowed"
                  disabled={true}
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-white mb-2"
                  htmlFor="favoriteArtist"
                >
                  Favorite Artist
                </label>
                <input
                  type="text"
                  id="favoriteArtist"
                  name="favoriteArtist"
                  value={user.favoriteArtist}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-black text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2" htmlFor="favoriteSong">
                  Favorite Song
                </label>
                <input
                  type="text"
                  id="favoriteSong"
                  name="favoriteSong"
                  value={user.favoriteSong}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-black text-white"
                />
              </div>
              <button
                type="submit"
                className=" bg-violet-600 text-white py-2 px-4 rounded hover:bg-violet-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>
    )
  );
};

export default UpdateModal;
