"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Nav from "../components/Nav";
import { Avatar } from "@mui/material";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
];

const UpdateModal = ({}) => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    profile_photo: "",
    favoriteArtist: "",
    favoriteSong: "",
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
            <Avatar
              className="w-32 h-32 justify-center"
              src="/static/images/avatar/2.jpg"
            />
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
                className="w-full p-2 rounded bg-black text-white cursor-not-allowed"
                disabled={true}
              />
            </div>
            <div className="mb-4">
              <label className="block text-white mb-2" htmlFor="favoriteArtist">
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
                favorite Song
              </label>
              <input
                type="text"
                id="favoriteSong"
                name="favoriteSong"
                value={user.favoriteSong}
                onChange={handleChange}
                className="w-full p-2 rounded bg-black text-white cursor-not-allowed"
                disabled={true}
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
  );
};

export default UpdateModal;
