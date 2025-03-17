"use client";
import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import ConcertCard from "../components/ConcertCard";
import Nav from "../components/Nav";
import getConfig from "next/config";

interface UserData {
  user: {
    id: number;
    username: string;
  };
  status: string;
}

interface Artist {
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
  address: string;
}

interface Concert {
  id: number;
  name: string;
  artist: Artist;
  venue: Venue;
  date: string;
  url: string;
}

export default function Favorites() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Array<Concert> | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      redirect("/login");
      return;
    }
  }, []);

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const t = localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:8000/api/concerts/db_favorites",
          {
            method: "GET",
            headers: {
              Authorization: `Token ${t}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch db concerts");
        }
        const concerts = await res.json();
        console.log(concerts);
        setFavorites(concerts);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getFavorites();
  }, []);
  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="font-sans bg-gradient-to-l from-syncopate_primary via-syncopate_secondary to-syncopate_accent bg-opacity-100 relative">
      <div className="absolute inset-0 bg-white opacity-40"></div>
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <section className="mb-8 flex justify-between">
          <h2 className="text-3xl font-semibold text-black mb-4">Favorites</h2>
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for Concerts"
                className="border border-gray-300 rounded-full px-4 py-2 pl-6 w-80 focus:outline-none focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-4 gap-4">
          {favorites?.slice(0, 4).map((favorite) => (
            <ConcertCard
              key={favorite.id}
              id={favorite.id}
              title={favorite.name}
              date={new Date(favorite.date).toLocaleDateString()}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
