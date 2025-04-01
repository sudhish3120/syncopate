"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@mui/material";
import { UserData, Artist, Genre } from "../types/concerts";
import Toast from "./Toast";
import * as Yup from "yup";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
];

const academicTerms = [
  "1A",
  "1B",
  "2A",
  "2B",
  "3A",
  "3B",
  "4A",
  "4B",
  "Masters",
  "Graduate",
  "PhD",
  "Undergraduate",
  "Exchange Student",
  "Prefer not to say",
];

const faculties = [
  "Arts",
  "Engineering",
  "Environment",
  "Health",
  "Mathematics",
  "Science",
];

const UpdateSchema = Yup.object().shape({
  favoriteArtists: Yup.array().of(
    Yup.string()
      .trim()
      .matches(/^[a-zA-Z0-9\s&'-]{0,50}$/, "Contains invalid characters")
      .max(50, "Artist name too long")
  ),
  favoriteGenres: Yup.array().of(
    Yup.string()
      .trim()
      .matches(/^[a-zA-Z0-9\s&'-]{0,30}$/, "Contains invalid characters")
      .max(30, "Genre name too long")
  ),
});

const UpdateModal = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteArtists, setFavoriteArtists] = useState<string[]>([""]);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([""]);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [showToast, setShowToast] = useState(false);

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

          // Initialize artists and genres from profile
          if (data.user.profile) {
            setFirstName(data.user.profile.first_name);
            setLastName(data.user.profile.last_name);
            setFavoriteArtists(
              data.user.profile.favorite_artists.length > 0
                ? data.user.profile.favorite_artists.map((a: Artist) => a.name)
                : [""]
            );
            setFavoriteGenres(
              data.user.profile.favorite_genres.length > 0
                ? data.user.profile.favorite_genres.map((g: Genre) => g.name)
                : [""]
            );
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const addArtist = () => {
    if (favoriteArtists.length < 3) {
      setFavoriteArtists([...favoriteArtists, ""]);
    }
  };

  const addGenre = () => {
    if (favoriteGenres.length < 3) {
      setFavoriteGenres([...favoriteGenres, ""]);
    }
  };

  const handleArtistChange = (index: number, value: string) => {
    const newArtists = [...favoriteArtists];
    newArtists[index] = value;
    setFavoriteArtists(newArtists);
  };

  const handleGenreChange = (index: number, value: string) => {
    const newGenres = [...favoriteGenres];
    newGenres[index] = value;
    setFavoriteGenres(newGenres);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const nonEmptyArtists = favoriteArtists.filter((artist) => artist.trim());
      const nonEmptyGenres = favoriteGenres.filter((genre) => genre.trim());

      // Validate data before sending
      await UpdateSchema.validate({
        favoriteArtists: nonEmptyArtists,
        favoriteGenres: nonEmptyGenres,
      });

      const payload: any = {
        profile_photo: user?.profile.profile_photo,
        favorite_artists: nonEmptyArtists,
        favorite_genres: nonEmptyGenres,
        first_name: firstName,
        last_name: lastName,
      };

      // Add term and faculty only if they are not "Not selected"
      if (user?.profile.term && user.profile.term !== "Not selected") {
        payload.term = user.profile.term;
      }
      if (user?.profile.faculty && user.profile.faculty !== "Not selected") {
        payload.faculty = user.profile.faculty;
      }

      const res = await fetch(
        "http://localhost:8000/api/auth/update-profile/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      setUser(data.user);
      setShowToast(true);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    if (user) {
      setUser({
        ...user,
        profile: {
          ...user.profile,
          profile_photo: avatar,
        },
      });
    }
  };

  return (
    <>
      {isAuthenticated && !isLoading && user && (
        <form onSubmit={handleSubmit} className="bg-space_black p-4 rounded">
          <div className="flex flex-row items-start">
            <div className="w-1/3 justify-items-center">
              {user.profile ? (
                <img
                  src={user.profile.profile_photo}
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
                      user?.profile?.profile_photo === avatar
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
                    readOnly
                    className="w-full p-2 rounded bg-neutral-900 text-white cursor-not-allowed"
                    disabled={true}
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
                    readOnly
                    className="w-full p-2 rounded bg-neutral-900 text-white cursor-not-allowed"
                    disabled={true}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="username">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                    }}
                    className="w-full p-2 rounded bg-black text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="username">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                    }}
                    className="w-full p-2 rounded bg-black text-white"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="faculty">
                    Faculty
                  </label>
                  <select
                    id="faculty"
                    name="faculty"
                    value={user.profile?.faculty || ""}
                    onChange={(e) => {
                      if (user) {
                        setUser({
                          ...user,
                          profile: {
                            ...user.profile,
                            faculty: e.target.value,
                          },
                        });
                      }
                    }}
                    className="w-full p-2 rounded bg-black text-white"
                  >
                    <option value="" disabled>
                      Select Faculty
                    </option>
                    {faculties.map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2" htmlFor="term">
                    Academic Term
                  </label>
                  <select
                    id="term"
                    name="term"
                    value={user.profile?.term || ""}
                    onChange={(e) => {
                      if (user) {
                        setUser({
                          ...user,
                          profile: {
                            ...user.profile,
                            term: e.target.value,
                          },
                        });
                      }
                    }}
                    className="w-full p-2 rounded bg-black text-white"
                  >
                    <option value="" disabled>
                      Select Term
                    </option>
                    {academicTerms.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-white mb-2">
                    Favorite Artists (max 3)
                  </label>
                  {favoriteArtists.map((artist, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={artist}
                        onChange={(e) =>
                          handleArtistChange(index, e.target.value)
                        }
                        className="w-full p-2 rounded bg-black text-white"
                        placeholder="Enter artist name"
                      />
                    </div>
                  ))}
                  {favoriteArtists.length < 3 && (
                    <button
                      type="button"
                      onClick={addArtist}
                      className="mt-2 text-violet-400 hover:text-violet-300"
                    >
                      + Add Artist
                    </button>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-white mb-2">
                    Favorite Genres (max 3)
                  </label>
                  {favoriteGenres.map((genre, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={genre}
                        onChange={(e) =>
                          handleGenreChange(index, e.target.value)
                        }
                        className="w-full p-2 rounded bg-black text-white"
                        placeholder="Enter genre"
                      />
                    </div>
                  ))}
                  {favoriteGenres.length < 3 && (
                    <button
                      type="button"
                      onClick={addGenre}
                      className="mt-2 text-violet-400 hover:text-violet-300"
                    >
                      + Add Genre
                    </button>
                  )}
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
      )}
      {showToast && (
        <Toast
          message="Profile updated successfully!"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default UpdateModal;
