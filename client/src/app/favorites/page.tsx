"use client";
import React, { useEffect, useState } from "react";
import ConcertCard from "../components/ConcertCard";
import Nav from "../components/Nav";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Concert } from "../types/concerts";
import SessionExpired from "../components/SessionExpired";

export default function Favorites() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Array<Concert> | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/user/", {
          credentials: "include",
        });

        if (res.status === 401) {
          setError("session-expired");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const getFavorites = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/concerts/favorites",
          {
            method: "GET",
            credentials: "include",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch db concerts");
        }
        const data = await res.json();
        setFavorites(data["concerts"]);
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
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error === "session-expired") {
    return <SessionExpired />;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="font-sans bg-black relative pt-20">
      <Nav />
      <main className="container mx-auto  py-8 px-8 h-screen relative">
        <section className="mb-8 flex justify-between">
          <h2 className="text-3xl font-md text-white mb-4">Favorites</h2>
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <div className="flex flex-row justify-between border bg-white border-gray-300 rounded-full px-4 py-1 pl-6 w-80 focus:outline-none focus:border-blue-500">
                <input
                  type="text"
                  placeholder="Search for Concerts"
                  className="w-full text-gray-600 border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <FaMagnifyingGlass
                  size={32}
                  className="inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-300"
                />
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {favorites?.map((favorite) => (
            <ConcertCard
              key={favorite.id}
              id={favorite.id}
              title={favorite.name}
              date={new Date(
                favorite.dates.start.localDate
              ).toLocaleDateString()}
              imageUrl={
                favorite.images.reduce((largest, image) => {
                  return image.width * image.height >
                    largest.width * largest.height
                    ? image
                    : largest;
                }, favorite.images[0]).url
              }
            />
          ))}{" "}
        </div>
      </main>
    </div>
  );
}
